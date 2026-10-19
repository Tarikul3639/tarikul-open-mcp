import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { RequireOAuthSessionService } from './require-oauth-session.service';
import { RestoreOAuthGrantService } from './restore-oauth-grant.service';

@Injectable()
export class RestoreOAuthClientGrantService {
  constructor(
    private readonly requireSession: RequireOAuthSessionService,
    private readonly restoreGrant: RestoreOAuthGrantService,
  ) {}

  async execute(request: Request, clientId: string): Promise<boolean> {
    const userId = await this.requireSession.execute(request);
    return this.restoreGrant.execute({ userId, clientId });
  }
}
