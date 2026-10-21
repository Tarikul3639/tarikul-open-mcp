import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';

import { PrismaService } from '../../../prisma/prisma.service.js';
import { isAllowedRedirectUri } from '../utils/redirect.util.js';
import { AccessTokenService } from './access-token.service.js';

const MAX_REDIRECT_URIS = 10;
const MAX_CLIENT_NAME_LENGTH = 200;

const SUPPORTED_AUTH_METHODS = [
  'none',
  'client_secret_post',
  'client_secret_basic',
] as const;

type TokenEndpointAuthMethod = (typeof SUPPORTED_AUTH_METHODS)[number];

/**
 * OAuth 2.0 Dynamic Client Registration (RFC 7591).
 *
 * MCP clients (Claude, ChatGPT, Cursor, VS Code, MCP Inspector ...) call this
 * endpoint once to obtain a client_id before starting the authorization flow.
 * Registration alone grants nothing: the user still has to sign in and
 * approve the client on the consent page.
 */
@Injectable()
export class ClientRegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessTokens: AccessTokenService,
  ) {}

  async register(body: unknown) {
    const metadata = (body ?? {}) as Record<string, unknown>;

    const redirectUris = this.parseRedirectUris(metadata.redirect_uris);
    const clientName = this.parseClientName(metadata.client_name);
    const authMethod = this.parseAuthMethod(
      metadata.token_endpoint_auth_method,
    );
    const grantTypes = this.parseGrantTypes(metadata.grant_types);
    this.parseResponseTypes(metadata.response_types);

    const clientId = `mcp_${randomBytes(16).toString('hex')}`;
    const clientSecret =
      authMethod === 'none' ? undefined : randomBytes(32).toString('base64url');

    const client = await this.prisma.mcpOauthClient.create({
      data: {
        clientId,
        // Only a hash of the secret is stored.
        clientSecret: clientSecret
          ? this.accessTokens.hashToken(clientSecret)
          : null,
        redirectUris,
        clientName,
      },
    });

    return {
      client_id: client.clientId,
      client_id_issued_at: Math.floor(client.createdAt.getTime() / 1000),
      ...(clientSecret
        ? { client_secret: clientSecret, client_secret_expires_at: 0 }
        : {}),
      client_name: client.clientName ?? undefined,
      redirect_uris: redirectUris,
      grant_types: grantTypes,
      response_types: ['code'],
      token_endpoint_auth_method: authMethod,
    };
  }

  private fail(error: string, description: string): never {
    throw new BadRequestException({
      error,
      error_description: description,
    });
  }

  private parseRedirectUris(value: unknown): string[] {
    if (!Array.isArray(value) || value.length === 0) {
      this.fail('invalid_redirect_uri', 'redirect_uris is required');
    }

    if (value.length > MAX_REDIRECT_URIS) {
      this.fail(
        'invalid_redirect_uri',
        `At most ${MAX_REDIRECT_URIS} redirect_uris are allowed`,
      );
    }

    for (const uri of value) {
      if (!isAllowedRedirectUri(uri)) {
        this.fail(
          'invalid_redirect_uri',
          `Redirect URI is not allowed: ${String(uri).slice(0, 200)}`,
        );
      }
    }

    return [...new Set(value as string[])];
  }

  private parseClientName(value: unknown): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    if (typeof value !== 'string') {
      this.fail('invalid_client_metadata', 'client_name must be a string');
    }

    const name = value.trim().slice(0, MAX_CLIENT_NAME_LENGTH);

    return name.length > 0 ? name : null;
  }

  private parseAuthMethod(value: unknown): TokenEndpointAuthMethod {
    if (value === undefined || value === null) {
      // MCP clients are public clients that use PKCE.
      return 'none';
    }

    if (
      typeof value !== 'string' ||
      !SUPPORTED_AUTH_METHODS.includes(value as TokenEndpointAuthMethod)
    ) {
      this.fail(
        'invalid_client_metadata',
        `Unsupported token_endpoint_auth_method: ${JSON.stringify(value)}`,
      );
    }

    return value as TokenEndpointAuthMethod;
  }

  private parseGrantTypes(value: unknown): string[] {
    const supported = ['authorization_code', 'refresh_token'];

    if (value === undefined || value === null) {
      return supported;
    }

    if (
      !Array.isArray(value) ||
      value.length === 0 ||
      !value.every((type) => supported.includes(type as string))
    ) {
      this.fail(
        'invalid_client_metadata',
        'Only authorization_code and refresh_token grant types are supported',
      );
    }

    if (!value.includes('authorization_code')) {
      this.fail(
        'invalid_client_metadata',
        'authorization_code grant type is required',
      );
    }

    return [...new Set(value as string[])];
  }

  private parseResponseTypes(value: unknown) {
    if (value === undefined || value === null) {
      return;
    }

    if (
      !Array.isArray(value) ||
      value.length === 0 ||
      !value.every((type) => type === 'code')
    ) {
      this.fail(
        'invalid_client_metadata',
        'Only the "code" response type is supported',
      );
    }
  }
}
