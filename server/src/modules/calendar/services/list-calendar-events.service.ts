import { Injectable } from '@nestjs/common';
import { GoogleCalendarClientService } from '../../google/services/google-calendar-client.service';

@Injectable()
export class ListCalendarEventsService {
  constructor(
    private readonly googleCalendarClientService: GoogleCalendarClientService,
  ) {}

  async execute(userId: string) {
    const { data } = await (
      await this.googleCalendarClientService.execute(userId)
    ).events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return data.items ?? [];
  }
}
