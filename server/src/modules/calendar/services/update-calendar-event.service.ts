// import { Injectable } from '@nestjs/common';
// import { GoogleCalendarClientService } from '../../google/services/google-calendar-client.service';
// import type { EventInput } from '../types/calendar.types';

// @Injectable()
// export class UpdateCalendarEventService {
//   constructor(
//     private readonly googleCalendarClientService: GoogleCalendarClientService,
//   ) {}

//   async execute(userId: string, eventId: string, updates: Partial<EventInput>) {
//     const { start, end, ...details } = updates;
//     const { data } = await (
//       await this.googleCalendarClientService.execute(userId)
//     ).events.patch({
//       calendarId: 'primary',
//       eventId,
//       requestBody: {
//         ...details,
//         ...(start ? { start: { dateTime: start } } : {}),
//         ...(end ? { end: { dateTime: end } } : {}),
//       },
//     });
//     return data;
//   }
// }
