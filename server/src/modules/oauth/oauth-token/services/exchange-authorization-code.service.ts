import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { OAuthTokenRequestDto } from '../dto/oauth-token-request.dto';
import { ConsumeAuthorizationCodeForTokenService } from '../../oauth-authorize/services/consume-authorization-code-for-token.service';
import { CheckOAuthGrantService } from '../../oauth-client/services/check-oauth-grant.service';
import { GoogleService } from '@/modules/google/google.service';
import { SaveRefreshTokenService } from './save-refresh-token.service';
import { IssueOAuthAccessTokenService } from './issue-oauth-access-token.service';

@Injectable()
export class ExchangeAuthorizationCodeService {
  private readonly issuer: string;

  constructor(
    config: ConfigService,
    private readonly consumeCode: ConsumeAuthorizationCodeForTokenService,
    private readonly checkGrant: CheckOAuthGrantService,
    private readonly googleService: GoogleService,
    private readonly saveRefreshToken: SaveRefreshTokenService,
    private readonly issueAccessToken: IssueOAuthAccessTokenService,
  ) {
    this.issuer = config.getOrThrow<string>('MCP_BASE_URL');
  }

  async execute(body: OAuthTokenRequestDto) {
    const clientId = body.client_id;
    const { code, redirect_uri: redirectUri, code_verifier: verifier } = body;
    if (
      !code ||
      !redirectUri ||
      !verifier ||
      body.resource !== `${this.issuer}/api/mcp` ||
      !/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)
    ) return { status: 400, body: { error: 'invalid_grant' } };

    const challenge = createHash('sha256').update(verifier).digest('base64url');
    const authorization = await this.consumeCode.execute({
      code,
      clientId,
      redirectUri,
      codeChallenge: challenge,
    });
    if (
      !authorization ||
      !(await this.checkGrant.execute({ userId: authorization.userId, clientId })) ||
      !(await this.googleService.getProfile(authorization.userId))
    ) return { status: 400, body: { error: 'invalid_grant' } };

    const refreshToken = randomBytes(32).toString('base64url');
    await this.saveRefreshToken.execute({
      token: refreshToken,
      clientId,
      userId: authorization.userId,
      familyId: randomUUID(),
    });
    return {
      status: 200,
      body: {
        access_token: await this.issueAccessToken.execute(authorization.userId, clientId),
        token_type: 'Bearer',
        expires_in: 900,
        refresh_token: refreshToken,
        scope: 'calendar',
      },
    };
  }

}
