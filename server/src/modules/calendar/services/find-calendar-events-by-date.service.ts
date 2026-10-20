import { Injectable } from '@nestjs/common';
import { ListCalendarEventsService } from './list-calendar-events.service';

@Injectable()
export class FindCalendarEventsByDateService {
  constructor(
    private readonly listCalendarEventsService: ListCalendarEventsService,
  ) {}

  async execute(userId: string, date: string) {
    return (await this.listCalendarEventsService.execute(userId)).filter(
      (event) => (event.start?.dateTime ?? event.start?.date)?.startsWith(date),
    );
  }
}
