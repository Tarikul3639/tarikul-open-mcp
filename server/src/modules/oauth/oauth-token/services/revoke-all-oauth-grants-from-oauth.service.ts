import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { RequireOAuthSessionService } from '../../oauth-client/services/require-oauth-session.service';
import { RevokeAllOAuthGrantsService } from '../../oauth-client/services/revoke-all-oauth-grants.service';

@Injectable()
export class RevokeAllOAuthGrantsFromOAuthService {
  constructor(
    private readonly requireSession: RequireOAuthSessionService,
    private readonly revokeAllGrants: RevokeAllOAuthGrantsService,
  ) {}

  async execute(request: Request) {
    const userId = await this.requireSession.execute(request);
    return this.revokeAllGrants.execute(userId);
  }
}
