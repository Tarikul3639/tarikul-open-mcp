import { Injectable } from '@nestjs/common';
import { GoogleCalendarClientService } from '../../google/services/google-calendar-client.service';
import type { EventInput } from '../types/calendar.types';

@Injectable()
export class CreateCalendarEventService {
  constructor(
    private readonly googleCalendarClientService: GoogleCalendarClientService,
  ) {}

  async execute(userId: string, input: EventInput) {
    const { start, end, ...details } = input;
    const { data } = await (
      await this.googleCalendarClientService.execute(userId)
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
}
