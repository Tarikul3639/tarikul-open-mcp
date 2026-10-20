import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
// import { CalendarModule } from './modules/calendar/calendar.module';
import { HealthModule } from './modules/health/health.module';
import { McpModule } from './modules/mcp/mcp.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    AppConfigModule,
    CommonModule,
    PrismaModule,
    AuthModule,
    // CalendarModule,
    McpModule,
    HealthModule,
  ],
})
export class AppModule { }
