import { Module } from '@nestjs/common';
import { McpModule as NestMcpModule } from '@nestjs-mcp/server';
import { McpService } from './services/mcp.service';
import { HealthService } from './services/health.service';
import { HealthTool } from './tools/health.tool';

@Module({
  imports: [NestMcpModule.forRoot({
    name: 'My MCP Server',
    version: '1.0.0',
  }),],
  providers: [
    McpService,
    HealthService,
    HealthTool,
  ],
})
export class McpModule { }