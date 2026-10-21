import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class OAuthStateService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Creates a single-use OAuth state.
     *
     * @param userId     Set when the state belongs to a logged-in user flow
     *                   (e.g. Google Calendar connect).
     * @param redirectTo Relative web path to open after Google login,
     *                   e.g. the MCP consent page. Must already be sanitized.
     */
    async create(userId?: string, redirectTo?: string) {
        const state = randomBytes(32).toString('hex');

        await this.prisma.oAuthState.create({
            data: {
                state,
                userId: userId ?? null,
                redirectTo: redirectTo ?? null,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });

        return state;
    }

    async consume(state: string) {
        const saved = await this.take(state);

        return saved.userId;
    }

    /**
     * Consumes a login state and returns the stored post-login redirect path.
     */
    async consumeLoginState(state: string): Promise<{ redirectTo: string | null }> {
        const saved = await this.take(state);

        return { redirectTo: saved.redirectTo ?? null };
    }

    private async take(state: string) {
        const saved = await this.prisma.oAuthState.findUnique({
            where: { state },
        });

        if (!saved || saved.expiresAt.getTime() <= Date.now()) {
            await this.prisma.oAuthState.deleteMany({
                where: { state },
            });

            throw new UnauthorizedException(
                'OAuth state is invalid or expired',
            );
        }

        await this.prisma.oAuthState.delete({
            where: { state },
        });

        return saved;
    }
}