import {
  BadRequestException,
  Controller,
  Get,
  Query,
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
import type { Response } from 'express';

import { EnvService } from '../../../config/env.service.js';
import { AuthUserService } from '../services/auth-user.service.js';
import { GoogleAuthService } from '../services/google-auth.service.js';
import { OAuthStateService } from '../services/oauth-state.service.js';
import { SessionService } from '../services/session.service.js';
import { sanitizeNextPath } from '../utils/redirect.util.js';

const SESSION_COOKIE = 'app_session';

@Controller('auth')
@ApiTags('Authentication')
export class OAuthController {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly authUserService: AuthUserService,
    private readonly oauthStateService: OAuthStateService,
    private readonly sessionService: SessionService,
    private readonly env: EnvService,
  ) {}

  private getCookieOptions() {
    return {
      httpOnly: true,
      secure: this.env.isProduction,
      sameSite: 'lax' as const,
      path: '/',
    };
  }

  @Get('google')
  @ApiOperation({
    summary: 'Start Google OAuth authentication',
    description:
      'Creates a database-backed OAuth state and redirects to Google.',
  })
  @ApiFoundResponse({
    description: 'Redirects the user to Google OAuth.',
  })
  @ApiQuery({
    name: 'next',
    required: false,
    type: String,
    description:
      'Relative web path to open after login, e.g. /oauth/consent?... Defaults to /dashboard.',
  })
  async googleLogin(
    @Query('next') next: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    // Remember where the user should land after login (for example the
    // MCP consent page), so the MCP authorization flow can continue.
    const state = await this.oauthStateService.create(
      undefined,
      sanitizeNextPath(next),
    );

    const authorizationUrl =
      this.googleAuthService.createAuthorizationUrl(state);

    res.redirect(302, authorizationUrl);
  }

  @Get('callback')
  @ApiOperation({
    summary: 'Handle Google OAuth callback',
    description:
      'Validates the database-backed OAuth state, verifies Google identity, creates a session, and redirects to the dashboard.',
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
    description: 'Redirects to the frontend dashboard.',
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
    @Res() res: Response,
  ): Promise<void> {
    if (error) {
      throw new UnauthorizedException(
        'Google authentication was cancelled or denied',
      );
    }

    if (!code || !state) {
      throw new BadRequestException('Missing OAuth code or state');
    }

    const { redirectTo } =
      await this.oauthStateService.consumeLoginState(state);

    try {
      const tokens = await this.googleAuthService.exchangeCode(code);

      if (!tokens.id_token) {
        throw new UnauthorizedException('Google ID token is missing');
      }

      const profile = await this.googleAuthService.verifyIdToken(
        tokens.id_token,
      );

      if (!profile?.sub || !profile.email || !profile.email_verified) {
        throw new UnauthorizedException('Google identity verification failed');
      }

      const user = await this.authUserService.findOrCreateGoogleUser({
        sub: profile.sub,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
      });

      const session = await this.sessionService.createSession(user.id);

      res.cookie(SESSION_COOKIE, session.token, {
        ...this.getCookieOptions(),
        expires: session.expiresAt,
      });

      res.redirect(302, `${this.env.webOrigin}${sanitizeNextPath(redirectTo)}`);
    } catch (err) {
      if (
        err instanceof UnauthorizedException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }

      throw new UnauthorizedException('Google authentication failed');
    }
  }
}
