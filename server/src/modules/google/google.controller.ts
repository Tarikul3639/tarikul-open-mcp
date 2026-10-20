import { Controller, Get, NotFoundException, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { getCookieValue } from '../../common/utils/cookie.util';
import { SessionService } from '../../common/session/session.service';
import { GoogleTokensResponseDto } from './dto/google-tokens-response.dto';
import { GoogleTokensService } from './services/google-tokens.service';

@ApiTags('Google Account')
@Controller('oauth/google-account')
export class GoogleController {
  constructor(
    private readonly googleTokensService: GoogleTokensService,
    private readonly sessionService: SessionService,
  ) {}

  @Get('tokens')
  @ApiOperation({ summary: 'Get Google tokens for the signed-in user' })
  @ApiOkResponse({ type: GoogleTokensResponseDto })
  async getTokens(@Req() request: Request): Promise<GoogleTokensResponseDto> {
    const userId = await this.sessionService.requireUser(
      getCookieValue(request.headers.cookie, this.sessionService.cookieName),
    );
    const tokens = await this.googleTokensService.execute(userId);
    if (!tokens)
      throw new NotFoundException('Google account is not connected.');
    return tokens;
  }
}
