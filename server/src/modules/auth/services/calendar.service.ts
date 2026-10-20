import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { GoogleAuthService } from './google-auth.service';

@Injectable()
export class CalendarService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly googleAuthService: GoogleAuthService,
    ) { }

    async status(userId: string) {
        const account = await this.prisma.googleCalendarAccount.findUnique({
            where: { userId },
            select: { userId: true },
        });

        return { connected: Boolean(account) };
    }

    async connect(userId: string) {
        const state = randomBytes(32).toString('hex');

        await this.prisma.oAuthState.create({
            data: {
                state,
                userId,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });

        return {
            authorizationUrl:
                this.googleAuthService.createCalendarAuthorizationUrl(state),
        };
    }

    async handleCallback(code: string, state: string) {
        if (!code || !state) {
            throw new BadRequestException('Missing OAuth code or state');
        }

        const savedState = await this.prisma.oAuthState.findUnique({
            where: { state },
        });

        if (!savedState) {
            throw new UnauthorizedException('Invalid OAuth state');
        }

        const received = Buffer.from(state);
        const expected = Buffer.from(savedState.state);

        if (
            received.length !== expected.length ||
            !timingSafeEqual(received, expected) ||
            savedState.expiresAt.getTime() <= Date.now()
        ) {
            await this.prisma.oAuthState.deleteMany({
                where: { state },
            });

            throw new UnauthorizedException(
                'OAuth state is invalid or expired',
            );
        }

        // Consume the state before exchanging the authorization code.
        await this.prisma.oAuthState.delete({
            where: { state },
        });

        const tokens =
            await this.googleAuthService.exchangeCalendarCode(code);

        if (!tokens.access_token) {
            throw new UnauthorizedException(
                'Google Calendar access token was not returned',
            );
        }

        await this.prisma.googleCalendarAccount.upsert({
            where: { userId: savedState.userId },
            create: {
                userId: savedState.userId,
                tokens: JSON.parse(JSON.stringify(tokens)),
            },
            update: {
                tokens: JSON.parse(JSON.stringify(tokens)),
            },
        });

        return {
            success: true,
            message: 'Google Calendar connected successfully',
        };
    }

    async disconnect(userId: string) {
        await this.prisma.googleCalendarAccount.deleteMany({
            where: { userId },
        });

        return {
            success: true,
            message: 'Google Calendar disconnected successfully',
        };
    }
}