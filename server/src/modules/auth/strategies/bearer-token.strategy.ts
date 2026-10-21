import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

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
            throw new RpcException('Bearer token is required');
        }

        try {
            const identity = await this.accessTokenService.verify(token);

            return {
                ...identity,
                token,
            };
        } catch {
            throw new RpcException('Invalid or expired access token');
        }
    }
}
