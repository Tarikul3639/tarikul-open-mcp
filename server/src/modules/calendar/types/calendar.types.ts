import { calendar_v3 } from 'googleapis';

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
