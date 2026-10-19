import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { GoogleModule } from '../../google/google.module';
import { PrismaModule } from '../../../prisma/prisma.module';
import { OAuthAuthorizeModule } from '../oauth-authorize/oauth-authorize.module';
import { OAuthClientModule } from '../oauth-client/oauth-client.module';
import { CheckOAuthAccessTokenService } from './services/check-oauth-access-token.service';
import { ExchangeAuthorizationCodeService } from './services/exchange-authorization-code.service';
import { ExchangeOAuthTokenService } from './services/exchange-oauth-token.service';
import { IssueOAuthAccessTokenService } from './services/issue-oauth-access-token.service';
import { RefreshOAuthTokenService } from './services/refresh-oauth-token.service';
import { RevokeAllOAuthGrantsFromOAuthService } from './services/revoke-all-oauth-grants-from-oauth.service';
import { RevokeOAuthGrantFromOAuthService } from './services/revoke-oauth-grant-from-oauth.service';
import { RotateRefreshTokenService } from './services/rotate-refresh-token.service';
import { SaveRefreshTokenService } from './services/save-refresh-token.service';
import { OAuthTokenController } from './oauth-token.controller';

@Module({
  imports: [
    PrismaModule,
    CommonModule,
    GoogleModule,
    OAuthAuthorizeModule,
    OAuthClientModule,
  ],
  controllers: [OAuthTokenController],
  providers: [
    CheckOAuthAccessTokenService,
    ExchangeAuthorizationCodeService,
    ExchangeOAuthTokenService,
    IssueOAuthAccessTokenService,
    RefreshOAuthTokenService,
    RevokeAllOAuthGrantsFromOAuthService,
    RevokeOAuthGrantFromOAuthService,
    RotateRefreshTokenService,
    SaveRefreshTokenService,
  ],
  exports: [CheckOAuthAccessTokenService],
})
export class OAuthTokenModule {}
