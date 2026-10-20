import { createHash, randomBytes } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignJWT, jwtVerify } from 'jose';

import { EnvService } from '../../../config/env.service.js';

@Injectable()
export class AccessTokenService {
    constructor(private readonly env: EnvService) { }

    private get secret(): Uint8Array {
        const secret = this.env.mcpAuthSecret;

        if (!secret || secret.length < 32) {
            throw new Error('MCP_AUTH_SECRET must contain at least 32 characters');
        }

        return new TextEncoder().encode(secret);
    }

    async create(userId: string, clientId: string) {
        const token = await new SignJWT({ client_id: clientId })
            .setProtectedHeader({ alg: 'HS256' })
            .setSubject(userId)
            .setIssuer(this.env.mcpIssuerUrl)
            .setAudience(this.env.mcpResourceUrl)
            .setIssuedAt()
            .setExpirationTime('15m')
            .sign(this.secret);

        return {
            access_token: token,
            token_type: 'Bearer',
            expires_in: 900,
        };
    }

    async verify(token: string) {
        try {
            const { payload } = await jwtVerify(token, this.secret, {
                issuer: this.env.mcpIssuerUrl,
                audience: this.env.mcpResourceUrl,
            });

            if (
                typeof payload.sub !== 'string' ||
                typeof payload.client_id !== 'string'
            ) {
                throw new Error('Invalid token claims');
            }

            return {
                userId: payload.sub,
                clientId: payload.client_id,
            };
        } catch {
            throw new UnauthorizedException('Invalid or expired access token');
        }
    }

    hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    createOpaqueToken(): string {
        return randomBytes(32).toString('base64url');
    }
}
