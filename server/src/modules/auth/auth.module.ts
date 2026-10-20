import { Module } from '@nestjs/common';

import { OAuthController } from './controllers/oauth.controller.js';
import { McpOauthController } from './controllers/mcp-oauth.controller.js';
import { AuthController } from './controllers/auth.controller.js';
import { ClientAccessController } from './controllers/client-access.controller.js';
import { CalendarController } from './controllers/calendar.controller.js';

import { GoogleAuthService } from './services/google-auth.service.js';
import { OAuthStateService } from './services/oauth-state.service.js';
import { AuthUserService } from './services/auth-user.service.js';
import { ClientAccessService } from './services/client-access.service.js';
import { CalendarService } from './services/calendar.service.js';
import { SessionService } from './services/session.service.js';
import { McpOauthService } from './services/mcp-oauth.service.js';
import { AccessTokenService } from './services/access-token.service.js';

import { SessionGuard } from './guards/session.guard.js';

@Module({
  controllers: [
    OAuthController,
    McpOauthController,
    AuthController,
    ClientAccessController,
    CalendarController,
  ],
  providers: [
    GoogleAuthService,
    OAuthStateService,
    AuthUserService,
    ClientAccessService,
    CalendarService,
    SessionService,
    McpOauthService,
    AccessTokenService,
    SessionGuard,
  ],
  exports: [
    GoogleAuthService,
    OAuthStateService,
    AuthUserService,
    ClientAccessService,
    CalendarService,
    SessionService,
    McpOauthService,
    AccessTokenService,
    SessionGuard,
  ],
})
export class AuthModule { }