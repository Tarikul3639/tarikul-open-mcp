import {
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  Res,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { SessionService } from '../../common/session/session.service';
import { cookies, noCache, safeNext } from '../../common/utils/http';
import { getCookieValue } from '../../common/utils/cookie.util';

import { AuthProfileResponseDto } from './dto/auth-profile-response.dto';
import { CompleteGoogleLoginService } from './services/complete-google-login.service';
import { DisconnectGoogleAccountService } from './services/disconnect-google-account.service';
import { GetProfileService } from './services/get-profile.service';
import { GetSessionProfileService } from './services/get-session-profile.service';
import { RequireSessionService } from './services/require-session.service';
import { SessionUserService } from './services/session-user.service';
import { StartGoogleLoginService } from './services/start-google-login.service';

import { GoogleAccountDisconnectResponseDto } from '../google/dto/google-account-disconnect-response.dto';

@ApiTags('Authentication')
@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly sessionService: SessionService,
    private readonly startGoogleLoginService: StartGoogleLoginService,
    private readonly completeGoogleLoginService: CompleteGoogleLoginService,
    private readonly sessionUserService: SessionUserService,
    private readonly requireSessionService: RequireSessionService,
    private readonly getSessionProfileService: GetSessionProfileService,
    private readonly getProfileService: GetProfileService,
    private readonly disconnectGoogleAccountService: DisconnectGoogleAccountService,
  ) { }

  // ==========================================
  // GOOGLE OAUTH
  // ==========================================

  // Start Google sign-in
  @Get('api/auth/login')
  @ApiOperation({ summary: 'Start Google sign-in' })
  login(
    @Req() request: Request,
    @Res() response: Response,
    @Query('next') next?: string,
  ) {
    const { url, cookies } = this.startGoogleLoginService.execute(
      next,
      request.secure,
    );

    response.setHeader('Set-Cookie', cookies);
    return response.redirect(302, url);
  }

  // Complete Google sign-in and create session
  @Get('api/auth/callback')
  @ApiOperation({ summary: 'Complete Google sign-in' })
  async callback(
    @Req() request: Request,
    @Res() response: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('error') error?: string,
  ) {
    const cookieHeader = request.headers['cookie'];
    const expectedState = getCookieValue(cookieHeader, 'google_oauth_state');
    const nextCookie = getCookieValue(cookieHeader, 'google_oauth_next');
    const next = safeNext(nextCookie);

    const clearCookie = 'Path=/; HttpOnly; SameSite=Lax; Max-Age=0';

    const finish = (url: string) => {
      response.setHeader('Set-Cookie', [
        `google_oauth_state=; ${clearCookie}`,
        `google_oauth_next=; ${clearCookie}`,
      ]);

      return response.redirect(303, url);
    };

    const result = await this.completeGoogleLoginService.execute({
      code,
      state,
      expectedState,
      error,
    });

    if (!result) {
      return finish(
        `${this.config.getOrThrow<string>('WEB_ORIGIN')}/?auth=error`,
      );
    }

    response.setHeader('Set-Cookie', [
      `mcp_user_session=${encodeURIComponent(result.sessionToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200${request.secure ? '; Secure' : ''}`,
      `google_oauth_state=; ${clearCookie}`,
      `google_oauth_next=; ${clearCookie}`,
    ]);

    return response.redirect(
      303,
      `${this.config.getOrThrow<string>('WEB_ORIGIN')}${next === '/' ? '/?auth=success' : next
      }`,
    );
  }

  // ──────────────────────────────────────────────────────────────
  // SESSION MANAGEMENT
  // ──────────────────────────────────────────────────────────────

  // Get the current session profile
  @Get('api/auth/me')
  @ApiOperation({ summary: 'Get the signed-in profile' })
  async me(@Req() request: Request, @Res() response: Response) {
    noCache(response);

    const profile = await this.getSessionProfileService.execute(
      cookies(request)[this.sessionService.cookieName],
    );

    if (!profile) {
      return response.status(401).json({
        authenticated: false,
        user: null,
      });
    }

    return response.json({
      authenticated: true,
      user: profile,
    });
  }

  // Sign out of the dashboard
  @Delete('api/auth/session')
  @ApiOperation({ summary: 'Sign out of the dashboard' })
  signOut(@Res() response: Response) {
    noCache(response);

    response.setHeader(
      'Set-Cookie',
      `${this.sessionService.cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    );

    return response.json({ authenticated: false });
  }

  // ──────────────────────────────────────────────────────────────
  // GOOGLE ACCOUNT DISCONNECTION
  // ──────────────────────────────────────────────────────────────

  // Disconnect Google and revoke client grants
  @Delete('api/auth/disconnect')
  @ApiOperation({ summary: 'Disconnect Google and revoke client grants' })
  async disconnect(@Req() request: Request, @Res() response: Response) {
    const userId = await this.requireSessionService.execute(
      cookies(request)[this.sessionService.cookieName],
    );

    await this.disconnectGoogleAccountService.execute(userId);
    noCache(response);

    return response.json({ connected: false });
  }

  // Disconnect the signed-in Google account (OAuth endpoint)
  @Post('oauth/google-account/disconnect')
  @ApiOperation({ summary: 'Disconnect the signed-in Google account' })
  @ApiOkResponse({ type: GoogleAccountDisconnectResponseDto })
  async disconnectGoogleAccount(
    @Req() request: Request,
  ): Promise<GoogleAccountDisconnectResponseDto> {
    const userId = await this.requireSessionService.execute(
      cookies(request)[this.sessionService.cookieName],
    );

    return this.disconnectGoogleAccountService.execute(userId);
  }

  // ──────────────────────────────────────────────────────────────
  // USER PROFILE
  // ──────────────────────────────────────────────────────────────

  // Get the signed-in user's profile
  @Get('oauth/profile')
  @ApiOperation({ summary: 'Get the signed-in user profile' })
  @ApiOkResponse({ type: AuthProfileResponseDto })
  async profile(@Req() request: Request, @Res() response: Response) {
    noCache(response);

    const userId = await this.requireSessionService.execute(
      cookies(request)[this.sessionService.cookieName],
    );

    return await this.getProfileService.execute(userId);
  }
}
