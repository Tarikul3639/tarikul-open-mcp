import { Module } from '@nestjs/common';
import { GoogleModule } from '../google/google.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { CalendarService } from './calendar.service';

@Module({
  imports: [PrismaModule, GoogleModule],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
