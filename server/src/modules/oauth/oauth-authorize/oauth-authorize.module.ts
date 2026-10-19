import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { GoogleModule } from '../../google/google.module';
import { PrismaModule } from '../../../prisma/prisma.module';
import { CreateAuthorizationCodeService } from './services/create-authorization-code.service';
import { ConsumeAuthorizationCodeService } from './services/consume-authorization-code.service';
import { ConsumeAuthorizationCodeForTokenService } from './services/consume-authorization-code-for-token.service';
import { OAuthClientModule } from '../oauth-client/oauth-client.module';
import { OAuthAuthorizeController } from './oauth-authorize.controller';
import { AuthorizeOAuthClientService } from './services/authorize-oauth-client.service';
import { CreateDashboardAuthorizationCodeService } from './services/create-dashboard-authorization-code.service';
import { ConsumeDashboardAuthorizationCodeService } from './services/consume-dashboard-authorization-code.service';

@Module({
  imports: [PrismaModule, CommonModule, GoogleModule, OAuthClientModule],
  controllers: [OAuthAuthorizeController],
  providers: [
    AuthorizeOAuthClientService,
    CreateDashboardAuthorizationCodeService,
    ConsumeDashboardAuthorizationCodeService,
    CreateAuthorizationCodeService,
    ConsumeAuthorizationCodeService,
    ConsumeAuthorizationCodeForTokenService,
  ],
  exports: [ConsumeAuthorizationCodeForTokenService],
})
export class OAuthAuthorizeModule {}
