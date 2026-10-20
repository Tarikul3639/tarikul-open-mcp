// import { Injectable } from '@nestjs/common';
// import { GoogleCalendarClientService } from '../../google/services/google-calendar-client.service.js';

// @Injectable()
// export class DeleteCalendarEventService {
//   constructor(
//     private readonly googleCalendarClientService: GoogleCalendarClientService,
//   ) { }

//   async execute(userId: string, eventId: string) {
//     await (
//       await this.googleCalendarClientService.execute(userId)
//     ).events.delete({ calendarId: 'primary', eventId });
//   }
// }
