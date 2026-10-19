import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OAuthTokenRequestDto } from '../dto/oauth-token-request.dto';
import { ExchangeAuthorizationCodeService } from './exchange-authorization-code.service';
import { RefreshOAuthTokenService } from './refresh-oauth-token.service';

@Injectable()
export class ExchangeOAuthTokenService {
  private readonly issuer: string;

  constructor(
    config: ConfigService,
    private readonly exchangeAuthorizationCode: ExchangeAuthorizationCodeService,
    private readonly refreshOAuthToken: RefreshOAuthTokenService,
  ) {
    this.issuer = config.getOrThrow<string>('MCP_BASE_URL');
  }

  execute(body: OAuthTokenRequestDto) {
    const fail = (error: string) => ({ status: 400, body: { error } });
    if (
      !body?.client_id ||
      (body.resource && body.resource !== `${this.issuer}/api/mcp`)
    ) return fail('invalid_request');

    if (body.grant_type === 'authorization_code') {
      return this.exchangeAuthorizationCode.execute(body);
    }
    if (body.grant_type === 'refresh_token') {
      return this.refreshOAuthToken.execute(body);
    }
    return fail('unsupported_grant_type');
  }
}
