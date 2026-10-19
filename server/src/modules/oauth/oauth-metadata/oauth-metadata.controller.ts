import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetAuthorizationServerMetadataService } from './get-authorization-server-metadata.service';
import { GetProtectedResourceMetadataService } from './get-protected-resource-metadata.service';

@ApiTags('OAuth Metadata')
@Controller('.well-known')
export class OAuthMetadataController {
  constructor(
    private readonly getAuthorizationServerMetadata: GetAuthorizationServerMetadataService,
    private readonly getProtectedResourceMetadata: GetProtectedResourceMetadataService,
  ) {}

  @Get('oauth-authorization-server')
  @ApiOperation({ summary: 'OAuth authorization server metadata' })
  @ApiOkResponse({ description: 'Authorization server capabilities' })
  authorizationServer() {
    return this.getAuthorizationServerMetadata.execute();
  }

  @Get('oauth-protected-resource')
  @ApiOperation({ summary: 'Protected resource metadata' })
  @ApiOkResponse({ description: 'Protected resource capabilities' })
  protectedResource() {
    return this.getProtectedResourceMetadata.execute();
  }
}
