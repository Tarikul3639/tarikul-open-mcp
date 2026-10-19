import { z } from 'zod';

export const dateTimeSchema = z
  .string()
  .datetime({ offset: true })
  .describe(
    'ISO 8601 date-time with timezone offset. Example: 2026-10-20T10:00:00+06:00.',
  );

export const colorIdSchema = z
  .enum(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'])
  .optional()
  .describe(
    'Google Calendar event color ID. Use only when the user requests a color. ' +
      '1=Lavender, 2=Sage, 3=Grape, 4=Flamingo, 5=Banana, ' +
      '6=Tangerine, 7=Peacock, 8=Graphite, 9=Blueberry, ' +
      '10=Basil, 11=Tomato. Return the ID as a string, not the color name. ' +
      'Omit this field if no color is requested.',
  );

export const eventFields = {
  summary: z
    .string()
    .min(1)
    .optional()
    .describe('Event title or name. Keep it short and meaningful.'),

  start: dateTimeSchema
    .optional()
    .describe('Event start date and time with timezone offset.'),

  end: dateTimeSchema
    .optional()
    .describe('Event end date and time. Must be later than start.'),

  description: z
    .string()
    .optional()
    .describe('Additional event details, agenda, or notes.'),

  location: z
    .string()
    .optional()
    .describe('Event location, venue, address, or meeting location.'),

  colorId: colorIdSchema,

  attendees: z
    .array(
      z.object({
        email: z
          .string()
          .email()
          .describe('Email address of the person invited.'),
      }),
    )
    .optional()
    .describe('People to invite to the event using their email addresses.'),

  reminders: z
    .object({
      useDefault: z
        .boolean()
        .optional()
        .describe("Whether to use the calendar's default reminders."),

      overrides: z
        .array(
          z.object({
            method: z
              .enum(['email', 'popup'])
              .describe('Reminder delivery method.'),
            minutes: z
              .number()
              .int()
              .min(0)
              .describe('Minutes before the event to trigger the reminder.'),
          }),
        )
        .optional()
        .describe('Custom reminders with a method and minutes-before value.'),
    })
    .optional()
    .describe('Reminder settings for the event.'),

  visibility: z
    .enum(['default', 'public', 'private', 'confidential'])
    .optional()
    .describe('Event visibility setting.'),

  transparency: z
    .enum(['opaque', 'transparent'])
    .optional()
    .describe(
      'Whether the event blocks availability: opaque blocks time; transparent does not.',
    ),

  recurrence: z
    .array(z.string())
    .optional()
    .describe(
      'Recurrence rules in RFC 5545 format, e.g. RRULE:FREQ=WEEKLY;COUNT=5.',
    ),
};

export const createEventSchema = z
  .object({
    ...eventFields,
    summary: z.string().min(1).describe('Required event title.'),
    start: dateTimeSchema,
    end: dateTimeSchema,
  })
  .refine((event) => new Date(event.end) > new Date(event.start), {
    message: 'End time must be after start time.',
    path: ['end'],
  });

export const updateEventSchema = z.object({
  eventId: z.string().min(1).describe('Google Calendar event ID to update.'),

  updates: z
    .object(eventFields)
    .refine(
      (updates) => Object.keys(updates).length > 0,
      'Provide at least one field to update.',
    )
    .refine(
      (updates) =>
        !updates.start ||
        !updates.end ||
        new Date(updates.end) > new Date(updates.start),
      {
        message: 'End time must be after start time.',
        path: ['end'],
      },
    ),
});

export const findEventsByDateSchema = z.object({
  date: z.string().date().describe('Date to search in YYYY-MM-DD format.'),
});

export const eventIdSchema = z.object({
  eventId: z.string().min(1).describe('Google Calendar event ID.'),
});
