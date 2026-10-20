import { Resolver, Tool } from '@nestjs-mcp/server';
import { HealthService } from '../services/health.service';

@Resolver()
export class HealthTool {
  constructor(private readonly healthService: HealthService) { }

  @Tool({
    name: 'health_check',
    description: 'Check whether the MCP server is running',
  })
  check() {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(this.healthService.check()),
        },
      ],
    };
  }
}