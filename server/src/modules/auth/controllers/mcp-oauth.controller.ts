import {
    BadRequestException,
    Controller,
    Get,
    Post,
    Body,
    Query,
    Req,
    Res,
    Logger,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { AuthorizeMcpDto } from '../dto/authorize-mcp.dto.js';
import { McpTokenDto } from '../dto/mcp-token.dto.js';
import { SessionGuard } from '../guards/session.guard.js';
import { McpOauthService } from '../services/mcp-oauth.service.js';

@ApiTags('MCP OAuth')
@Controller('auth')
export class McpOauthController {
    constructor(private readonly mcpOauthService: McpOauthService) { }

    private readonly logger = new Logger(McpOauthController.name);

    @Get('authorize')
    @UseGuards(SessionGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Authorize MCP client' })
    @ApiResponse({
        status: 302,
        description: 'Redirects with authorization code',
    })
    @ApiResponse({ status: 400, description: 'Invalid authorization request' })
    @ApiResponse({ status: 401, description: 'User is not authenticated' })
    async authorize(
        @Req() req: Request & { user: { userId: string } },
        @Query() query: AuthorizeMcpDto,
        @Res() res: Response,
    ) {

        // DEBUG: Log the authorization request details for debugging purposes.
        this.logger.log(`Received authorization request from user ${req.user.userId} for client ${query.client_id}`);

        const result = await this.mcpOauthService.authorize({
            userId: req.user.userId,
            clientId: query.client_id,
            redirectUri: query.redirect_uri,
            codeChallenge: query.code_challenge,
            codeChallengeMethod: query.code_challenge_method,
            state: query.state,
        });

        return res.redirect(302, result.redirectUrl);
    }

    @Post('token')
    @ApiOperation({ summary: 'Exchange OAuth grant for tokens' })
    @ApiResponse({ status: 200, description: 'Tokens issued successfully' })
    @ApiResponse({ status: 400, description: 'Invalid grant request' })
    @ApiResponse({
        status: 401,
        description: 'Invalid authorization code or refresh token',
    })
    async token(@Body() body: McpTokenDto) {
        if (body.grant_type === 'authorization_code') {
            return this.mcpOauthService.exchangeCode({
                code: body.code ?? '',
                clientId: body.client_id,
                redirectUri: body.redirect_uri ?? '',
                codeVerifier: body.code_verifier ?? '',
            });
        }

        if (body.grant_type === 'refresh_token') {
            return this.mcpOauthService.refresh({
                refreshToken: body.refresh_token ?? '',
                clientId: body.client_id,
            });
        }

        throw new BadRequestException('Unsupported grant_type');
    }
}
