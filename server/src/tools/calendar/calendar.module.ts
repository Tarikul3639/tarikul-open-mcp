import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service.js';
import { CalendarTools } from './calendar.tools.js';

@Module({
  providers: [CalendarService, CalendarTools],
  exports: [CalendarService, CalendarTools],
})
export class CalendarModule { }