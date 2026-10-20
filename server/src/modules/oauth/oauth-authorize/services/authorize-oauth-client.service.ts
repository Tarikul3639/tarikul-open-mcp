import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import type { Request } from 'express';
import { GoogleProfileService } from '@/modules/google/services/google-profile.service';
import { GetOAuthClientRecordService } from '../../oauth-client/services/get-oauth-client-record.service';
import { EnsureOAuthGrantService } from '../../oauth-client/services/ensure-oauth-grant.service';
import { CreateAuthorizationCodeService } from './create-authorization-code.service';
import { includesRedirectUri } from '../../oauth-client/utils/redirect-uri.util';
import type { OAuthAuthorizationQueryDto } from '../dto/oauth-authorization-query.dto';
import { getCookieValue } from '@/common/utils/cookie.util';
import { SessionService } from '@/common/session/session.service';

@Injectable()
export class AuthorizeOAuthClientService {
  private readonly issuer: string;
  private readonly resource: string;

  constructor(
    config: ConfigService,
    private readonly sessionService: SessionService,
    private readonly googleProfileService: GoogleProfileService,
    private readonly getClient: GetOAuthClientRecordService,
    private readonly ensureGrant: EnsureOAuthGrantService,
    private readonly createCode: CreateAuthorizationCodeService,
  ) {
    this.issuer = config.getOrThrow<string>('MCP_BASE_URL');
    this.resource = `${this.issuer}/api/mcp`;
  }

  async execute(query: OAuthAuthorizationQueryDto, request: Request) {
    const client =
      query.client_id && (await this.getClient.execute(query.client_id));
    const method = query.code_challenge_method ?? 'S256';
    const responseType = query.response_type ?? 'code';
    if (
      !client ||
      !query.redirect_uri ||
      !includesRedirectUri(client.redirectUris, query.redirect_uri) ||
      !/^[A-Za-z0-9_-]{43,128}$/.test(query.code_challenge ?? '') ||
      method !== 'S256' ||
      responseType !== 'code' ||
      query.resource !== this.resource
    ) {
      return { status: 400 as const, body: { error: 'invalid_request' } };
    }

    const userId = await this.sessionService.user(
      getCookieValue(request.headers.cookie, this.sessionService.cookieName),
    );
    if (!userId) {
      return {
        status: 302 as const,
        location: `${this.issuer}/api/auth/login?next=${encodeURIComponent(request.originalUrl)}`,
      };
    }
    if (!(await this.googleProfileService.execute(userId))) {
      return {
        status: 302 as const,
        location: `${this.issuer}/?calendar=disconnected`,
      };
    }
    if (
      !(await this.ensureGrant.execute({ userId, clientId: query.client_id! }))
    ) {
      const callback = new URL(query.redirect_uri);
      callback.searchParams.set('error', 'access_denied');
      if (query.state) callback.searchParams.set('state', query.state);
      callback.searchParams.set('iss', this.issuer);
      return { status: 303 as const, location: callback.toString() };
    }

    const code = randomBytes(32).toString('base64url');
    await this.createCode.execute({
      code,
      clientId: query.client_id!,
      redirectUri: query.redirect_uri,
      codeChallenge: query.code_challenge!,
      userId,
    });
    const callback = new URL(query.redirect_uri);
    callback.searchParams.set('code', code);
    if (query.state) callback.searchParams.set('state', query.state);
    callback.searchParams.set('iss', this.issuer);
    return { status: 303 as const, location: callback.toString() };
  }
}
