import { Module } from '@nestjs/common';
import { McpModule as NestMcpModule } from '@nestjs-mcp/server';

import { AuthModule } from '../auth/auth.module';
import { McpAuthGuard } from './guards/mcp-auth.guard';
import { BearerTokenStrategy } from './strategies/bearer-token.strategy';
import { McpService } from './services/mcp.service';
import { ToolsModule } from '@/tools/tools.module';

@Module({
  imports: [
    NestMcpModule.forRoot({
      name: 'My MCP Server',
      version: '1.0.0',
    }),
    AuthModule,
    ToolsModule,
  ],
  providers: [McpService, BearerTokenStrategy, McpAuthGuard],
})
export class McpModule { }
