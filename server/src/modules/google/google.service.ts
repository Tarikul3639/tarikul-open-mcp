import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@generated/prisma/client';
import { google } from 'googleapis';
import { PrismaService } from '../../prisma/prisma.service';

export interface GoogleProfile {
  name: string;
  email: string;
  picture: string | null;
}

/** Integrates with Google OAuth and manages stored Google account credentials. */
@Injectable()
export class GoogleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private oauth(): InstanceType<typeof google.auth.OAuth2> {
    const redirectUris = this.config.getOrThrow<string[]>(
      'GOOGLE_REDIRECT_URIS',
    );

    return new google.auth.OAuth2(
      this.config.get<string>('GOOGLE_CLIENT_ID'),
      this.config.get<string>('GOOGLE_CLIENT_SECRET'),
      redirectUris[0],
    );
  }

  /** Builds the Google consent URL for the supplied CSRF state. */
  loginUrl(state: string): string {
    return this.oauth().generateAuthUrl({
      access_type: 'offline',
      prompt: 'select_account',
      state,
      scope: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/calendar',
      ],
    });
  }

  /** Exchanges a Google authorization code, retrieves the profile, and saves credentials. */
  async callback(code: string): Promise<GoogleProfile> {
    const client = this.oauth();
    const { tokens } = await client.getToken(code);
    client.setCredentials({ ...tokens, scope: tokens.scope ?? undefined });

    const { data } = await google
      .oauth2({ version: 'v2', auth: client })
      .userinfo.get();

    const email = data.email?.trim().toLowerCase();
    if (!email) throw new Error('Google did not provide an account email.');

    const profile: GoogleProfile = {
      name: data.name ?? email,
      email,
      picture: data.picture ?? null,
    };

    const previousTokens = await this.getTokens(email);
    const storedTokens: Prisma.InputJsonObject = {
      access_token: tokens.access_token ?? previousTokens?.access_token ?? null,
      refresh_token:
        tokens.refresh_token ?? previousTokens?.refresh_token ?? null,
      expiry_date: tokens.expiry_date ?? previousTokens?.expiry_date ?? null,
      scope: tokens.scope ?? previousTokens?.scope ?? null,
    };

    await this.prisma.googleCalendarAccount.upsert({
      where: { userId: email },
      create: { userId: email, ...profile, tokens: storedTokens },
      update: { ...profile, tokens: storedTokens },
    });

    return profile;
  }

  /** Returns the stored public profile for an account. */
  getProfile(userId: string) {
    return this.prisma.googleCalendarAccount.findUnique({
      where: { userId },
      select: { name: true, email: true, picture: true },
    });
  }

  /** Returns the stored Google OAuth tokens for an account. */
  async getTokens(userId: string) {
    const account = await this.prisma.googleCalendarAccount.findUnique({
      where: { userId },
      select: { tokens: true },
    });

    if (
      !account?.tokens ||
      typeof account.tokens !== 'object' ||
      Array.isArray(account.tokens)
    ) {
      return null;
    }

    return account.tokens as {
      access_token?: string | null;
      refresh_token?: string | null;
      expiry_date?: number | null;
      scope?: string | null;
    };
  }

  /** Deletes the Google account record for an account. */
  async disconnect(userId: string): Promise<{ count: number }> {
    return this.prisma.googleCalendarAccount.deleteMany({ where: { userId } });
  }

  /** Revokes a stored Google token when one is available. */
  async revoke(userId: string): Promise<void> {
    const tokens = await this.getTokens(userId);
    const token = tokens?.refresh_token ?? tokens?.access_token;
    if (!token) return;

    try {
      await this.oauth().revokeToken(token);
    } catch (error) {
      console.warn('Google token revoke failed.', error);
    }
  }

  /** Creates a Google Calendar API client with stored account credentials. */
  async calendar(userId: string) {
    const tokens = await this.getTokens(userId);
    if (!tokens) throw new Error('Google account is not connected.');

    const client = this.oauth();
    client.setCredentials({ ...tokens, scope: tokens.scope ?? undefined });

    return google.calendar({ version: 'v3', auth: client });
  }
}
