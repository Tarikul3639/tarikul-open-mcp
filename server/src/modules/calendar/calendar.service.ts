import { Injectable } from '@nestjs/common';
import { calendar_v3 } from 'googleapis';
import { GoogleService } from '../google/google.service';
export type CalendarEvent = calendar_v3.Schema$Event;
export type EventInput = {
  summary: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  colorId?: string;
  attendees?: calendar_v3.Schema$EventAttendee[];
  reminders?: {
    useDefault?: boolean;
    overrides?: calendar_v3.Schema$EventReminder[];
  };
  visibility?: 'default' | 'public' | 'private' | 'confidential';
  transparency?: 'opaque' | 'transparent';
  recurrence?: string[];
};
/** Performs Google Calendar event operations for an authenticated account. */
@Injectable()
export class CalendarService {
  constructor(private googleService: GoogleService) {}

  /** Lists upcoming primary-calendar events. */
  async listCalendarEvents(userId: string) {
    const { data } = await (
      await this.googleService.calendar(userId)
    ).events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return data.items ?? [];
  }
  /** Creates an event in the account's primary calendar. */
  async createCalendarEvent(userId: string, input: EventInput) {
    const { start, end, ...details } = input;
    const { data } = await (
      await this.googleService.calendar(userId)
    ).events.insert({
      calendarId: 'primary',
      requestBody: {
        ...details,
        start: { dateTime: start },
        end: { dateTime: end },
      },
    });
    return data;
  }
  /** Filters upcoming events to those starting on the requested date. */
  async findCalendarEventsByDate(userId: string, date: string) {
    return (await this.listCalendarEvents(userId)).filter((e) =>
      (e.start?.dateTime ?? e.start?.date)?.startsWith(date),
    );
  }
  /** Retrieves one primary-calendar event by identifier. */
  async getCalendarEvent(userId: string, eventId: string) {
    const { data } = await (
      await this.googleService.calendar(userId)
    ).events.get({ calendarId: 'primary', eventId });
    return data;
  }
  /** Applies partial updates to a primary-calendar event. */
  async updateCalendarEvent(
    userId: string,
    eventId: string,
    updates: Partial<EventInput>,
  ) {
    const { start, end, ...details } = updates;
    const { data } = await (
      await this.googleService.calendar(userId)
    ).events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: {
        ...details,
        ...(start ? { start: { dateTime: start } } : {}),
        ...(end ? { end: { dateTime: end } } : {}),
      },
    });
    return data;
  }
  /** Deletes one primary-calendar event. */
  async deleteCalendarEvent(userId: string, eventId: string) {
    await (
      await this.googleService.calendar(userId)
    ).events.delete({ calendarId: 'primary', eventId });
  }
}
