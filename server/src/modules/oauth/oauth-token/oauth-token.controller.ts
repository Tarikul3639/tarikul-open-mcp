import {
  Body,
  Controller,
  Get,
  HttpCode,
  Options,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { noCache, oauthCors } from '@/common/utils/http';
import { ExchangeOAuthTokenService } from './services/exchange-oauth-token.service';
import { RevokeOAuthGrantFromOAuthService } from './services/revoke-oauth-grant-from-oauth.service';
import { RevokeAllOAuthGrantsFromOAuthService } from './services/revoke-all-oauth-grants-from-oauth.service';
import { OAuthTokenRequestDto } from './dto/oauth-token-request.dto';
import { OAuthRevokeResponseDto } from './dto/oauth-operation-response.dto';

@ApiTags('OAuth Tokens')
@Controller()
export class OAuthTokenController {
  constructor(
    private readonly exchangeTokens: ExchangeOAuthTokenService,
    private readonly revokeGrant: RevokeOAuthGrantFromOAuthService,
    private readonly revokeAllGrants: RevokeAllOAuthGrantsFromOAuthService,
  ) { }

  @Post('api/oauth/token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange an authorization code or refresh token' })
  @ApiOkResponse({ description: 'Access and refresh tokens' })
  async exchange(
    @Body() body: OAuthTokenRequestDto,
    @Res() response: Response,
  ) {
    oauthCors(response);
    noCache(response);
    const result = await this.exchangeTokens.execute(body);
    return response.status(result.status).json(result.body);
  }

  @Get('api/oauth/token')
  @HttpCode(405)
  @ApiOperation({ summary: 'Reject token retrieval with GET' })
  tokenGet(@Res() response: Response) {
    oauthCors(response);
    return response.status(405).json({ error: 'method_not_allowed' });
  }

  @Options('api/oauth/token')
  @ApiOperation({ summary: 'OAuth token CORS preflight' })
  tokenOptions(@Res() response: Response) {
    oauthCors(response);
    return response.status(204).end();
  }

  @Post('oauth/tokens/revoke')
  @ApiOperation({ summary: 'Revoke an OAuth grant and its tokens' })
  @ApiOkResponse({ type: OAuthRevokeResponseDto })
  async revoke(@Req() request: Request) {
    return this.revokeGrant.execute(request);
  }

  @Post('oauth/tokens/revoke-all')
  @ApiOperation({ summary: 'Revoke all OAuth grants and tokens' })
  @ApiOkResponse({ type: OAuthRevokeResponseDto })
  async revokeAll(@Req() request: Request) {
    return this.revokeAllGrants.execute(request);
  }
}
