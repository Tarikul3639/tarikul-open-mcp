import { Module } from '@nestjs/common';

import { OAuthController } from './controllers/oauth.controller';
import { AuthController } from './controllers/auth.controller';
import { ClientAccessController } from './controllers/client-access.controller';
import { CalendarController } from './controllers/calendar.controller';

import { GoogleAuthService } from './services/google-auth.service';
import { OAuthStateService } from './services/oauth-state.service';
import { AuthUserService } from './services/auth-user.service';
import { ClientAccessService } from './services/client-access.service';
import { CalendarService } from './services/calendar.service';
import { SessionService } from './services/session.service';
import { SessionGuard } from './guards/session.guard';

@Module({
  controllers: [
    OAuthController,
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
    SessionGuard,
  ],
  exports: [
    GoogleAuthService,
    OAuthStateService,
    AuthUserService,
    ClientAccessService,
    CalendarService,
    SessionService,
    SessionGuard,
  ],
})
export class AuthModule { }