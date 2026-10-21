import { Injectable } from '@nestjs/common';
import { EnvService } from '../../../config/env.service.js';

@Injectable()
export class WellKnownService {
    constructor(private readonly env: EnvService) { }

    getAuthorizationServerMetadata() {
        const issuer = this.env.mcpIssuerUrl;

        return {
            issuer,
            authorization_endpoint: `${issuer}/api/auth/authorize`,
            token_endpoint: `${issuer}/api/auth/token`,
            registration_endpoint: `${issuer}/api/auth/register`,
            response_types_supported: ['code'],
            grant_types_supported: ['authorization_code', 'refresh_token'],
            code_challenge_methods_supported: ['S256'],
            token_endpoint_auth_methods_supported: [
                'none',
                'client_secret_post',
                'client_secret_basic',
            ],
        };
    }

    getProtectedResourceMetadata() {
        return {
            resource: this.env.mcpResourceUrl,
            authorization_servers: [this.env.mcpIssuerUrl],
            bearer_methods_supported: ['header'],
            resource_name: "Tarikul's Personal MCP Server",
        };
    }
}
