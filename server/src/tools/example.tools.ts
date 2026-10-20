import { McpContext, Resolver, Tool } from '@nestjs-mcp/server';
import { z } from 'zod';

@Resolver()
export class ExampleTools {
    @Tool({
        name: 'example_tool',
        description: 'Example MCP tool',
        paramsSchema: z.object({
            message: z.string(),
        }),
    })
    exampleTool(params: { message: string }, ctx: McpContext) {
        console.log('Tool arguments:', params);
        console.log('Request method:', ctx.mcpReq.method);

        return {
            content: [
                {
                    type: 'text' as const,
                    text: params.message,
                },
            ],
        };
    }
}
