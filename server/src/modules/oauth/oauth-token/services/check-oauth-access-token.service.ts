import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify } from 'jose';

@Injectable()
export class CheckOAuthAccessTokenService {
  private readonly issuer: string;
  private readonly resource: string;
  private readonly key: Uint8Array;

  constructor(config: ConfigService) {
    this.issuer = config.getOrThrow<string>('MCP_BASE_URL');
    this.resource = `${this.issuer}/api/mcp`;
    
    this.key = new TextEncoder().encode(
      config.getOrThrow<string>('MCP_AUTH_SECRET'),
    );
  }

  async execute(token: string) {
    try {
      const { payload } = await jwtVerify(token, this.key, {
        issuer: this.issuer,
        audience: this.resource,
        algorithms: ['HS256'],
      });
      if (
        typeof payload.sub !== 'string' ||
        typeof payload.client_id !== 'string' ||
        payload.scope !== 'calendar'
      )
        return null;
      return { userId: payload.sub, clientId: payload.client_id };
    } catch {
      return null;
    }
  }
}
