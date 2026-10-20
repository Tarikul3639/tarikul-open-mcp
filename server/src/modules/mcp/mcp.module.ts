import { Module } from '@nestjs/common';
import { McpModule as NestMcpModule } from '@nestjs-mcp/server';

import { McpService } from './services/mcp.service';
import { ToolsModule } from "@/tools/tools.module";

@Module({
    imports: [
        NestMcpModule.forRoot({
            name: 'My MCP Server',
            version: '1.0.0',
        }),
        ToolsModule,
    ],
    providers: [McpService],
})
export class McpModule {}