import { Injectable } from '@nestjs/common';
import { OAuthClientService } from './oauth-client.service';
import { GoogleTokensService } from './google-tokens.service';

@Injectable()
export class GoogleTokenRevokeService {
  constructor(
    private readonly oauthClientService: OAuthClientService,
    private readonly googleTokensService: GoogleTokensService,
  ) {}

  async execute(userId: string): Promise<void> {
    const tokens = await this.googleTokensService.execute(userId);
    const token = tokens?.refresh_token ?? tokens?.access_token;
    if (!token) return;

    try {
      await this.oauthClientService.execute().revokeToken(token);
    } catch (error) {
      console.warn('Google token revoke failed.', error);
    }
  }
}
