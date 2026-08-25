
function printHelp() {
    console.log(`Postgres Read MCP

Usage:
  postgres-read                 Start the stdio MCP server
  postgres-read --ui            Start the local status dashboard
  postgres-read --ui --port 8787
  postgres-read --ui --no-open  Start without opening a browser
  postgres-read --help          Show this help
`);
}

function readPort(args: string[]) {
    const inlinePort = args.find((arg) => arg.startsWith("--port="))?.split("=", 2)[1];
    const portFlagIndex = args.indexOf("--port");
    const rawPort = inlinePort ?? (portFlagIndex >= 0 ? args[portFlagIndex + 1] : undefined) ?? "8787";
    const port = Number(rawPort);

    if (!Number.isInteger(port) || port < 0 || port > 65535) {
        throw new Error(`Invalid port: ${rawPort}`);
    }

    return port;
}

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
    printHelp();
} else if (args.includes("--ui")) {
    const { startDashboard } = await import("./src/ui.js");
    const dashboard = startDashboard({
        port: readPort(args),
        openBrowser: !args.includes("--no-open"),
    });

    console.log(`Postgres Read dashboard: ${dashboard.url}`);
    console.log("Press Ctrl+C to stop.");
} else {
    const { startMcpServer } = await import("./src/mcp-server.js");
    await startMcpServer();
}
