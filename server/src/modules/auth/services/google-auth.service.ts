import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { EnvService } from '../../../config/env.service.js';

@Injectable()
export class GoogleAuthService {
    /** Google OAuth client configured with the application's credentials. */
    private readonly client: OAuth2Client;
    private readonly calendarClient: OAuth2Client;

    constructor(private readonly env: EnvService) {
        // Initialize the OAuth client with the configured redirect URI.
        this.client = new OAuth2Client(
            this.env.googleClientId,
            this.env.googleClientSecret,
            this.env.googleRedirectUri,
        );

        // Initialize a separate OAuth client for Google Calendar with its own redirect URI.
        this.calendarClient = new OAuth2Client(
            this.env.googleClientId,
            this.env.googleClientSecret,
            this.env.googleCalendarRedirectUri,
        );
    }

    /**
     * Builds the Google authorization URL.
     *
     * @param state - Random value used to validate the OAuth callback.
     * @returns The URL to which the user should be redirected.
     */
    createAuthorizationUrl(state: string): string {
        return this.client.generateAuthUrl({
            access_type: 'offline',
            scope: ['openid', 'email', 'profile'],
            state,
        });
    }

    /**
     * Builds the Google Calendar authorization URL.
     *
     * @param state - Random value used to validate the OAuth callback.
     * @returns The URL to which the user should be redirected for calendar access.
     */
    createCalendarAuthorizationUrl(state: string): string {
        return this.calendarClient.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: [
                'openid',
                'email',
                'profile',
                'https://www.googleapis.com/auth/calendar',
            ],
            state,
        });
    }

    /**
     * Exchanges an authorization code for Google OAuth tokens.
     *
     * @param code - Authorization code received from Google's callback.
     * @returns The token response issued by Google.
     */
    async exchangeCode(code: string) {
        const { tokens } = await this.client.getToken(code);
        return tokens;
    }

    /**
     * Exchanges an authorization code for Google Calendar OAuth tokens.
     *
     * @param code - Authorization code received from Google's callback.
     * @returns The token response issued by Google for calendar access.
     */
    async exchangeCalendarCode(code: string) {
        const { tokens } = await this.calendarClient.getToken(code);
        return tokens;
    }

    /**
     * Verifies a Google ID token and retrieves its identity claims.
     *
     * @param idToken - ID token received from Google.
     * @returns Verified identity claims, or undefined if no payload exists.
     */
    async verifyIdToken(idToken: string) {
        const ticket = await this.client.verifyIdToken({
            idToken,
            audience: this.env.googleClientId,
        });

        return ticket.getPayload();
    }
}