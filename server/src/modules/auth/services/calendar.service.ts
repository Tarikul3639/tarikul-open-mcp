import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { GoogleAuthService } from './google-auth.service';
import { OAuthStateService } from './oauth-state.service';

@Injectable()
export class CalendarService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly googleAuthService: GoogleAuthService,
        private readonly oauthStateService: OAuthStateService,
    ) { }

    // Checks whether the user has connected their Google Calendar account.
    async status(userId: string) {
        const account = await this.prisma.googleCalendarAccount.findUnique({
            where: { userId },
            select: { userId: true },
        });

        return { connected: Boolean(account) };
    }

    // Creates an OAuth state and returns the Google Calendar authorization URL.
    async connect(userId: string) {
        const state = await this.oauthStateService.create(userId);

        return {
            authorizationUrl:
                this.googleAuthService.createCalendarAuthorizationUrl(state),
        };
    }

    // Handles Google's OAuth callback and saves the calendar tokens.
    async handleCallback(code: string, state: string) {
        // Rejects the callback if the required OAuth parameters are missing.
        if (!code || !state) {
            throw new BadRequestException('Missing OAuth code or state');
        }

        // Validates and consumes the one-time OAuth state.
        const userId = await this.oauthStateService.consume(state);

        // Ensures the OAuth state belongs to an authenticated user.
        if (!userId) {
            throw new UnauthorizedException(
                'OAuth state is not associated with a user',
            );
        }

        // Exchanges the authorization code for Google Calendar tokens.
        const tokens =
            await this.googleAuthService.exchangeCalendarCode(code);

        // Rejects the callback if Google did not return an access token.
        if (!tokens.access_token) {
            throw new UnauthorizedException(
                'Google Calendar access token was not returned',
            );
        }

        // Creates the calendar account or updates its existing tokens.
        await this.prisma.googleCalendarAccount.upsert({
            where: { userId },
            create: {
                userId,
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

    // Removes the user's stored Google Calendar connection.
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