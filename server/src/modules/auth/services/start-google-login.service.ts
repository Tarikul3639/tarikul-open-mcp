import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { GoogleLoginUrlService } from '@/modules/google/services/google-login-url.service';
import { safeNext } from '@/common/utils/http';

@Injectable()
export class StartGoogleLoginService {
  constructor(private readonly googleLoginUrlService: GoogleLoginUrlService) { }
  private readonly logger = new Logger(StartGoogleLoginService.name);

  execute(next?: string, secure = false) {
    const state = randomBytes(32).toString('hex');
    const url = this.googleLoginUrlService.execute(state);

    // DEBUG: Log the generated URL and state for debugging purposes
    this.logger.debug(`Generated Google login URL: ${url} with state: ${state}`);

    const options = `Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secure ? '; Secure' : ''}`;
    const cookies = [
      `google_oauth_state=${state}; ${options}`,
      `google_oauth_next=${encodeURIComponent(safeNext(next))}; ${options}`,
    ];

    return { state, url, cookies };
  }
}
