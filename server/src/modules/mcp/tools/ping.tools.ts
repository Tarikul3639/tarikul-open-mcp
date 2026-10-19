import { McpServer } from '@modelcontextprotocol/server';
export function registerPingTool(server: McpServer) {
  server.registerTool(
    'ping',
    {
      title: 'Ping',
      description: 'Check whether the personal MCP server is working',
    },
    async () => ({
      content: [{ type: 'text', text: 'Personal MCP Server is working!' }],
    }),
  );
}
