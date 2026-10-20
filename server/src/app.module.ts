import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module.js';
import { CommonModule } from './common/common.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { McpModule } from './modules/mcp/mcp.module.js';
import { WellKnownModule } from './modules/well-known/well-known.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    AppConfigModule,
    CommonModule,
    PrismaModule,
    AuthModule,
    // CalendarModule,
    McpModule,
    WellKnownModule,
    HealthModule,
  ],
})
export class AppModule { }
