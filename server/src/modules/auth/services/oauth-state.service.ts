import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class OAuthStateService {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId?: string) {
        const state = randomBytes(32).toString('hex');

        await this.prisma.oAuthState.create({
            data: {
                state,
                userId: userId ?? null,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });

        return state;
    }

    async consume(state: string) {
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

        return saved.userId;
    }
}