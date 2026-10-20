import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import { google } from 'googleapis';
import { PrismaService } from '../../../prisma/prisma.service';
import type { GoogleProfile } from '../interfaces/google-profile.interface';
import { OAuthClientService } from './oauth-client.service';
import { GoogleTokensService } from './google-tokens.service';

@Injectable()
export class GoogleOAuthCallbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly oauthClientService: OAuthClientService,
    private readonly googleTokensService: GoogleTokensService,
  ) {}

  async execute(code: string): Promise<GoogleProfile> {
    const client = this.oauthClientService.execute();
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

    const previousTokens = await this.googleTokensService.execute(email);
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
}
