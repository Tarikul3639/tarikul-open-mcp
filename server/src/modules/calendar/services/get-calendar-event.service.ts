// import { Injectable } from '@nestjs/common';
// import { GoogleCalendarClientService } from '../../google/services/google-calendar-client.service';

// @Injectable()
// export class GetCalendarEventService {
//   constructor(
//     private readonly googleCalendarClientService: GoogleCalendarClientService,
//   ) {}

//   async execute(userId: string, eventId: string) {
//     const { data } = await (
//       await this.googleCalendarClientService.execute(userId)
//     ).events.get({ calendarId: 'primary', eventId });
//     return data;
//   }
// }
