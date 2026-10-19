import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify, SignJWT } from 'jose';

/** Shared signing and verification for dashboard session cookies. */
@Injectable()
export class SessionService {
  readonly cookieName = 'mcp_user_session';
  readonly issuer: string;
  private readonly key: Uint8Array;

  constructor(private readonly config: ConfigService) {
    this.issuer = this.config.getOrThrow<string>('MCP_BASE_URL');

    const secret = this.config.getOrThrow<string>('MCP_AUTH_SECRET');

    if (secret.length < 32) {
      throw new Error('MCP_AUTH_SECRET must contain at least 32 characters.');
    }

    this.key = new TextEncoder().encode(secret);
  }

  /** Signs a short-lived dashboard session for a Google account. */
  sign(subject: string): Promise<string> {
    return new SignJWT({ role: 'user' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer(this.issuer)
      .setAudience(`${this.issuer}/dashboard`)
      .setSubject(subject.toLowerCase())
      .setIssuedAt()
      .setExpirationTime('12h')
      .sign(this.key);
  }

  /** Resolves a valid session token to its account identifier. */
  async user(token?: string): Promise<string | null> {
    if (!token) return null;

    try {
      const { payload } = await jwtVerify(token, this.key, {
        issuer: this.issuer,
        audience: `${this.issuer}/dashboard`,
        algorithms: ['HS256'],
      });

      return payload.role === 'user' && typeof payload.sub === 'string'
        ? payload.sub
        : null;
    } catch {
      return null;
    }
  }

  /** Requires a valid session token and returns its account identifier. */
  async requireUser(token?: string): Promise<string> {
    const userId = await this.user(token);

    if (!userId) {
      throw new UnauthorizedException('A valid signed-in session is required.');
    }

    return userId;
  }
}
