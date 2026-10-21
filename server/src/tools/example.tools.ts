import { type McpContext, McpController, Tool } from '@rekog/mcp-nest';
import { z } from 'zod';

@McpController()
export class ExampleTools {
    @Tool({
        name: 'example_tool',
        description: 'Example MCP tool',
        parameters: z.object({
            message: z.string(),
        }),
    })
    exampleTool(params: { message: string }, ctx: McpContext) {
        console.log('Tool arguments:', params);
        console.log('Request method:', ctx.getRawRequest());

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
