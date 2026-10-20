import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { google, calendar_v3 } from 'googleapis';
import type {
    CalendarEvent,
    ListCalendarEventsResult,
} from './calendar-event.interface';
import type {
    ListCalendarEventsInput,
    FindEventsByDateInput,
    CreateCalendarEventInput,
    UpdateCalendarEventInput,
} from './calendar.dto';

@Injectable()
export class CalendarService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get a Google Calendar API client for the specified user.
     *
     * @param userId The ID of the user whose Google Calendar account is being accessed.
     * @returns A Google Calendar API client configured with the user's OAuth credentials.
     */
    private async getCalendar(userId: string) {
        // Find the user's saved Google Calendar account and OAuth tokens.
        const account = await this.prisma.googleCalendarAccount.findUnique({
            where: { userId },
        });

        // Reject the request if the user has not connected Google Calendar.
        if (!account) {
            throw new UnauthorizedException('Google Calendar is not connected');
        }

        // Read the OAuth credentials saved for this user's calendar account.
        const tokens = account.tokens as {
            access_token?: string;
            refresh_token?: string;
            expiry_date?: number;
            token_type?: string;
            scope?: string;
        };

        // Configure Google OAuth with the user's saved credentials.
        const auth = new google.auth.OAuth2();
        auth.setCredentials(tokens);

        // Return a Google Calendar API client.
        return google.calendar({ version: 'v3', auth });
    }

    // Convert a Google Calendar event into the application's event interface.
    private mapEvent(event: calendar_v3.Schema$Event): CalendarEvent {
        return {
            id: event.id,
            summary: event.summary,
            description: event.description,
            // Support both timed events and all-day events.
            start: event.start?.dateTime ?? event.start?.date,
            end: event.end?.dateTime ?? event.end?.date,
            status: event.status,
            htmlLink: event.htmlLink,
            colorId: event.colorId,
        };
    }

    // ──────────────────────────────────────────────────────────────
    // List upcoming events from the user's primary calendar.
    // ──────────────────────────────────────────────────────────────

    async listEvents(
        userId: string,
        input: ListCalendarEventsInput = { maxResults: 10 }
    ): Promise<ListCalendarEventsResult> {
        const maxResults = Math.min(
            Math.max(input.maxResults ?? 10, 1),
            100,
        );

        if (!userId) {
            throw new UnauthorizedException('User ID is required');
        }

        const calendar = await this.getCalendar(userId);

        const response = await calendar.events.list({
            calendarId: 'primary',
            // Keep the requested page size between 1 and 100 events.
            maxResults: Math.min(Math.max(maxResults, 1), 100),
            // Expand recurring events into individual event instances.
            singleEvents: true,
            // Return events ordered by their start time.
            orderBy: 'startTime',
            // Exclude events that have already started in the past.
            timeMin: new Date().toISOString(),
        });

        // Map Google API responses to the application's event format.
        return {
            events: (response.data.items ?? []).map((event) =>
                this.mapEvent(event),
            ),
        };
    }

    // ──────────────────────────────────────────────────────────────
    // Find events within a specific date-time range.
    // ──────────────────────────────────────────────────────────────

    async findEventsByDate(
        userId: string,
        input: FindEventsByDateInput,
    ): Promise<ListCalendarEventsResult> {

        if (!userId) {
            throw new UnauthorizedException('User ID is required');
        }

        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);

        // Reject invalid dates and ranges where the end is not after the start.
        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime()) ||
            startDate >= endDate
        ) {
            throw new BadRequestException(
                'Invalid date range: endDate must be after startDate',
            );
        }

        const calendar = await this.getCalendar(userId);

        const response = await calendar.events.list({
            calendarId: 'primary',
            // Restrict results to the requested date-time range.
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            // Expand recurring events into individual event instances.
            singleEvents: true,
            // Return events ordered by their start time.
            orderBy: 'startTime',
            // Limit the number of events returned by this request.
            maxResults: 100,
        });

        // Map Google API responses to the application's event format.
        return {
            events: (response.data.items ?? []).map((event) =>
                this.mapEvent(event),
            ),
        };
    }

    // ──────────────────────────────────────────────────────────────
    // Find a specific event by its ID in the user's primary calendar.
    // ──────────────────────────────────────────────────────────────

    async findEvent(
        userId: string,
        eventId: string,
    ): Promise<CalendarEvent> {

        if (!userId) {
            throw new UnauthorizedException('User ID is required');
        }
        
        if (!eventId) {
            throw new BadRequestException('Event ID is required');
        }

        const calendar = await this.getCalendar(userId);

        try {
            const response = await calendar.events.get({
                calendarId: 'primary',
                eventId,
            });

            // Return the event using the shared event interface.
            return this.mapEvent(response.data);
        } catch (error) {
            // Convert Google's 404 response into a NestJS not-found error.
            if (
                error instanceof Error &&
                'code' in error &&
                (error as { code: number }).code === 404
            ) {
                throw new NotFoundException('Calendar event not found');
            }

            // Propagate other API errors to the caller.
            throw error;
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Create a new event in the user's primary calendar.
    // ──────────────────────────────────────────────────────────────

    async createEvent(
        userId: string,
        input: CreateCalendarEventInput,
    ): Promise<CalendarEvent> {

        if (!userId) {
            throw new UnauthorizedException('User ID is required');
        }

        const calendar = await this.getCalendar(userId);

        // Reject an event whose end time is not after its start time.
        const startDate = new Date(input.start);
        const endDate = new Date(input.end);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime()) ||
            startDate >= endDate
        ) {
            throw new BadRequestException(
                'Invalid event time: end must be after start',
            );
        }

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
                summary: input.summary,
                description: input.description,
                // Google Calendar accepts dateTime for timed events.
                start: { dateTime: input.start },
                end: { dateTime: input.end },
                // Apply a Google Calendar event color when provided.
                colorId: input.colorId,
            },
        });

        // Return the newly created event.
        return this.mapEvent(response.data);
    }

    // ──────────────────────────────────────────────────────────────
    // Update only the fields provided by the caller.
    // ──────────────────────────────────────────────────────────────

    async updateEvent(
        userId: string,
        input: UpdateCalendarEventInput,
    ): Promise<CalendarEvent> {

        if (!userId) {
            throw new UnauthorizedException('User ID is required');
        }
        
        if (!input.eventId) {
            throw new BadRequestException('Event ID is required');
        }

        const calendar = await this.getCalendar(userId);

        // Validate the event time range when both values are supplied.
        if (input.start !== undefined && input.end !== undefined) {
            const startDate = new Date(input.start);
            const endDate = new Date(input.end);

            if (
                Number.isNaN(startDate.getTime()) ||
                Number.isNaN(endDate.getTime()) ||
                startDate >= endDate
            ) {
                throw new BadRequestException(
                    'Invalid event time: end must be after start',
                );
            }
        }

        // Build a partial update so omitted fields remain unchanged.
        const requestBody: calendar_v3.Schema$Event = {};

        if (input.summary !== undefined) {
            requestBody.summary = input.summary;
        }

        if (input.description !== undefined) {
            requestBody.description = input.description;
        }

        if (input.start !== undefined) {
            requestBody.start = { dateTime: input.start };
        }

        if (input.end !== undefined) {
            requestBody.end = { dateTime: input.end };
        }

        if (input.colorId !== undefined) {
            requestBody.colorId = input.colorId;
        }

        // PATCH updates only the specified event fields.
        const response = await calendar.events.patch({
            calendarId: 'primary',
            eventId: input.eventId,
            requestBody,
        });

        // Return the updated event.
        return this.mapEvent(response.data);
    }

    // ──────────────────────────────────────────────────────────────
    // Permanently delete an event from the user's primary calendar.
    // ──────────────────────────────────────────────────────────────

    async deleteEvent(
        userId: string,
        eventId: string,
    ): Promise<{ success: true; eventId: string }> {

        if (!userId) {
            throw new UnauthorizedException('User ID is required');
        }
        
        if (!eventId) {
            throw new BadRequestException('Event ID is required');
        }
        
        const calendar = await this.getCalendar(userId);

        await calendar.events.delete({
            calendarId: 'primary',
            eventId,
        });

        // Confirm that the delete request completed successfully.
        return { success: true, eventId };
    }
}