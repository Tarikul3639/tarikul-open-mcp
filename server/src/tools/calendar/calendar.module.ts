import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarTools } from './calendar.tools';

@Module({
  providers: [CalendarService, CalendarTools],
  exports: [CalendarService, CalendarTools],
})
export class CalendarModule { }