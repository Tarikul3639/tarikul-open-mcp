import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { PrismaService } from '../../../prisma/prisma.service.js';
import { AccessTokenService } from '../services/access-token.service.js';

export interface BearerTokenIdentity {
  userId: string;
  clientId: string;
  token: string;
}

export type BearerTokenResult =
  | { ok: true; identity: BearerTokenIdentity }
  | { ok: false; reason: 'missing_token' | 'invalid_token' };

@Injectable()
export class BearerTokenStrategy {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Verifies a Bearer token without throwing. Used by the HTTP middleware
   * in front of /mcp so it can answer with a proper 401 + WWW-Authenticate.
   *
   * Besides the JWT signature/expiry, the user's grant for the client is
   * checked so that revoking a client in the dashboard takes effect
   * immediately instead of after the access token expires.
   */
  async verify(authorization?: string): Promise<BearerTokenResult> {
    const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];

    if (!token) {
      return { ok: false, reason: 'missing_token' };
    }

    let identity: { userId: string; clientId: string };

    try {
      identity = await this.accessTokenService.verify(token);
    } catch {
      return { ok: false, reason: 'invalid_token' };
    }

    const grant = await this.prisma.mcpClientAccess.findUnique({
      where: {
        userId_clientId: {
          userId: identity.userId,
          clientId: identity.clientId,
        },
      },
      select: { revokedAt: true },
    });

    if (!grant || grant.revokedAt) {
      return { ok: false, reason: 'invalid_token' };
    }

    return { ok: true, identity: { ...identity, token } };
  }

  /**
   * Throwing variant used by the MCP guard.
   */
  async authenticate(authorization?: string): Promise<BearerTokenIdentity> {
    const result = await this.verify(authorization);

    if (!result.ok) {
      throw new RpcException(
        result.reason === 'missing_token'
          ? 'Bearer token is required'
          : 'Invalid, expired, or revoked access token',
      );
    }

    return result.identity;
  }
}
