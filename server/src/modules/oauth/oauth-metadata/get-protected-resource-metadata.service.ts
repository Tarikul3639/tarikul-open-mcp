import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GetProtectedResourceMetadataService {
  private readonly issuer: string;

  constructor(config: ConfigService) {
    this.issuer = config.getOrThrow<string>('MCP_BASE_URL');
  }

  execute() {
    return {
      resource: `${this.issuer}/api/mcp`,
      authorization_servers: [this.issuer],
      scopes_supported: ['calendar'],
      bearer_methods_supported: ['header'],
    };
  }
}
