import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { TOOLS, handleCallTool } from "./tools.js";
import { APP_VERSION } from "./version.js";

export async function startMcpServer() {
    const server = new Server(
        { name: "postgres-readonly-mcp", version: APP_VERSION },
        { capabilities: { tools: {} } },
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        try {
            return await handleCallTool(name, args);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                content: [{ type: "text" as const, text: `Error: ${message}` }],
                isError: true,
            };
        }
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`Postgres MCP server v${APP_VERSION} running`);
}
