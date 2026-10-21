import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { EnvService } from '../../../config/env.service.js';
import {
  AuthorizeMcpDto,
  ClientInfoQueryDto,
  ConsentDecisionDto,
} from '../dto/authorize-mcp.dto.js';
import { McpTokenDto } from '../dto/mcp-token.dto.js';
import { SessionGuard } from '../guards/session.guard.js';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.js';
import { ClientRegistrationService } from '../services/client-registration.service.js';
import { McpOauthService } from '../services/mcp-oauth.service.js';
import { SessionService } from '../services/session.service.js';

const SESSION_COOKIE = 'app_session';

@ApiTags('MCP OAuth')
@Controller('auth')
export class McpOauthController {
  constructor(
    private readonly mcpOauthService: McpOauthService,
    private readonly clientRegistration: ClientRegistrationService,
    private readonly sessionService: SessionService,
    private readonly env: EnvService,
  ) {}

  private readonly logger = new Logger(McpOauthController.name);

  // ──────────────────────────────────────────────────────────────
  // Dynamic Client Registration (RFC 7591)
  // ──────────────────────────────────────────────────────────────

  @Post('register')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register an MCP OAuth client (Dynamic Client Registration)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['redirect_uris'],
      properties: {
        client_name: { type: 'string', example: 'Claude' },
        redirect_uris: {
          type: 'array',
          items: { type: 'string' },
          example: ['https://claude.ai/api/mcp/auth_callback'],
        },
        token_endpoint_auth_method: {
          type: 'string',
          enum: ['none', 'client_secret_post', 'client_secret_basic'],
          example: 'none',
        },
        grant_types: {
          type: 'array',
          items: { type: 'string' },
          example: ['authorization_code', 'refresh_token'],
        },
        response_types: {
          type: 'array',
          items: { type: 'string' },
          example: ['code'],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Client registered' })
  @ApiResponse({ status: 400, description: 'Invalid client metadata' })
  // The body is intentionally untyped: RFC 7591 allows many optional
  // metadata fields (logo_uri, contacts, ...). Unknown fields are ignored
  // instead of being rejected by the global whitelist ValidationPipe.
  register(@Body() body: Record<string, unknown>) {
    return this.clientRegistration.register(body);
  }

  // ──────────────────────────────────────────────────────────────
  // Authorization endpoint
  // ──────────────────────────────────────────────────────────────

  @Get('authorize')
  @ApiOperation({
    summary: 'Authorize MCP client',
    description:
      'Opened in the browser by the MCP client. If the user is signed in and has already approved this client, it redirects straight back with a code. Otherwise it redirects to the consent page, which handles Google sign-in first when needed.',
  })
  @ApiResponse({
    status: 302,
    description:
      'Redirects to the consent page or back to the client with a code',
  })
  @ApiResponse({ status: 400, description: 'Invalid authorization request' })
  async authorize(
    @Req() req: Request,
    @Query() query: AuthorizeMcpDto,
    @Res() res: Response,
  ) {
    // Reject unknown clients / unregistered redirect URIs up front.
    await this.mcpOauthService.validateAuthorizationRequest(
      this.toAuthorizationRequest(query),
    );

    const userId = await this.getSessionUserId(req);

    this.logger.log(
      `Authorization request for client ${query.client_id} (${userId ? 'signed in' : 'anonymous'})`,
    );

    if (
      userId &&
      (await this.mcpOauthService.hasActiveGrant(userId, query.client_id))
    ) {
      const result = await this.mcpOauthService.authorize({
        ...this.toAuthorizationRequest(query),
        userId,
      });

      return res.redirect(302, result.redirectUrl);
    }

    const consentUrl = new URL('/oauth/consent', this.env.webOrigin);

    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string' && value.length > 0) {
        consentUrl.searchParams.set(key, value);
      }
    }

    return res.redirect(302, consentUrl.toString());
  }

