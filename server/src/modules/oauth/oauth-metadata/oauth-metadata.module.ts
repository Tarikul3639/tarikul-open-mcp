import { Module } from '@nestjs/common';
import { OAuthMetadataController } from './oauth-metadata.controller';
import { GetAuthorizationServerMetadataService } from './get-authorization-server-metadata.service';
import { GetProtectedResourceMetadataService } from './get-protected-resource-metadata.service';

@Module({
  controllers: [OAuthMetadataController],
  providers: [
    GetAuthorizationServerMetadataService,
    GetProtectedResourceMetadataService,
  ],
})
export class OAuthMetadataModule {}
