import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { OAuthTokenRequestDto } from '../dto/oauth-token-request.dto';
import { CheckOAuthGrantService } from '../../oauth-client/services/check-oauth-grant.service';
import { RevokeOAuthGrantService } from '../../oauth-client/services/revoke-oauth-grant.service';
import { GoogleProfileService } from '@/modules/google/services/google-profile.service';
import { RotateRefreshTokenService } from './rotate-refresh-token.service';
import { IssueOAuthAccessTokenService } from './issue-oauth-access-token.service';

@Injectable()
export class RefreshOAuthTokenService {
  constructor(
    private readonly rotateRefreshToken: RotateRefreshTokenService,
    private readonly checkGrant: CheckOAuthGrantService,
    private readonly googleProfileService: GoogleProfileService,
    private readonly revokeGrant: RevokeOAuthGrantService,
    private readonly issueAccessToken: IssueOAuthAccessTokenService,
  ) {}

  async execute(body: OAuthTokenRequestDto) {
    const currentToken = body.refresh_token;
    const clientId = body.client_id;
    if (!currentToken || !/^[A-Za-z0-9_-]{43}$/.test(currentToken)) {
      return { status: 400, body: { error: 'invalid_grant' } };
    }

    const nextToken = randomBytes(32).toString('base64url');
    const rotated = await this.rotateRefreshToken.execute({
      currentToken,
      nextToken,
      clientId,
    });
    if (
      !rotated ||
      !(await this.checkGrant.execute({ userId: rotated.userId, clientId }))
    )
      return { status: 400, body: { error: 'invalid_grant' } };

    if (!(await this.googleProfileService.execute(rotated.userId))) {
      await this.revokeGrant.execute(rotated.userId, clientId);
      return { status: 400, body: { error: 'invalid_grant' } };
    }

    return {
      status: 200,
      body: {
        access_token: await this.issueAccessToken.execute(
          rotated.userId,
          clientId,
        ),
        token_type: 'Bearer',
        expires_in: 900,
        refresh_token: nextToken,
        scope: 'calendar',
      },
    };
  }
}
