import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignJWT } from 'jose';

@Injectable()
export class IssueOAuthAccessTokenService {
  private readonly issuer: string;
  private readonly key: Uint8Array;

  constructor(config: ConfigService) {
    this.issuer = config.getOrThrow<string>('MCP_BASE_URL');
    this.key = new TextEncoder().encode(config.getOrThrow<string>('MCP_AUTH_SECRET'));
  }

  execute(userId: string, clientId: string): Promise<string> {
    return new SignJWT({ client_id: clientId, scope: 'calendar' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer(this.issuer)
      .setAudience(`${this.issuer}/api/mcp`)
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(this.key);
  }
}
