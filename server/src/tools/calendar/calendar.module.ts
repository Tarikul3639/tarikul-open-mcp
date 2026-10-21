import { Module } from '@nestjs/common';
import { AuthModule } from '../../modules/auth/auth.module.js';
import { McpAuthGuard } from '../../modules/auth/guards/mcp-auth.guard.js';
import { BearerTokenStrategy } from '../../modules/auth/strategies/bearer-token.strategy.js';
import { CalendarService } from './calendar.service.js';
import { CalendarTools } from './calendar.tools.js';

@Module({
  imports: [AuthModule],
  controllers: [CalendarTools],
  providers: [CalendarService, McpAuthGuard, BearerTokenStrategy],
  exports: [CalendarService],
})
export class CalendarModule { }
