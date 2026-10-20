import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import { PrismaService } from '../../../prisma/prisma.service.js';
import { EnvService } from '../../../config/env.service.js';
import { AccessTokenService } from './access-token.service.js';

@Injectable()
export class McpOauthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly env: EnvService,
        private readonly accessTokens: AccessTokenService,
    ) { }

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

    async authorize(input: {
        userId: string;
        clientId: string;
        redirectUri: string;
        codeChallenge: string;
        codeChallengeMethod: string;
        state?: string;
    }) {
        if (
            !input.userId ||
            !input.clientId ||
            !input.redirectUri ||
            !input.codeChallenge ||
            input.codeChallengeMethod !== 'S256'
        ) {
            throw new BadRequestException('Invalid authorization request');
        }

        await this.validateClient(input.clientId, input.redirectUri);

        const grant = await this.prisma.mcpClientAccess.findUnique({
            where: {
                userId_clientId: {
                    userId: input.userId,
                    clientId: input.clientId,
                },
            },
        });

        if (!grant || grant.revokedAt) {
            throw new UnauthorizedException(
                'User has not authorized this OAuth client',
            );
        }

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

    async exchangeCode(input: {
        code: string;
        clientId: string;
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

        const grant = await this.prisma.mcpClientAccess.findUnique({
            where: {
                userId_clientId: {
                    userId: saved.userId,
                    clientId: saved.clientId,
                },
            },
        });

        if (!grant || grant.revokedAt) {
            throw new UnauthorizedException('OAuth client access was revoked');
        }

        // Delete before issuing tokens to prevent authorization-code reuse.
        await this.prisma.mcpAuthorizationCode.delete({
            where: { code: saved.code },
        });

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

    async refresh(input: { refreshToken: string; clientId: string }) {
        if (!input.refreshToken || !input.clientId) {
            throw new BadRequestException('Missing refresh token parameters');
        }

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

        const grant = await this.prisma.mcpClientAccess.findUnique({
            where: {
                userId_clientId: {
                    userId: saved.userId,
                    clientId: saved.clientId,
                },
            },
        });

        if (!grant || grant.revokedAt) {
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