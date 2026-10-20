// import { McpServer, type ServerContext } from '@modelcontextprotocol/server';

// import { CreateCalendarEventService } from '../../calendar/services/create-calendar-event.service';
// import { DeleteCalendarEventService } from '../../calendar/services/delete-calendar-event.service';
// import { FindCalendarEventsByDateService } from '../../calendar/services/find-calendar-events-by-date.service';
// import { GetCalendarEventService } from '../../calendar/services/get-calendar-event.service';
// import { ListCalendarEventsService } from '../../calendar/services/list-calendar-events.service';
// import { UpdateCalendarEventService } from '../../calendar/services/update-calendar-event.service';

// import {
//   createEventSchema,
//   updateEventSchema,
//   findEventsByDateSchema,
//   eventIdSchema,
// } from '../../calendar/schemas/calendar.schema';

// import { McpAuthService } from '../services/mcp-auth.service';

// /**
//  * Extracts and verifies the authenticated user's ID from the MCP request.
//  * Throws an error if the request does not contain a valid access token.
//  */
// async function userId(ctx: ServerContext, auth: McpAuthService) {
//   const token = ctx.http?.authInfo?.token;
//   const user = token ? await auth.verifyAccessToken(token) : null;

//   if (!user) {
//     throw new Error('A valid personal calendar authorization is required.');
//   }

//   return user.userId;
// }

// /**
//  * Formats a successful tool result as JSON text for the MCP client.
//  */
// const result = (value: unknown) => ({
//   content: [
//     {
//       type: 'text' as const,
//       text: JSON.stringify(value, null, 2),
//     },
//   ],
// });

// /**
//  * Formats an error as an MCP tool response.
//  */
// const failure = (label: string, error: unknown) => ({
//   content: [
//     {
//       type: 'text' as const,
//       text: `${label}: ${error instanceof Error ? error.message : String(error)
//         }`,
//     },
//   ],
//   isError: true,
// });

// /**
//  * Registers Google Calendar tools with the MCP server.
//  * Each calendar operation is delegated to its dedicated service.
//  */
// export function registerCalendarTools(
//   server: McpServer,
//   calendar: {
//     list: ListCalendarEventsService;
//     create: CreateCalendarEventService;
//     findByDate: FindCalendarEventsByDateService;
//     get: GetCalendarEventService;
//     update: UpdateCalendarEventService;
//     delete: DeleteCalendarEventService;
//   },
//   auth: McpAuthService,
// ) {
//   // Lists the next 10 upcoming events from the primary calendar.
//   server.registerTool(
//     'listCalendarEvents',
//     {
//       title: 'List Calendar Events',
//       description:
//         'List the next 10 upcoming events from the primary Google Calendar.',
//     },
//     async (ctx) => {
//       try {
//         const id = await userId(ctx, auth);
//         const events = await calendar.list.execute(id);

//         return result(events);
//       } catch (error) {
//         return failure('Failed to list events', error);
//       }
//     },
//   );

//   // Creates a calendar event after validating the supplied input.
//   server.registerTool(
//     'createCalendarEvent',
//     {
//       title: 'Create Calendar Event',
//       description:
//         'Create a Google Calendar event. Supports title, start and end time, description, location, event color, attendees, reminders, visibility, transparency, and recurrence. Choose colorId from the documented Google Calendar color options when a color is requested.',
//       inputSchema: createEventSchema.shape,
//     },
//     async (input, ctx) => {
//       try {
//         const event = createEventSchema.parse(input);
//         const id = await userId(ctx, auth);
//         const createdEvent = await calendar.create.execute(id, event);

//         return result(createdEvent);
//       } catch (error) {
//         return failure('Failed to create event', error);
//       }
//     },
//   );

//   // Finds upcoming events whose start date matches the requested date.
//   server.registerTool(
//     'findCalendarEventsByDate',
//     {
//       title: 'Find Calendar Events by Date',
//       description:
//         'Find upcoming calendar events whose start date matches the specified YYYY-MM-DD date.',
//       inputSchema: findEventsByDateSchema.shape,
//     },
//     async (input, ctx) => {
//       try {
//         const { date } = findEventsByDateSchema.parse(input);
//         const id = await userId(ctx, auth);
//         const events = await calendar.findByDate.execute(id, date);

//         return result(events);
//       } catch (error) {
//         return failure('Failed to find events', error);
//       }
//     },
//   );

//   // Retrieves a single calendar event using its event ID.
//   server.registerTool(
//     'getCalendarEvent',
//     {
//       title: 'Get Calendar Event',
//       description: 'Retrieve a Google Calendar event using its event ID.',
//       inputSchema: eventIdSchema.shape,
//     },
//     async (input, ctx) => {
//       try {
//         const { eventId } = eventIdSchema.parse(input);
//         const id = await userId(ctx, auth);
//         const event = await calendar.get.execute(id, eventId);

//         return result(event);
//       } catch (error) {
//         return failure('Failed to get event', error);
//       }
//     },
//   );

//   // Updates selected fields of an existing calendar event.
//   server.registerTool(
//     'updateCalendarEvent',
//     {
//       title: 'Update Calendar Event',
//       description:
//         'Update selected fields of an existing Google Calendar event. Provide its event ID and at least one field to update.',
//       inputSchema: updateEventSchema.shape,
//     },
//     async (input, ctx) => {
//       try {
//         const { eventId, updates } = updateEventSchema.parse(input);
//         const id = await userId(ctx, auth);
//         const updatedEvent = await calendar.update.execute(
//           id,
//           eventId,
//           updates,
//         );

//         return result(updatedEvent);
//       } catch (error) {
//         return failure('Failed to update event', error);
//       }
//     },
//   );

//   // Permanently deletes an event from the primary calendar.
//   server.registerTool(
//     'deleteCalendarEvent',
//     {
//       title: 'Delete Calendar Event',
//       description:
//         'Permanently delete an event from the primary Google Calendar using its event ID.',
//       inputSchema: eventIdSchema.shape,
//     },
//     async (input, ctx) => {
//       try {
//         const { eventId } = eventIdSchema.parse(input);
//         const id = await userId(ctx, auth);

//         await calendar.delete.execute(id, eventId);

//         return result({
//           success: true,
//           eventId,
//         });
//       } catch (error) {
//         return failure('Failed to delete event', error);
//       }
//     },
//   );
// }