  @Get('authorize/client')
  @ApiOperation({
    summary: 'Get public information about an MCP client for the consent page',
  })
  @ApiOkResponse({ description: 'Client information' })
  @ApiResponse({
    status: 400,
    description: 'Invalid OAuth client or redirect URI',
  })
  clientInfo(@Query() query: ClientInfoQueryDto) {
    return this.mcpOauthService.getClientInfo(
      query.client_id,
      query.redirect_uri,
    );
  }

  @Post('authorize/consent')
  @HttpCode(200)
  @UseGuards(SessionGuard)
  @ApiCookieAuth('app_session')
  @ApiOperation({
    summary: 'Approve or deny an MCP client (called by the consent page)',
  })
  @ApiBody({ type: ConsentDecisionDto })
  @ApiOkResponse({
    description: 'Returns the URL the browser must open next',
    schema: {
      type: 'object',
      properties: { redirectUrl: { type: 'string' } },
    },
  })
  async consent(
    @Req() req: AuthenticatedRequest,
    @Body() body: ConsentDecisionDto,
  ) {
    this.logger.log(
      `User ${req.user.userId} chose "${body.decision}" for client ${body.client_id}`,
    );

    return this.mcpOauthService.decide({
      ...this.toAuthorizationRequest(body),
      userId: req.user.userId,
      approved: body.decision === 'allow',
    });
  }

  // ──────────────────────────────────────────────────────────────
  // Token endpoint
  // ──────────────────────────────────────────────────────────────

  @Post('token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange OAuth grant for tokens' })
  @ApiResponse({ status: 200, description: 'Tokens issued successfully' })
  @ApiResponse({ status: 400, description: 'Invalid grant request' })
  @ApiResponse({
    status: 401,
    description: 'Invalid authorization code or refresh token',
  })
  async token(
    @Req() req: Request,
    @Body() body: McpTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Tokens must never be cached (RFC 6749 §5.1).
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');

    const basic = this.parseBasicAuth(req.headers.authorization);
    const clientId = body.client_id ?? basic?.clientId;
    const clientSecret = body.client_secret ?? basic?.clientSecret;

    if (!clientId) {
      throw new BadRequestException('client_id is required');
    }

    if (body.grant_type === 'authorization_code') {
      return this.mcpOauthService.exchangeCode({
        code: body.code ?? '',
        clientId,
        clientSecret,
        redirectUri: body.redirect_uri ?? '',
        codeVerifier: body.code_verifier ?? '',
      });
    }

    if (body.grant_type === 'refresh_token') {
      return this.mcpOauthService.refresh({
        refreshToken: body.refresh_token ?? '',
        clientId,
        clientSecret,
      });
    }

    throw new BadRequestException('Unsupported grant_type');
  }

  // ──────────────────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────────────────

  private toAuthorizationRequest(query: AuthorizeMcpDto) {
    return {
      clientId: query.client_id,
      redirectUri: query.redirect_uri,
      codeChallenge: query.code_challenge,
      codeChallengeMethod: query.code_challenge_method,
      state: query.state,
    };
  }

  /**
   * Returns the signed-in user, or null. Unlike SessionGuard this never
   * throws, because anonymous users are sent to the consent/login page.
   */
  private async getSessionUserId(req: Request): Promise<string | null> {
    const token = (req.cookies as Record<string, string> | undefined)?.[
      SESSION_COOKIE
    ];

    if (!token) {
      return null;
    }

    try {
      const session = await this.sessionService.validateSession(token);
      return session.userId;
    } catch {
      return null;
    }
  }

  private parseBasicAuth(header?: string) {
    const encoded = header?.match(/^Basic\s+(\S+)$/i)?.[1];

    if (!encoded) {
      return null;
    }

    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const separator = decoded.indexOf(':');

    if (separator < 0) {
      return null;
    }

    try {
      return {
        clientId: decodeURIComponent(decoded.slice(0, separator)),
        clientSecret: decodeURIComponent(decoded.slice(separator + 1)),
      };
    } catch {
      return null;
    }
  }
}
