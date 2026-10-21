import { Module } from '@nestjs/common';
import {
  McpStrategy,
  MCP_STRATEGY,
  StreamableHttpTransport,
} from '@rekog/mcp-nest';

import { AppConfigModule } from './config/config.module.js';
import { CommonModule } from './common/common.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { WellKnownModule } from './modules/well-known/well-known.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ToolsModule } from './tools/tools.module.js';

// The strategy is the whole configuration — there is no McpModule.
export const mcp = new McpStrategy({
  name: 'tarikul-open-mcp',
  version: '2.0.0',
  transports: [new StreamableHttpTransport()],
});

@Module({
  imports: [
    AppConfigModule,
    CommonModule,
    PrismaModule,
    ToolsModule,
    AuthModule,
    WellKnownModule,
    HealthModule,
  ],

  providers: [
    // Provide the MCP strategy to the module.
    { provide: MCP_STRATEGY, useValue: mcp },
  ],
})
export class AppModule { }
