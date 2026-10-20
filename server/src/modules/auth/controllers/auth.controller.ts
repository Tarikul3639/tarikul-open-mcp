
import {
    Controller,
    Get,
    Post,
    Req,
    Res,
    Delete,
    Logger,
    UseGuards,
    UnauthorizedException,
} from '@nestjs/common';
import {
    ApiCookieAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { AuthUserService } from '../services/auth-user.service.js';
import { SessionService } from '../services/session.service.js';
import { SessionGuard } from '../guards/session.guard.js';
import { CurrentUserResponseDto } from '../dto/current-user-response.dto.js';
import { LogoutResponseDto } from '../dto/logout-response.dto.js';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.js';
import { EnvService } from '../../../config/env.service.js';

const SESSION_COOKIE = 'app_session';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly sessionService: SessionService,
        private readonly env: EnvService,
    ) { }

    private readonly logger = new Logger(AuthController.name);

    /**
     * Returns the authenticated user's profile.
     */
    @Get('me')
    @UseGuards(SessionGuard)
    @ApiCookieAuth('app_session')
    @ApiOperation({
        summary: 'Get current authenticated user',
    })
    @ApiOkResponse({
        description: 'Returns the authenticated user profile.',
        type: CurrentUserResponseDto,
    })
    getCurrentUser(
        @Req() req: AuthenticatedRequest,
    ): Promise<CurrentUserResponseDto> {
        this.logger.log(`Fetching current user profile for userId: ${req.user.userId}`);
        return this.authUserService.getCurrentUser(
            req.user.userId,
        );
    }

    /**
     * Revokes the current session and removes its browser cookie.
     */
    @Post('logout')
    @UseGuards(SessionGuard)
    @ApiCookieAuth('app_session')
    @ApiOperation({
        summary: 'Log out the current user',
    })
    @ApiOkResponse({
        description: 'Session revoked successfully.',
        type: LogoutResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'The session is missing, invalid, or expired.',
    })
    async logout(
        @Req() req: AuthenticatedRequest,
        @Res({ passthrough: true }) res: Response,
    ): Promise<LogoutResponseDto> {
        const token = req.cookies?.[SESSION_COOKIE] as
            | string
            | undefined;

        // Clear the browser cookie using the same path and security options.
        res.clearCookie(SESSION_COOKIE, {
            httpOnly: true,
            secure: this.env.isProduction,
            sameSite: 'lax',
            path: '/',
        });

        if (!token) {
            throw new UnauthorizedException(
                'Authentication required',
            );
        }

        await this.sessionService.revokeSession(token);

        this.logger.log(`User logged out and session revoked for userId: ${req.user.userId}`);

        return {
            message: 'Logged out successfully',
        };
    }


    /**
 * Permanently deletes the authenticated user's account and related records.
 */
    @Delete('me')
    @UseGuards(SessionGuard)
    @ApiCookieAuth('app_session')
    @ApiOperation({
        summary: 'Permanently delete the current user account',
    })
    @ApiOkResponse({
        description: 'User account permanently deleted.',
    })
    @ApiUnauthorizedResponse({
        description: 'The session is missing, invalid, or expired.',
    })
    async deleteAccount(
        @Req() req: AuthenticatedRequest,
        @Res({ passthrough: true }) res: Response,
    ): Promise<{ message: string }> {
        const token = req.cookies?.[SESSION_COOKIE] as string | undefined;

        if (!token) {
            throw new UnauthorizedException('Authentication required');
        }

        // Permanently deletes the user and related records.
        await this.authUserService.deleteUser(req.user.userId);

        // Removes the authentication cookie from the browser.
        res.clearCookie(SESSION_COOKIE, {
            httpOnly: true,
            secure: this.env.isProduction,
            sameSite: 'lax',
            path: '/',
        });

        this.logger.warn(
            `User account permanently deleted: ${req.user.userId}`,
        );

        return {
            message: 'User account permanently deleted',
        };
    }
}
