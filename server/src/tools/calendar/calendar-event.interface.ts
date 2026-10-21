export interface CalendarEvent {
  id?: string | null;
  summary?: string | null;
  description?: string | null;
  start?: string | null;
  end?: string | null;
  status?: string | null;
  htmlLink?: string | null;
  colorId?: string | null;
}

export interface ListCalendarEventsResult {
  events: CalendarEvent[];
}
