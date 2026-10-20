import { Injectable } from '@nestjs/common';
import { OAuthClientService } from './oauth-client.service';

@Injectable()
export class GoogleLoginUrlService {
  constructor(private readonly oauthClientService: OAuthClientService) { }

  /**
   * Generates a Google OAuth authorization URL.
   * Uses a unique state value to protect against CSRF attacks.
   */
  execute(state: string): string {
    return this.oauthClientService.execute().generateAuthUrl({
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
}
