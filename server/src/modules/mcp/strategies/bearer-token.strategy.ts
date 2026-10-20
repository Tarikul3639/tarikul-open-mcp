import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AccessTokenService } from '../../auth/services/access-token.service.js';

export interface BearerTokenIdentity {
    userId: string;
    clientId: string;
    token: string;
}

@Injectable()
export class BearerTokenStrategy {
    constructor(
        private readonly accessTokenService: AccessTokenService,
    ) { }

    async authenticate(
        authorization?: string,
    ): Promise<BearerTokenIdentity> {
        const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];

        if (!token) {
            throw new UnauthorizedException('Bearer token is required');
        }

        try {
            const identity = await this.accessTokenService.verify(token);

            return {
                ...identity,
                token,
            };
        } catch {
            throw new UnauthorizedException('Invalid or expired access token');
        }
    }
}
