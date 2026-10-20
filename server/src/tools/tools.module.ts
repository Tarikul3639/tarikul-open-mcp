import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module';
import { CalendarModule } from './calendar/calendar.module';

import { ExampleTools } from './example.tools';

@Module({
    imports: [HealthModule, CalendarModule],
    providers: [ExampleTools],
    exports: [HealthModule, CalendarModule, ExampleTools],
})
export class ToolsModule { }
