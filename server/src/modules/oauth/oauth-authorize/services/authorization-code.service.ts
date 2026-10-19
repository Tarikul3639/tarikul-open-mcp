import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { McpAuthorizationCode } from '@/../../generated/prisma/client';
import type { ConsumeAuthorizationCodeDto } from '../dto/consume-authorization-code.dto';
import type { CreateAuthorizationCodeDto } from '../dto/create-authorization-code.dto';
import type { ConsumedAuthorizationCodeResponseDto } from '../dto/oauth-authorization-code-response.dto';

@Injectable()
export class AuthorizationCodeService {
  constructor(private readonly prisma: PrismaService) {}

  /** Persists a short-lived PKCE authorization code. */
  async create(
    data: CreateAuthorizationCodeDto,
  ): Promise<McpAuthorizationCode> {
    await this.prisma.mcpAuthorizationCode.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    return this.prisma.mcpAuthorizationCode.create({
      data: {
        code: data.code,
        clientId: data.clientId,
        userId: data.userId,
        redirectUri: data.redirectUri,
        codeChallenge: data.codeChallenge,
        codeChallengeMethod: 'S256',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
  }

  /** Consumes a code for an authenticated dashboard account. */
  async consume(
    data: ConsumeAuthorizationCodeDto,
  ): Promise<ConsumedAuthorizationCodeResponseDto | null> {
    const token = await this.prisma.mcpAuthorizationCode.findFirst({
      where: {
        code: data.code,
        userId: data.userId,
        clientId: data.clientId,
        redirectUri: data.redirectUri,
        codeChallenge: data.codeChallenge,
        codeChallengeMethod: 'S256',
        expiresAt: { gt: new Date() },
      },
      select: {
        code: true,
        userId: true,
        clientId: true,
        redirectUri: true,
        codeChallenge: true,
      },
    });

    if (!token) {
      return null;
    }

    const result = await this.prisma.mcpAuthorizationCode.deleteMany({
      where: {
        code: token.code,
        userId: data.userId,
        clientId: data.clientId,
        redirectUri: data.redirectUri,
        codeChallenge: data.codeChallenge,
        codeChallengeMethod: 'S256',
        expiresAt: { gt: new Date() },
      },
    });

    if (result.count !== 1) {
      return null;
    }

    return {
      userId: token.userId,
      clientId: token.clientId,
      redirectUri: token.redirectUri,
      codeChallenge: token.codeChallenge,
    };
  }

  /** Atomically consumes a code during OAuth token exchange. */
  async consumeForToken(data: {
    code: string;
    clientId: string;
    redirectUri: string;
    codeChallenge: string;
  }): Promise<ConsumedAuthorizationCodeResponseDto | null> {
    const token = await this.prisma.mcpAuthorizationCode.findFirst({
      where: {
        code: data.code,
        clientId: data.clientId,
        redirectUri: data.redirectUri,
        codeChallenge: data.codeChallenge,
        codeChallengeMethod: 'S256',
        expiresAt: { gt: new Date() },
      },
      select: {
        code: true,
        userId: true,
        clientId: true,
        redirectUri: true,
        codeChallenge: true,
      },
    });
    if (!token) return null;

    const deleted = await this.prisma.mcpAuthorizationCode.deleteMany({
      where: {
        code: token.code,
        clientId: data.clientId,
        redirectUri: data.redirectUri,
        codeChallenge: data.codeChallenge,
        codeChallengeMethod: 'S256',
        expiresAt: { gt: new Date() },
      },
    });
    if (deleted.count !== 1) return null;

    return {
      userId: token.userId,
      clientId: token.clientId,
      redirectUri: token.redirectUri,
      codeChallenge: token.codeChallenge,
    };
  }
}
