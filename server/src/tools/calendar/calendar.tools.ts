import { McpContext, Resolver, Tool } from '@nestjs-mcp/server';
import { z } from 'zod';
import { CalendarService } from './calendar.service';

@Resolver()
export class CalendarTools {
    constructor(private readonly calendarService: CalendarService) { }


    // ──────────────────────────────────────────────────────────────
    // Calendar event listing tool
    // ──────────────────────────────────────────────────────────────

    @Tool({
        name: 'calendar_list_events',
        description: 'List upcoming Google Calendar events',
        paramsSchema: z.object({
            maxResults: z
                .number()
                .int()
                .min(1)
                .max(100)
                .optional()
                .describe(
                    'Maximum number of events to return (1–100). Defaults to 10.',
                ),
        }),
    })
    async listEvents(input: { maxResults?: number }, ctx: McpContext) {
        const userId = this.getUserId(ctx);

        return {
            content: [
                {
                    type: 'text' as const,
                    text: JSON.stringify(
                        await this.calendarService.listEvents(userId, input),
                    ),
                },
            ],
        };
    }


    // ──────────────────────────────────────────────────────────────
    // Calendar event retrieval by ID tool
    // ──────────────────────────────────────────────────────────────

    @Tool({
        name: 'calendar_find_event',
        description: 'Find a Google Calendar event by its ID',
        paramsSchema: z.object({
            eventId: z
                .string()
                .min(1)
                .max(1024)
                .describe('The unique ID of the Google Calendar event to find.'),
        }),
    })
    async findEvent(input: { eventId: string }, ctx: McpContext) {
        const userId = this.getUserId(ctx);

        return {
            content: [
                {
                    type: 'text' as const,
                    text: JSON.stringify(
                        await this.calendarService.findEvent(userId, input.eventId),
                    ),
                },
            ],
        };
    }


    // ──────────────────────────────────────────────────────────────
    // Calendar event search by date-time range tool
    // ──────────────────────────────────────────────────────────────

    @Tool({
        name: 'calendar_find_events_by_date',
        description: 'Find Google Calendar events within a date-time range',
        paramsSchema: z.object({
            startDate: z
                .string()
                .datetime({ offset: true })
                .describe(
                    'Start of the search range in ISO 8601 format, including timezone, e.g. 2026-10-20T00:00:00Z.',
                ),
            endDate: z
                .string()
                .datetime({ offset: true })
                .describe(
                    'End of the search range in ISO 8601 format, including timezone, e.g. 2026-10-21T00:00:00Z.',
                ),
        }),
    })
    async findEventsByDate(
        input: { startDate: string; endDate: string },
        ctx: McpContext,
    ) {
        const userId = this.getUserId(ctx);

        return {
            content: [
                {
                    type: 'text' as const,
                    text: JSON.stringify(
                        await this.calendarService.findEventsByDate(userId, input),
                    ),
                },
            ],
        };
    }


    // ──────────────────────────────────────────────────────────────
    // Calendar event creation tool
    // ──────────────────────────────────────────────────────────────

    @Tool({
        name: 'calendar_create_event',
        description: 'Create a Google Calendar event',
        paramsSchema: z.object({
            summary: z
                .string()
                .min(1)
                .max(255)
                .describe('Event title, e.g. Team meeting.'),
            description: z
                .string()
                .max(8192)
                .optional()
                .describe('Optional details or notes about the event.'),
            start: z
                .string()
                .datetime({ offset: true })
                .describe(
                    'Event start date and time in ISO 8601 format with timezone.',
                ),
            end: z
                .string()
                .datetime({ offset: true })
                .describe('Event end date and time in ISO 8601 format with timezone.'),
            colorId: z
                .string()
                .max(10)
                .optional()
                .describe(
                    'Optional Google Calendar event color ID. This selects the event color, not a color name. Use a valid Google Calendar event color ID, such as "1" for lavender or "11" for tomato red. Omit this field to use the default color.',
                ),
        }),
    })
    async createEvent(
        input: {
            summary: string;
            description?: string;
            start: string;
            end: string;
            colorId?: string;
        },
        ctx: McpContext,
    ) {
        const userId = this.getUserId(ctx);

        return {
            content: [
                {
                    type: 'text' as const,
                    text: JSON.stringify(
                        await this.calendarService.createEvent(userId, input),
                    ),
                },
            ],
        };
    }

    // ──────────────────────────────────────────────────────────────
    // Calendar event update and delete tools
    // ──────────────────────────────────────────────────────────────

    @Tool({
        name: 'calendar_update_event',
        description: 'Update an existing Google Calendar event',
        paramsSchema: z.object({
            eventId: z
                .string()
                .min(1)
                .max(1024)
                .describe('The unique ID of the event to update.'),
            summary: z
                .string()
                .min(1)
                .max(255)
                .optional()
                .describe(
                    'New event title. If omitted, the existing title remains unchanged.',
                ),
            description: z
                .string()
                .max(8192)
                .optional()
                .describe(
                    'New event details. If omitted, the existing description remains unchanged.',
                ),
            start: z
                .string()
                .datetime({ offset: true })
                .optional()
                .describe('New start date and time in ISO 8601 format with timezone.'),
            end: z
                .string()
                .datetime({ offset: true })
                .optional()
                .describe('New end date and time in ISO 8601 format with timezone.'),
            colorId: z
                .string()
                .max(10)
                .optional()
                .describe(
                    'Optional Google Calendar event color ID, not a color name. For example, "1" is lavender and "11" is tomato red. Omit to leave the color unchanged.',
                ),
        }),
    })
    async updateEvent(
        input: {
            eventId: string;
            summary?: string;
            description?: string;
            start?: string;
            end?: string;
            colorId?: string;
        },
        ctx: McpContext,
    ) {
        const userId = this.getUserId(ctx);
        const { eventId, ...updates } = input;

        return {
            content: [
                {
                    type: 'text' as const,
                    text: JSON.stringify(
                        await this.calendarService.updateEvent(userId, {
                            eventId,
                            ...updates,
                        }),
                    ),
                },
            ],
        };
    }


    // ──────────────────────────────────────────────────────────────
    // Calendar event deletion tool
    // ──────────────────────────────────────────────────────────────

    @Tool({
        name: 'calendar_delete_event',
        description: 'Delete a Google Calendar event by its ID',
        paramsSchema: z.object({
            eventId: z
                .string()
                .min(1)
                .max(1024)
                .describe(
                    'The unique ID of the Google Calendar event to delete. This permanently removes the event from the calendar.',
                ),
        }),
    })
    async deleteEvent(input: { eventId: string }, ctx: McpContext) {
        const userId = this.getUserId(ctx);

        return {
            content: [
                {
                    type: 'text' as const,
                    text: JSON.stringify(
                        await this.calendarService.deleteEvent(userId, input.eventId),
                    ),
                },
            ],
        };
    }

    private getUserId(ctx: McpContext): string {
        const authInfo = ctx.http?.authInfo as
            { extra?: { userId?: string }; userId?: string } | undefined;

        const userId = authInfo?.extra?.userId ?? authInfo?.userId;

        if (!userId) {
            throw new Error('Authenticated user ID was not found in MCP context.');
        }

        return userId;
    }
}
