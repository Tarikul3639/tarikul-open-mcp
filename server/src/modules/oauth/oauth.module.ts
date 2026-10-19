import { Module } from '@nestjs/common';
import { OAuthMetadataModule } from './oauth-metadata/oauth-metadata.module';
import { OAuthAuthorizeModule } from './oauth-authorize/oauth-authorize.module';
import { OAuthClientModule } from './oauth-client/oauth-client.module';
import { OAuthTokenModule } from './oauth-token/oauth-token.module';

@Module({
  imports: [
    OAuthClientModule,
    OAuthAuthorizeModule,
    OAuthTokenModule,
    OAuthMetadataModule,
  ],
  exports: [OAuthClientModule, OAuthTokenModule],
})
export class OAuthModule { }
