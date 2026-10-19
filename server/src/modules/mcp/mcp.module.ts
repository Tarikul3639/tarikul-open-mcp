import { Module } from '@nestjs/common';
import { CalendarModule } from '../calendar/calendar.module';
import { OAuthModule } from '../oauth/oauth.module';
import { GoogleModule } from '../google/google.module';
import { McpController } from './mcp.controller';
import { McpAuthService } from './services/mcp-auth.service';
import { McpService } from './services/mcp.service';

@Module({
  imports: [OAuthModule, GoogleModule, CalendarModule],
  controllers: [McpController],
  providers: [McpAuthService, McpService],
})
export class McpModule {}
