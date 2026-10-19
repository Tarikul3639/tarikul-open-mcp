import { BadRequestException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { RequireOAuthSessionService } from '../../oauth-client/services/require-oauth-session.service';
import { RevokeOAuthGrantService } from '../../oauth-client/services/revoke-oauth-grant.service';

@Injectable()
export class RevokeOAuthGrantFromOAuthService {
  constructor(
    private readonly requireSession: RequireOAuthSessionService,
    private readonly revokeGrant: RevokeOAuthGrantService,
  ) {}

  async execute(request: Request) {
    const userId = await this.requireSession.execute(request);
    const queryClientId = request.query.clientId;
    const clientId = typeof queryClientId === 'string' ? queryClientId : '';
    if (!clientId) throw new BadRequestException('clientId is required.');
    return this.revokeGrant.execute(userId, clientId);
  }
}
