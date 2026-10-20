import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { GoogleController } from './google.controller';
import { GoogleCalendarClientService } from './services/google-calendar-client.service';
import { GoogleLoginUrlService } from './services/google-login-url.service';
import { GoogleOAuthCallbackService } from './services/google-oauth-callback.service';
import { GoogleProfileService } from './services/google-profile.service';
import { GoogleTokenRevokeService } from './services/google-token-revoke.service';
import { GoogleTokensService } from './services/google-tokens.service';
import { OAuthClientService } from './services/oauth-client.service';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [GoogleController],
  providers: [
    OAuthClientService,
    GoogleLoginUrlService,
    GoogleOAuthCallbackService,
    GoogleProfileService,
    GoogleTokensService,
    GoogleTokenRevokeService,
    GoogleCalendarClientService,
  ],
  exports: [
    OAuthClientService,
    GoogleLoginUrlService,
    GoogleOAuthCallbackService,
    GoogleProfileService,
    GoogleTokensService,
    GoogleTokenRevokeService,
    GoogleCalendarClientService,
  ],
})
export class GoogleModule {}
