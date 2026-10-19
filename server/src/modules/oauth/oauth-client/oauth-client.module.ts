import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { PrismaModule } from '../../../prisma/prisma.module';
import { CheckOAuthGrantService } from './services/check-oauth-grant.service';
import { EnsureOAuthGrantService } from './services/ensure-oauth-grant.service';
import { GetOAuthClientRecordService } from './services/get-oauth-client-record.service';
import { GetOAuthClientService } from './services/get-oauth-client.service';
import { ListOAuthGrantsForUserService } from './services/list-oauth-grants-for-user.service';
import { ListOAuthGrantsService } from './services/list-oauth-grants.service';
import { RegisterOAuthClientService } from './services/register-oauth-client.service';
import { RequireOAuthSessionService } from './services/require-oauth-session.service';
import { RestoreOAuthClientGrantService } from './services/restore-oauth-client-grant.service';
import { RestoreOAuthGrantService } from './services/restore-oauth-grant.service';
import { RevokeAllOAuthGrantsService } from './services/revoke-all-oauth-grants.service';
import { RevokeOAuthClientGrantService } from './services/revoke-oauth-client-grant.service';
import { RevokeOAuthGrantService } from './services/revoke-oauth-grant.service';
import { SaveOAuthClientRecordService } from './services/save-oauth-client-record.service';
import { SaveOAuthClientService } from './services/save-oauth-client.service';
import { OAuthClientController } from './oauth-client.controller';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [OAuthClientController],
  providers: [
    CheckOAuthGrantService,
    EnsureOAuthGrantService,
    GetOAuthClientRecordService,
    GetOAuthClientService,
    ListOAuthGrantsForUserService,
    ListOAuthGrantsService,
    RegisterOAuthClientService,
    RequireOAuthSessionService,
    RestoreOAuthClientGrantService,
    RestoreOAuthGrantService,
    RevokeAllOAuthGrantsService,
    RevokeOAuthClientGrantService,
    RevokeOAuthGrantService,
    SaveOAuthClientRecordService,
    SaveOAuthClientService,
  ],
  exports: [
    CheckOAuthGrantService,
    EnsureOAuthGrantService,
    GetOAuthClientRecordService,
    ListOAuthGrantsForUserService,
    RequireOAuthSessionService,
    RestoreOAuthGrantService,
    RevokeAllOAuthGrantsService,
    RevokeOAuthGrantService,
    SaveOAuthClientRecordService,
  ],
})
export class OAuthClientModule {}
