import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { SessionService } from '@/common/session/session.service';
import { getCookieValue } from '@/common/utils/cookie.util';

@Injectable()
export class RequireOAuthSessionService {
  constructor(private readonly sessionService: SessionService) {}

  async execute(request: Request): Promise<string> {
    const session = getCookieValue(
      request.headers.cookie,
      this.sessionService.cookieName,
    );
    const userId = await this.sessionService.user(session);
    if (!userId) {
      throw new UnauthorizedException('A valid signed-in session is required.');
    }
    return userId;
  }
}
