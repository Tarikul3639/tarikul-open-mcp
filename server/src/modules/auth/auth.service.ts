import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { SessionService } from '../../common/session/session.service';
import { GoogleService } from '../google/google.service';
import { PrismaService } from '../../prisma/prisma.service';

/** Owns Google sign-in callbacks and authenticated dashboard workflows. */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleService: GoogleService,
    private readonly sessionService: SessionService,
  ) {}

  /** Public issuer used to construct dashboard redirects. */
  get issuer(): string {
    return this.sessionService.issuer;
  }

  /** Cookie name used to read and clear dashboard sessions. */
  get sessionCookie(): string {
    return this.sessionService.cookieName;
  }

  /** Creates a CSRF state and the Google sign-in URL. */
  startGoogleLogin(): { state: string; url: string } {
    const state = randomBytes(32).toString('hex');
    return { state, url: this.googleService.loginUrl(state) };
  }

  /** Exchanges a validated Google callback and creates a dashboard session. */
  async completeGoogleLogin(input: {
    code?: string;
    state?: string;
    expectedState?: string;
    error?: string;
  }): Promise<{ sessionToken: string } | null> {
    if (
      input.error ||
      !input.code ||
      !input.state ||
      !input.expectedState ||
      input.state !== input.expectedState
    ) {
      return null;
    }

    try {
      const user = await this.googleService.callback(input.code);
      return { sessionToken: await this.sessionService.sign(user.email) };
    } catch (error) {
      console.error('Google OAuth callback failed', error);
      return null;
    }
  }

  /** Resolves a dashboard session to its account identifier. */
  sessionUser(token?: string): Promise<string | null> {
    return this.sessionService.user(token);
  }

  /** Requires a valid dashboard session and returns its account identifier. */
  requireSession(token?: string): Promise<string> {
    return this.sessionService.requireUser(token);
  }

  /** Returns the profile for a valid dashboard session. */
  async getSessionProfile(token?: string) {
    const userId = await this.sessionUser(token);
    if (!userId) return null;
    return this.googleService.getProfile(userId);
  }

  /** Loads the Google profile for an authenticated account identifier. */
  getProfile(userId: string) {
    return this.googleService.getProfile(userId);
  }

  /** Revokes Google credentials and clears grants and tokens on disconnect. */
  async disconnectGoogleAccount(userId: string): Promise<void> {
    await this.googleService.revoke(userId);
    await this.prisma.$transaction(async (transaction) => {
      await transaction.mcpOauthGrant.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await transaction.mcpRefreshToken.deleteMany({ where: { userId } });
      await transaction.mcpAuthorizationCode.deleteMany({ where: { userId } });
      await transaction.googleCalendarAccount.deleteMany({ where: { userId } });
    });
  }
}
