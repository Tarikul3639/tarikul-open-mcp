import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { cookies, noCache, safeNext } from '../../common/utils/http';
import { AuthService } from './auth.service';
import { AuthProfileResponseDto } from './dto/auth-profile-response.dto';

@ApiTags('Authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('api/auth/login')
  @ApiOperation({ summary: 'Start Google sign-in' })
  login(
    @Req() request: Request,
    @Res() response: Response,
    @Query('next') next?: string,
  ) {
    const { state, url } = this.authService.startGoogleLogin();
    const secure = request.secure ? '; Secure' : '';
    const options = `; Path=/api/auth/callback; HttpOnly; SameSite=Lax; Max-Age=600${secure}`;
    response.setHeader('Set-Cookie', [
      `google_oauth_state=${state}${options}`,
      `google_oauth_next=${encodeURIComponent(safeNext(next))}${options}`,
    ]);
    return response.redirect(302, url);
  }

  @Get('api/auth/callback')
  @ApiOperation({ summary: 'Complete Google sign-in' })
  async callback(
    @Req() request: Request,
    @Res() response: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('error') error?: string,
  ) {
    const jar = cookies(request);
    const next = safeNext(jar.google_oauth_next);
    const clearCookie =
      'Path=/api/auth/callback; HttpOnly; SameSite=Lax; Max-Age=0';
    const finish = (url: string) => {
      response.setHeader('Set-Cookie', [
        `google_oauth_state=; ${clearCookie}`,
        `google_oauth_next=; ${clearCookie}`,
      ]);
      return response.redirect(303, url);
    };

    const result = await this.authService.completeGoogleLogin({
      code,
      state,
      expectedState: jar.google_oauth_state,
      error,
    });
    if (!result) return finish(`${this.authService.issuer}/?auth=error`);

    response.setHeader('Set-Cookie', [
      `mcp_user_session=${encodeURIComponent(result.sessionToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200${request.secure ? '; Secure' : ''}`,
      `google_oauth_state=; ${clearCookie}`,
      `google_oauth_next=; ${clearCookie}`,
    ]);
    return response.redirect(
      303,
      `${this.authService.issuer}${next === '/' ? '/?auth=success' : next}`,
    );
  }

  @Get('api/auth/me')
  @ApiOperation({ summary: 'Get the signed-in profile' })
  async me(@Req() request: Request, @Res() response: Response) {
    noCache(response);
    const profile = await this.authService.getSessionProfile(
      cookies(request)[this.authService.sessionCookie],
    );
    if (!profile) {
      return response.status(401).json({ authenticated: false, user: null });
    }
    return response.json({ authenticated: true, user: profile });
  }

  @Delete('api/auth/session')
  @ApiOperation({ summary: 'Sign out of the dashboard' })
  signOut(@Res() response: Response) {
    noCache(response);
    response.setHeader(
      'Set-Cookie',
      `${this.authService.sessionCookie}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    );
    return response.json({ authenticated: false });
  }

  @Delete('api/auth/disconnect')
  @ApiOperation({ summary: 'Disconnect Google and revoke client grants' })
  async disconnect(@Req() request: Request, @Res() response: Response) {
    const userId = await this.authService.sessionUser(
      cookies(request)[this.authService.sessionCookie],
    );
    if (!userId) return response.status(401).json({ error: 'Unauthorized' });
    await this.authService.disconnectGoogleAccount(userId);
    noCache(response);
    return response.json({ connected: false });
  }

  @Get('oauth/profile')
  @ApiOperation({ summary: 'Get the signed-in user profile' })
  @ApiOkResponse({ type: AuthProfileResponseDto })
  async profile(@Req() request: Request, @Res() response: Response) {
    noCache(response);
    const userId = await this.authService.requireSession(
      cookies(request)[this.authService.sessionCookie],
    );
    const profile = await this.authService.getProfile(userId);
    if (!profile)
      throw new NotFoundException('Signed-in user profile was not found.');
    return response.json(profile);
  }
}
