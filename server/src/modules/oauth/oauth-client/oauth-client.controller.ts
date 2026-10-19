import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Options,
  Post,
  Query,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { oauthCors, noCache } from '@/common/utils/http';
import { SaveOAuthClientDto } from './dto/save-oauth-client.dto';
import { OAuthClientQueryDto } from './dto/oauth-query.dto';
import { OAuthRegistrationRequestDto } from './dto/oauth-registration-request.dto';
import { OAuthClientActionDto } from './dto/oauth-client-action.dto';
import { GetOAuthClientService } from './services/get-oauth-client.service';
import { SaveOAuthClientService } from './services/save-oauth-client.service';
import { ListOAuthGrantsService } from './services/list-oauth-grants.service';
import { RevokeOAuthClientGrantService } from './services/revoke-oauth-client-grant.service';
import { RestoreOAuthClientGrantService } from './services/restore-oauth-client-grant.service';
import { RegisterOAuthClientService } from './services/register-oauth-client.service';
import {
  OAuthClientResponseDto,
  OAuthGrantResponseDto,
} from './dto/oauth-client-response.dto';

@ApiTags('OAuth Clients')
@Controller()
export class OAuthClientController {
  constructor(
    private readonly getClientService: GetOAuthClientService,
    private readonly saveClientService: SaveOAuthClientService,
    private readonly listGrantsService: ListOAuthGrantsService,
    private readonly revokeGrantService: RevokeOAuthClientGrantService,
    private readonly restoreGrantService: RestoreOAuthClientGrantService,
    private readonly registerClientService: RegisterOAuthClientService,
  ) {}

  @Post('oauth/clients')
  @ApiOperation({ summary: 'Register an OAuth client for the signed-in user' })
  @ApiOkResponse({
    description: 'OAuth client saved successfully',
    type: OAuthClientResponseDto,
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async saveClient(
    @Req() request: Request,
    @Body() dto: SaveOAuthClientDto,
    @Res() response: Response,
  ) {
    const result = await this.saveClientService.execute(request, dto);
    return response.json(result);
  }

  @Get('oauth/clients')
  @ApiOperation({ summary: 'Get an OAuth client registration' })
  @ApiOkResponse({
    description: 'OAuth client details',
    type: OAuthClientResponseDto,
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getClient(
    @Req() request: Request,
    @Query() query: OAuthClientQueryDto,
    @Res() response: Response,
  ) {
    const client = await this.getClientService.execute(request, query.clientId);
    return response.json({
      clientId: client.clientId,
      clientName: client.clientName,
      redirectUris: client.redirectUris as string[],
    });
  }

  @Get('oauth/grants')
  @ApiOperation({ summary: 'List OAuth grants for the signed-in user' })
  @ApiOkResponse({ type: OAuthGrantResponseDto, isArray: true })
  async listGrants(@Req() request: Request) {
    return this.listGrantsService.execute(request);
  }

  @Get('api/auth/clients')
  @ApiOperation({ summary: 'List the signed-in user client grants' })
  async listDashboardGrants(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const grants = await this.listGrantsService.execute(request);
    noCache(response);
    return response.json({ clients: grants });
  }

  @Delete('api/auth/clients')
  @ApiOperation({ summary: 'Revoke a client grant' })
  async revokeDashboardGrant(
    @Req() request: Request,
    @Body() body: OAuthClientActionDto | undefined,
    @Res() response: Response,
  ) {
    if (!body?.client_id) {
      return response.status(400).json({ error: 'client_id is required' });
    }
    const result = await this.revokeGrantService.execute(request, body.client_id);
    noCache(response);
    return result.revoked
      ? response.json({ revoked: true })
      : response.status(404).json({ error: 'Client access not found' });
  }

  @Post('api/auth/clients')
  @ApiOperation({ summary: 'Restore a previously revoked client grant' })
  async restoreDashboardGrant(
    @Req() request: Request,
    @Body() body: OAuthClientActionDto | undefined,
    @Res() response: Response,
  ) {
    if (!body?.client_id) {
      return response.status(400).json({ error: 'client_id is required' });
    }
    const restored = await this.restoreGrantService.execute(
      request,
      body.client_id,
    );
    noCache(response);
    return restored
      ? response.json({ restored: true })
      : response.status(404).json({ error: 'Revoked client access not found' });
  }

  @Post('api/oauth/register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a public OAuth client (DCR)' })
  @ApiCreatedResponse({ description: 'Public OAuth client registered' })
  async register(
    @Body() body: OAuthRegistrationRequestDto,
    @Res() response: Response,
  ) {
    oauthCors(response);
    noCache(response);
    const result = await this.registerClientService.execute(body);
    return response.status(result.status).json(result.body);
  }

  @Get('api/oauth/register')
  @HttpCode(405)
  @ApiOperation({ summary: 'Reject unsupported client registration method' })
  registerMethodNotAllowed(@Res() response: Response) {
    oauthCors(response);
    return response.status(405).json({ error: 'method_not_allowed' });
  }

  @Options('api/oauth/register')
  @ApiOperation({ summary: 'OAuth client registration CORS preflight' })
  registerOptions(@Res() response: Response) {
    oauthCors(response);
    return response.status(204).end();
  }
}
