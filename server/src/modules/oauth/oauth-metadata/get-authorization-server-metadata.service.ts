import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GetAuthorizationServerMetadataService {
  private readonly issuer: string;

  constructor(config: ConfigService) {
    this.issuer = config.getOrThrow<string>('MCP_BASE_URL');
  }

  execute() {
    return {
      issuer: this.issuer,
      authorization_endpoint: `${this.issuer}/api/oauth/authorize`,
      token_endpoint: `${this.issuer}/api/oauth/token`,
      registration_endpoint: `${this.issuer}/api/oauth/register`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['none'],
    };
  }
}
