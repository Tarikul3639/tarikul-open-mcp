import { Injectable } from '@nestjs/common';
import { GoogleProfileService } from '../../google/services/google-profile.service';
import { CheckOAuthGrantService } from '../../oauth/oauth-client/services/check-oauth-grant.service';
import { CheckOAuthAccessTokenService } from '../../oauth/oauth-token/services/check-oauth-access-token.service';

/** Validates MCP bearer tokens against current grants and Google accounts. */
@Injectable()
export class McpAuthService {
  constructor(
    private readonly googleProfileService: GoogleProfileService,
    private readonly checkAccessToken: CheckOAuthAccessTokenService,
    private readonly checkGrant: CheckOAuthGrantService,
  ) {}

  /** Verifies token signature, issuer, audience, and required scope. */
  verifyAccessToken(token: string) {
    return this.checkAccessToken.execute(token);
  }

  /** Returns the identity only while its OAuth grant and Google account exist. */
  async authorizedUser(token: string) {
    const identity = await this.checkAccessToken.execute(token);
    if (
      !identity ||
      !(await this.checkGrant.execute({
        userId: identity.userId,
        clientId: identity.clientId,
      })) ||
      !(await this.googleProfileService.execute(identity.userId))
    ) {
      return null;
    }
    return identity;
  }
}
