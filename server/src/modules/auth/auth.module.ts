import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { GoogleModule } from '../google/google.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { CompleteGoogleLoginService } from './services/complete-google-login.service';
import { DisconnectGoogleAccountService } from './services/disconnect-google-account.service';
import { GetProfileService } from './services/get-profile.service';
import { GetSessionProfileService } from './services/get-session-profile.service';
import { RequireSessionService } from './services/require-session.service';
import { SessionUserService } from './services/session-user.service';
import { StartGoogleLoginService } from './services/start-google-login.service';

@Module({
  imports: [PrismaModule, GoogleModule, CommonModule],
  controllers: [AuthController],
  providers: [
    StartGoogleLoginService,
    CompleteGoogleLoginService,
    SessionUserService,
    RequireSessionService,
    GetSessionProfileService,
    GetProfileService,
    DisconnectGoogleAccountService,
  ],
})
export class AuthModule {}
