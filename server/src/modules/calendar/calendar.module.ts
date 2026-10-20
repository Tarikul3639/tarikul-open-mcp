import { Module } from '@nestjs/common';
import { GoogleModule } from '../google/google.module';
import { CreateCalendarEventService } from './services/create-calendar-event.service';
import { DeleteCalendarEventService } from './services/delete-calendar-event.service';
import { FindCalendarEventsByDateService } from './services/find-calendar-events-by-date.service';
import { GetCalendarEventService } from './services/get-calendar-event.service';
import { ListCalendarEventsService } from './services/list-calendar-events.service';
import { UpdateCalendarEventService } from './services/update-calendar-event.service';

@Module({
  imports: [GoogleModule],
  providers: [
    ListCalendarEventsService,
    CreateCalendarEventService,
    FindCalendarEventsByDateService,
    GetCalendarEventService,
    UpdateCalendarEventService,
    DeleteCalendarEventService,
  ],
  exports: [
    ListCalendarEventsService,
    CreateCalendarEventService,
    FindCalendarEventsByDateService,
    GetCalendarEventService,
    UpdateCalendarEventService,
    DeleteCalendarEventService,
  ],
})
export class CalendarModule {}
