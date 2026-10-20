import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module.js';
import { CalendarModule } from './calendar/calendar.module.js';

import { ExampleTools } from './example.tools.js';

@Module({
    imports: [HealthModule, CalendarModule],
    providers: [ExampleTools],
    exports: [HealthModule, CalendarModule, ExampleTools],
})
export class ToolsModule { }
