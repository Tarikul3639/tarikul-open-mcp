import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from './env.config.js';

@Injectable()
export class EnvService {
  constructor(private readonly config: ConfigService<EnvConfig, true>) {}

  get nodeEnv() {
    return this.config.get('NODE_ENV', { infer: true });
  }

  get isProduction() {
    return this.nodeEnv === 'production';
  }

  get port() {
    return this.config.get('PORT', { infer: true });
  }

  get webOrigin() {
    return this.config.get('WEB_ORIGIN', { infer: true });
  }

  /** Comma-separated CORS_ORIGINS parsed into a list. */
  get corsOrigins(): string[] {
    return this.config
      .get('CORS_ORIGINS', { infer: true })
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);
  }

  get googleClientId() {
    return this.config.get('GOOGLE_CLIENT_ID', { infer: true });
  }

  get googleClientSecret() {
    return this.config.get('GOOGLE_CLIENT_SECRET', { infer: true });
  }

  get googleRedirectUri() {
    return this.config.get('GOOGLE_REDIRECT_URI', { infer: true });
  }

  get googleCalendarRedirectUri() {
    return this.config.get('GOOGLE_CALENDAR_REDIRECT_URI', { infer: true });
  }

  get googleAuthUrl() {
    return this.config.get('GOOGLE_AUTH_URL', { infer: true });
  }

  get databaseUrl() {
    return this.config.get('DATABASE_URL', { infer: true });
  }

  get mcpBaseUrl() {
    return this.config.get('MCP_BASE_URL', { infer: true });
  }

  get mcpIssuerUrl() {
    return this.config.get('MCP_ISSUER_URL', { infer: true });
  }

  get mcpResourceUrl() {
    return this.config.get('MCP_RESOURCE_URL', { infer: true });
  }

  get mcpAuthSecret() {
    return this.config.get('MCP_AUTH_SECRET', { infer: true });
  }
}
