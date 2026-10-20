import { Module } from '@nestjs/common';
import { McpModule as NestMcpModule } from '@nestjs-mcp/server';

import { AuthModule } from '../auth/auth.module.js';
import { McpAuthGuard } from './guards/mcp-auth.guard.js';
import { BearerTokenStrategy } from './strategies/bearer-token.strategy.js';
import { McpService } from './services/mcp.service.js';
import { ToolsModule } from '../../tools/tools.module.js';

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
