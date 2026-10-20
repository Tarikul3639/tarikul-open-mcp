import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuthClientService } from './oauth-client.service';
import { GoogleTokensService } from './google-tokens.service';

@Injectable()
export class GoogleCalendarClientService {
  constructor(
    private readonly oauthClientService: OAuthClientService,
    private readonly googleTokensService: GoogleTokensService,
  ) {}

  async execute(userId: string) {
    const tokens = await this.googleTokensService.execute(userId);
    if (!tokens) throw new Error('Google account is not connected.');

    const client = this.oauthClientService.execute();
    client.setCredentials({ ...tokens, scope: tokens.scope ?? undefined });

    return google.calendar({ version: 'v3', auth: client });
  }
}
