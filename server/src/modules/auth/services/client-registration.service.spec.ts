import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { ClientRegistrationService } from './client-registration.service.js';

function setup() {
    const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
        ...data,
        createdAt: new Date('2026-01-01T00:00:00Z'),
    }));
    const prisma = { mcpOauthClient: { create } };
    const accessTokens = { hashToken: (value: string) => `hash:${value}` };

    return {
        create,
        service: new ClientRegistrationService(prisma as never, accessTokens as never),
    };
}

describe('ClientRegistrationService', () => {
    it('registers a public client', async () => {
        const { service, create } = setup();

        const result = await service.register({
            client_name: 'Claude',
            redirect_uris: ['https://claude.ai/api/mcp/auth_callback'],
            token_endpoint_auth_method: 'none',
            logo_uri: 'https://claude.ai/logo.png',
        });

        expect(result.client_id).toMatch(/^mcp_[0-9a-f]{32}$/);
        expect(result).not.toHaveProperty('client_secret');
        expect(result.token_endpoint_auth_method).toBe('none');
        expect(create.mock.calls[0][0].data.clientSecret).toBeNull();
    });

    it('stores only a hash of a confidential client secret', async () => {
        const { service, create } = setup();

        const result = await service.register({
            redirect_uris: ['https://app.example.com/cb'],
            token_endpoint_auth_method: 'client_secret_post',
        });

        expect(result.client_secret).toBeTruthy();
        expect(create.mock.calls[0][0].data.clientSecret).toBe(
            `hash:${result.client_secret}`,
        );
    });

    it.each([
        [{}],
        [{ redirect_uris: [] }],
        [{ redirect_uris: ['http://evil.com/cb'] }],
        [{ redirect_uris: ['https://ok.com/cb'], grant_types: ['client_credentials'] }],
        [{ redirect_uris: ['https://ok.com/cb'], response_types: ['token'] }],
        [{ redirect_uris: ['https://ok.com/cb'], token_endpoint_auth_method: 'private_key_jwt' }],
    ])('rejects invalid metadata %j', async (body) => {
        await expect(setup().service.register(body)).rejects.toBeInstanceOf(
            BadRequestException,
        );
    });
});
