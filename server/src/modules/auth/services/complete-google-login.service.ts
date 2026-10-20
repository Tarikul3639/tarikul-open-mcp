import { Injectable } from '@nestjs/common';
import { GoogleOAuthCallbackService } from '../../google/services/google-oauth-callback.service';
import { SessionService } from '../../../common/session/session.service';

@Injectable()
export class CompleteGoogleLoginService {
  constructor(
    private readonly googleOAuthCallbackService: GoogleOAuthCallbackService,
    private readonly sessionService: SessionService,
  ) { }

  async execute(input: {
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
      const user = await this.googleOAuthCallbackService.execute(input.code);
      return { sessionToken: await this.sessionService.sign(user.email) };
    } catch (error) {
      console.error('Google OAuth callback failed', error);
      return null;
    }
  }
}
