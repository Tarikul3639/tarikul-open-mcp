import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Hashes the session token before database storage.
   * Raw session tokens should never be persisted.
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Creates a cryptographically secure session with a 7-day lifetime.
   * Only the token hash is stored in the database; the raw token
   * is returned once so it can be delivered through a secure cookie.
   */
  async createSession(userId: string): Promise<{
    token: string;
    expiresAt: Date;
  }> {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.authSession.create({
      data: {
        userId,
        tokenHash: this.hashToken(token),
        expiresAt,
      },
    });

    return { token, expiresAt };
  }

  /**
   * Validates a session against its stored hash, expiration,
   * and revocation status.
   *
   * @throws UnauthorizedException when the session is invalid,
   * expired, or revoked.
   */
  async validateSession(token: string): Promise<{
    userId: string;
    expiresAt: Date;
  }> {
    const session = await this.prisma.authSession.findUnique({
      where: {
        tokenHash: this.hashToken(token),
      },
      select: {
        userId: true,
        expiresAt: true,
        revokedAt: true,
      },
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return {
      userId: session.userId,
      expiresAt: session.expiresAt,
    };
  }

  /**
   * Revokes an active session so it can no longer be validated.
   * Uses updateMany to safely handle missing or already-revoked sessions.
   */
  async revokeSession(token: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: {
        tokenHash: this.hashToken(token),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
