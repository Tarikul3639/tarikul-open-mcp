import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import { PrismaService } from '../../../prisma/prisma.service.js';
import { AccessTokenService } from './access-token.service.js';

export interface AuthorizationRequest {
    clientId: string;
    redirectUri: string;
    codeChallenge: string;
    codeChallengeMethod: string;
    state?: string;
}

@Injectable()
export class McpOauthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly accessTokens: AccessTokenService,
    ) { }

    // ──────────────────────────────────────────────────────────────
    // Client / request validation
    // ──────────────────────────────────────────────────────────────

    private async validateClient(clientId: string, redirectUri: string) {
        const client = await this.prisma.mcpOauthClient.findUnique({
            where: { clientId },
        });

        const redirectUris = Array.isArray(client?.redirectUris)
            ? client.redirectUris
            : [];

        if (
            !client ||
            !redirectUris.includes(redirectUri)
        ) {
            throw new BadRequestException('Invalid OAuth client or redirect URI');
        }

        return client;
    }

    /**
     * Validates an authorization request. Errors here are never redirected
     * back to the client, because the redirect URI itself is not trusted yet.
     */
    async validateAuthorizationRequest(input: AuthorizationRequest) {
        if (
            !input.clientId ||
            !input.redirectUri ||
            !input.codeChallenge ||
            input.codeChallengeMethod !== 'S256'
        ) {
            throw new BadRequestException('Invalid authorization request');
        }

        return this.validateClient(input.clientId, input.redirectUri);
    }

    /**
     * Public information shown on the consent page.
     */
    async getClientInfo(clientId: string, redirectUri: string) {
        const client = await this.validateClient(clientId, redirectUri);

        return {
            client_id: client.clientId,
            client_name: client.clientName,
            redirect_uri: redirectUri,
        };
    }

    /**
     * Verifies the client secret for confidential clients.
     * Public clients (registered with token_endpoint_auth_method "none")
     * have no stored secret and rely on PKCE instead.
     */
    private async authenticateClient(clientId: string, clientSecret?: string) {
        const client = await this.prisma.mcpOauthClient.findUnique({
            where: { clientId },
        });

        if (!client) {
            throw new UnauthorizedException('Unknown OAuth client');
        }

        if (!client.clientSecret) {
            return client;
        }

        if (!clientSecret) {
            throw new UnauthorizedException('Client authentication failed');
        }

        const expected = Buffer.from(client.clientSecret);
        const actual = Buffer.from(this.accessTokens.hashToken(clientSecret));

        if (
            expected.length !== actual.length ||
            !timingSafeEqual(expected, actual)
        ) {
            throw new UnauthorizedException('Client authentication failed');
        }

        return client;
    }

    // ──────────────────────────────────────────────────────────────
    // Grants
    // ──────────────────────────────────────────────────────────────

    async hasActiveGrant(userId: string, clientId: string): Promise<boolean> {
        const grant = await this.prisma.mcpClientAccess.findUnique({
            where: {
                userId_clientId: { userId, clientId },
            },
        });

        return Boolean(grant && !grant.revokedAt);
    }

    /**
     * Records the user's consent for this client. A previously revoked
     * grant is re-activated when the user explicitly approves again.
     */
    private async grantAccess(userId: string, clientId: string) {
        await this.prisma.mcpClientAccess.upsert({
            where: {
                userId_clientId: { userId, clientId },
            },
            create: { userId, clientId },
            update: { revokedAt: null },
        });
    }

    // ──────────────────────────────────────────────────────────────
    // Authorization endpoint
    // ──────────────────────────────────────────────────────────────

    /**
     * Issues an authorization code for a user that already granted access.
     */
    async authorize(input: AuthorizationRequest & { userId: string }) {
        if (!input.userId) {
            throw new BadRequestException('Invalid authorization request');
        }

        await this.validateAuthorizationRequest(input);

        if (!(await this.hasActiveGrant(input.userId, input.clientId))) {
            throw new UnauthorizedException(
                'User has not authorized this OAuth client',
            );
        }

        return this.issueCode(input);
    }

    /**
     * Handles the user's decision on the consent page.
     * Approve: store the grant and redirect with a code.
     * Deny: redirect with error=access_denied (RFC 6749 §4.1.2.1).
     */
    async decide(
        input: AuthorizationRequest & { userId: string; approved: boolean },
    ) {
        if (!input.userId) {
            throw new BadRequestException('Invalid authorization request');
        }

        await this.validateAuthorizationRequest(input);

        if (!input.approved) {
            const callback = new URL(input.redirectUri);
            callback.searchParams.set('error', 'access_denied');
            callback.searchParams.set(
                'error_description',
                'The user denied access',
            );

            if (input.state) {
                callback.searchParams.set('state', input.state);
            }

            return { redirectUrl: callback.toString() };
        }

        await this.grantAccess(input.userId, input.clientId);

        return this.issueCode(input);
    }

    private async issueCode(input: AuthorizationRequest & { userId: string }) {
        const code = randomBytes(32).toString('base64url');

        await this.prisma.mcpAuthorizationCode.create({
            data: {
                code,
                clientId: input.clientId,
                redirectUri: input.redirectUri,
                codeChallenge: input.codeChallenge,
                codeChallengeMethod: 'S256',
                userId: input.userId,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            },
        });

        const callback = new URL(input.redirectUri);
        callback.searchParams.set('code', code);

        if (input.state) {
            callback.searchParams.set('state', input.state);
        }

        return { redirectUrl: callback.toString() };
    }

    // ──────────────────────────────────────────────────────────────
    // Token endpoint
    // ──────────────────────────────────────────────────────────────

    async exchangeCode(input: {
        code: string;
        clientId: string;
        clientSecret?: string;
        redirectUri: string;
        codeVerifier: string;
    }) {
        if (
            !input.code ||
            !input.clientId ||
            !input.redirectUri ||
            !input.codeVerifier
        ) {
            throw new BadRequestException('Missing token request parameters');
        }

        await this.authenticateClient(input.clientId, input.clientSecret);

        const saved = await this.prisma.mcpAuthorizationCode.findUnique({
            where: { code: input.code },
        });

        if (
            !saved ||
            saved.clientId !== input.clientId ||
            saved.redirectUri !== input.redirectUri ||
            !saved.expiresAt ||
            saved.expiresAt.getTime() <= Date.now()
        ) {
            throw new UnauthorizedException('Invalid or expired authorization code');
        }

        const actualChallenge = createHash('sha256')
            .update(input.codeVerifier)
            .digest('base64url');

        const expected = Buffer.from(saved.codeChallenge);
        const actual = Buffer.from(actualChallenge);

        if (
            expected.length !== actual.length ||
            !timingSafeEqual(expected, actual)
        ) {
            throw new UnauthorizedException('PKCE verification failed');
        }

        if (!(await this.hasActiveGrant(saved.userId, saved.clientId))) {
            throw new UnauthorizedException('OAuth client access was revoked');
        }

        // Consume the code atomically; a concurrent exchange must fail.
        const consumed = await this.prisma.mcpAuthorizationCode.deleteMany({
            where: { code: saved.code },
        });

        if (consumed.count !== 1) {
            throw new UnauthorizedException('Invalid or expired authorization code');
        }

        const access = await this.accessTokens.create(
            saved.userId,
            saved.clientId,
        );

        const refreshToken = this.accessTokens.createOpaqueToken();

        await this.prisma.mcpRefreshToken.create({
            data: {
                tokenHash: this.accessTokens.hashToken(refreshToken),
                clientId: saved.clientId,
                userId: saved.userId,
                familyId: randomBytes(16).toString('hex'),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });

        return {
            ...access,
            refresh_token: refreshToken,
        };
    }

    async refresh(input: {
        refreshToken: string;
        clientId: string;
        clientSecret?: string;
    }) {
        if (!input.refreshToken || !input.clientId) {
            throw new BadRequestException('Missing refresh token parameters');
        }

        await this.authenticateClient(input.clientId, input.clientSecret);

        const tokenHash = this.accessTokens.hashToken(input.refreshToken);

        const saved = await this.prisma.mcpRefreshToken.findUnique({
            where: { tokenHash },
        });

        if (
            !saved ||
            saved.clientId !== input.clientId ||
            saved.usedAt ||
            !saved.expiresAt ||
            saved.expiresAt.getTime() <= Date.now()
        ) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        if (!(await this.hasActiveGrant(saved.userId, saved.clientId))) {
            throw new UnauthorizedException('OAuth client access was revoked');
        }

        // Consume the refresh token once; a concurrent use must fail.
        const consumed = await this.prisma.mcpRefreshToken.updateMany({
            where: {
                tokenHash,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            data: { usedAt: new Date() },
        });

        if (consumed.count !== 1) {
            throw new UnauthorizedException('Refresh token has already been used');
        }

        const refreshToken = this.accessTokens.createOpaqueToken();

        await this.prisma.mcpRefreshToken.create({
            data: {
                tokenHash: this.accessTokens.hashToken(refreshToken),
                clientId: saved.clientId,
                userId: saved.userId,
                familyId: saved.familyId,
                expiresAt: saved.expiresAt,
            },
        });

        return {
            ...(await this.accessTokens.create(saved.userId, saved.clientId)),
            refresh_token: refreshToken,
        };
    }
}
