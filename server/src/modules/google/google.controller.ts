import { Controller, Get, NotFoundException, Post, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { getCookieValue } from '../../common/utils/cookie.util';
import { SessionService } from '../../common/session/session.service';
import { GoogleAccountDisconnectResponseDto } from './dto/google-account-disconnect-response.dto';
import { GoogleTokensResponseDto } from './dto/google-tokens-response.dto';
import { GoogleService } from './google.service';

@ApiTags('Google Account')
@Controller('oauth/google-account')
export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly sessionService: SessionService,
  ) {}

  @Get('tokens')
  @ApiOperation({ summary: 'Get Google tokens for the signed-in user' })
  @ApiOkResponse({ type: GoogleTokensResponseDto })
  async getTokens(@Req() request: Request): Promise<GoogleTokensResponseDto> {
    const userId = await this.sessionService.requireUser(
      getCookieValue(request.headers.cookie, this.sessionService.cookieName),
    );
    const tokens = await this.googleService.getTokens(userId);
    if (!tokens)
      throw new NotFoundException('Google account is not connected.');
    return tokens;
  }

  @Post('disconnect')
  @ApiOperation({ summary: 'Disconnect the signed-in Google account' })
  @ApiOkResponse({ type: GoogleAccountDisconnectResponseDto })
  async disconnect(
    @Req() request: Request,
  ): Promise<GoogleAccountDisconnectResponseDto> {
    const userId = await this.sessionService.requireUser(
      getCookieValue(request.headers.cookie, this.sessionService.cookieName),
    );
    return this.googleService.disconnect(userId);
  }
}
