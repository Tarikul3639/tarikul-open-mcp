import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { RequireOAuthSessionService } from './require-oauth-session.service';
import { RevokeOAuthGrantService } from './revoke-oauth-grant.service';

@Injectable()
export class RevokeOAuthClientGrantService {
  constructor(
    private readonly requireSession: RequireOAuthSessionService,
    private readonly revokeGrant: RevokeOAuthGrantService,
  ) {}

  async execute(request: Request, clientId: string) {
    const userId = await this.requireSession.execute(request);
    return this.revokeGrant.execute(userId, clientId);
  }
}
