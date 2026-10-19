import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { noCache } from '@/common/utils/http';
import { CreateAuthorizationCodeRequestDto } from './dto/create-authorization-code-request.dto';
import { ConsumeAuthorizationCodeRequestDto } from './dto/consume-authorization-code.dto';
import { OAuthAuthorizationQueryDto } from './dto/oauth-authorization-query.dto';
import { AuthorizeOAuthClientService } from './services/authorize-oauth-client.service';
import { CreateDashboardAuthorizationCodeService } from './services/create-dashboard-authorization-code.service';
import { ConsumeDashboardAuthorizationCodeService } from './services/consume-dashboard-authorization-code.service';
import {
  ConsumedAuthorizationCodeResponseDto,
  OAuthAuthorizationCodeResponseDto,
} from './dto/oauth-authorization-code-response.dto';

@ApiTags('OAuth Authorization')
@Controller()
export class OAuthAuthorizeController {
  constructor(
    private readonly authorizeClient: AuthorizeOAuthClientService,
    private readonly createAuthorizationCode: CreateDashboardAuthorizationCodeService,
    private readonly consumeAuthorizationCode: ConsumeDashboardAuthorizationCodeService,
  ) {}

  @Post('oauth/authorization-codes')
  @ApiOperation({ summary: 'Create a PKCE authorization code' })
  @ApiOkResponse({ type: OAuthAuthorizationCodeResponseDto })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  createCode(
    @Req() request: Request,
    @Body() dto: CreateAuthorizationCodeRequestDto,
  ) {
    return this.createAuthorizationCode.execute(request, dto);
  }

  @Post('oauth/authorization-codes/consume')
  @ApiOperation({ summary: 'Consume a one-time authorization code' })
  @ApiOkResponse({ type: ConsumedAuthorizationCodeResponseDto })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  consumeCode(
    @Req() request: Request,
    @Body() dto: ConsumeAuthorizationCodeRequestDto,
  ) {
    return this.consumeAuthorizationCode.execute(request, dto);
  }

  @Get('api/oauth/authorize')
  @ApiOperation({ summary: 'Authorize a public client and issue a PKCE code' })
  async authorize(
    @Req() request: Request,
    @Res() response: Response,
    @Query() query: OAuthAuthorizationQueryDto,
  ) {
    const result = await this.authorizeClient.execute(query, request);
    if ('body' in result)
      return response.status(result.status).json(result.body);
    if (result.status === 303) noCache(response);
    return response.redirect(result.status, result.location);
  }
}
