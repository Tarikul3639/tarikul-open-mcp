import { McpServer, type ServerContext } from '@modelcontextprotocol/server';
import { CalendarService } from '../../calendar/calendar.service';
import {
  createEventSchema,
  updateEventSchema,
  findEventsByDateSchema,
  eventIdSchema,
} from '../../calendar/schemas/calendar.schema';
import { McpAuthService } from '../services/mcp-auth.service';

async function userId(ctx: ServerContext, auth: McpAuthService) {
  const token = ctx.http?.authInfo?.token;
  const u = token ? await auth.verifyAccessToken(token) : null;
  if (!u)
    throw new Error('A valid personal calendar authorization is required.');
  return u.userId;
}
const result = (value: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
});
const failure = (label: string, error: unknown) => ({
  content: [
    {
      type: 'text' as const,
      text: `${label}: ${error instanceof Error ? error.message : String(error)}`,
    },
  ],
  isError: true,
});
export function registerCalendarTools(
  server: McpServer,
  calendar: CalendarService,
  auth: McpAuthService,
) {
  server.registerTool(
    'listCalendarEvents',
    {
      title: 'List Calendar Events',
      description:
        'List the next 10 upcoming events from the primary Google Calendar.',
    },
    async (ctx) => {
      try {
        return result(
          await calendar.listCalendarEvents(await userId(ctx, auth)),
        );
      } catch (e) {
        return failure('Failed to list events', e);
      }
    },
  );
  server.registerTool(
    'createCalendarEvent',
    {
      title: 'Create Calendar Event',
      description:
        'Create a Google Calendar event. Supports title, start and end time, description, location, event color, attendees, reminders, visibility, transparency, and recurrence. Choose colorId from the documented Google Calendar color options when a color is requested.',
      inputSchema: createEventSchema.shape,
    },
    async (input, ctx) => {
      try {
        const event = createEventSchema.parse(input);
        return result(
          await calendar.createCalendarEvent(await userId(ctx, auth), event),
        );
      } catch (e) {
        return failure('Failed to create event', e);
      }
    },
  );
  server.registerTool(
    'findCalendarEventsByDate',
    {
      title: 'Find Calendar Events by Date',
      description:
        'Find upcoming calendar events whose start date matches the specified YYYY-MM-DD date.',
      inputSchema: findEventsByDateSchema.shape,
    },
    async (input, ctx) => {
      try {
        const { date } = findEventsByDateSchema.parse(input);
        return result(
          await calendar.findCalendarEventsByDate(
            await userId(ctx, auth),
            date,
          ),
        );
      } catch (e) {
        return failure('Failed to find events', e);
      }
    },
  );
  server.registerTool(
    'getCalendarEvent',
    {
      title: 'Get Calendar Event',
      description: 'Retrieve a Google Calendar event using its event ID.',
      inputSchema: eventIdSchema.shape,
    },
    async (input, ctx) => {
      try {
        const { eventId } = eventIdSchema.parse(input);
        return result(
          await calendar.getCalendarEvent(await userId(ctx, auth), eventId),
        );
      } catch (e) {
        return failure('Failed to get event', e);
      }
    },
  );
  server.registerTool(
    'updateCalendarEvent',
    {
      title: 'Update Calendar Event',
      description:
        'Update selected fields of an existing Google Calendar event. Provide its event ID and at least one field to update.',
      inputSchema: updateEventSchema.shape,
    },
    async (input, ctx) => {
      try {
        const { eventId, updates } = updateEventSchema.parse(input);
        return result(
          await calendar.updateCalendarEvent(
            await userId(ctx, auth),
            eventId,
            updates,
          ),
        );
      } catch (e) {
        return failure('Failed to update event', e);
      }
    },
  );
  server.registerTool(
    'deleteCalendarEvent',
    {
      title: 'Delete Calendar Event',
      description:
        'Permanently delete an event from the primary Google Calendar using its event ID.',
      inputSchema: eventIdSchema.shape,
    },
    async (input, ctx) => {
      try {
        const { eventId } = eventIdSchema.parse(input);
        await calendar.deleteCalendarEvent(await userId(ctx, auth), eventId);
        return result({ success: true, eventId });
      } catch (e) {
        return failure('Failed to delete event', e);
      }
    },
  );
}
