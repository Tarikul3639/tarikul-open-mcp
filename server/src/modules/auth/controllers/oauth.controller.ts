import {
    BadRequestException,
    Controller,
    Get,
    Query,
    Req,
    Res,
    UnauthorizedException,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiFoundResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';

import { EnvService } from '@/config/env.service';
import { AuthUserService } from '../services/auth-user.service';
import { GoogleAuthService } from '../services/google-auth.service';
import { SessionService } from '../services/session.service';

const STATE_COOKIE = 'google_oauth_state';
const SESSION_COOKIE = 'app_session';

const STATE_MAX_AGE = 10 * 60 * 1000;

@Controller('auth')
@ApiTags('Authentication')
export class OAuthController {
    constructor(
        private readonly googleAuthService: GoogleAuthService,
        private readonly authUserService: AuthUserService,
        private readonly sessionService: SessionService,
        private readonly env: EnvService,
    ) { }

    /**
     * Shared cookie options keep session issuance and deletion consistent.
     * HttpOnly prevents client-side JavaScript from reading the token.
     */
    private getCookieOptions() {
        return {
            httpOnly: true,
            secure: this.env.isProduction,
            sameSite: 'lax' as const,
            path: '/',
        };
    }

    /**
     * Starts Google OAuth using a cryptographically random state value.
     * The short-lived cookie helps protect against OAuth CSRF attacks.
     */
    @Get('google')
    @ApiOperation({
        summary: 'Start Google OAuth authentication',
        description:
            'Generates an OAuth state, stores it in an HttpOnly cookie, and redirects to Google.',
    })
    @ApiFoundResponse({
        description: 'Redirects the user to Google OAuth.',
    })
    googleLogin(@Res() res: Response): void {
        const state = randomBytes(32).toString('hex');

        res.cookie(STATE_COOKIE, state, {
            ...this.getCookieOptions(),
            maxAge: STATE_MAX_AGE,
        });

        const authorizationUrl =
            this.googleAuthService.createAuthorizationUrl(state);

        res.redirect(302, authorizationUrl);
    }

    /**
     * Validates the OAuth callback, verifies the Google identity,
     * persists the local user, creates a session, and redirects.
     */
    @Get('callback')
    @ApiOperation({
        summary: 'Handle Google OAuth callback',
        description:
            'Validates OAuth state, verifies the Google identity, saves the user, creates a session, and redirects to the frontend.',
    })
    @ApiQuery({
        name: 'code',
        required: true,
        type: String,
        description: 'Authorization code returned by Google.',
    })
    @ApiQuery({
        name: 'state',
        required: true,
        type: String,
        description: 'OAuth state returned by Google.',
    })
    @ApiQuery({
        name: 'error',
        required: false,
        type: String,
        description: 'OAuth error returned when authorization fails.',
    })
    @ApiFoundResponse({
        description:
            'Authentication successful. Redirects to the frontend dashboard.',
    })
    @ApiBadRequestResponse({
        description: 'Authorization code or state is missing.',
    })
    @ApiUnauthorizedResponse({
        description: 'OAuth state or Google identity validation failed.',
    })
    async googleCallback(
        @Query('code') code: string,
        @Query('state') state: string,
        @Query('error') error: string,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        const savedState = req.cookies?.[STATE_COOKIE] as
            | string
            | undefined;

        // Clear the one-time state cookie regardless of callback outcome.
        res.clearCookie(STATE_COOKIE, this.getCookieOptions());

        if (error) {
            throw new UnauthorizedException(
                'Google authentication was cancelled or denied',
            );
        }

        if (!code || !state || !savedState) {
            throw new BadRequestException(
                'Missing OAuth code or state',
            );
        }

        // Compare equal-length buffers using a timing-safe comparison.
        const received = Buffer.from(state);
        const expected = Buffer.from(savedState);

        if (
            received.length !== expected.length ||
            !timingSafeEqual(received, expected)
        ) {
            throw new UnauthorizedException('Invalid OAuth state');
        }

        try {
            const tokens =
                await this.googleAuthService.exchangeCode(code);

            if (!tokens.id_token) {
                throw new UnauthorizedException(
                    'Google ID token is missing',
                );
            }

            const profile =
                await this.googleAuthService.verifyIdToken(
                    tokens.id_token,
                );

            if (
                !profile?.sub ||
                !profile.email ||
                !profile.email_verified
            ) {
                throw new UnauthorizedException(
                    'Google identity verification failed',
                );
            }

            const user =
                await this.authUserService.findOrCreateGoogleUser({
                    sub: profile.sub,
                    email: profile.email,
                    name: profile.name,
                    picture: profile.picture,
                });

            // Persist only the token hash; send the raw token via a cookie.
            const session =
                await this.sessionService.createSession(user.id);

            res.cookie(SESSION_COOKIE, session.token, {
                ...this.getCookieOptions(),
                expires: session.expiresAt,
            });

            // Redirect after successful authentication.
            res.redirect(302, `${this.env.webOrigin}/dashboard`);
        } catch (err) {
            if (
                err instanceof UnauthorizedException ||
                err instanceof BadRequestException
            ) {
                throw err;
            }

            throw new UnauthorizedException(
                'Google authentication failed',
            );
        }
    }
}