import { spawn } from "child_process";

type JsonRpcResponse = {
    id?: number;
    result?: {
        content?: Array<{ type: string; text: string }>;
        tools?: Array<{ name: string }>;
        serverInfo?: { name: string; version: string };
    };
    isError?: boolean;
    error?: unknown;
};

const DEFAULT_EMAIL = "ishara.lakshitha.eds@gmail.com";
const email = process.argv[2] ?? DEFAULT_EMAIL;

if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL environment variable is not set.");
    console.error("Run with: bun --env-file=.env run mcp_smoke_test.ts [email]");
    process.exit(1);
}

function escapeSqlLiteral(value: string) {
    return value.replaceAll("'", "''");
}

const sqlEmail = escapeSqlLiteral(email);

const queries = [
    {
        id: 2,
        method: "tools/list",
        params: {},
        label: "tools",
    },
    {
        id: 3,
        method: "tools/call",
        params: {
            name: "query",
            arguments: {
                sql: `
SELECT id, email, "userName", status, "lastLogin"
FROM "User"
WHERE email = '${sqlEmail}'
LIMIT 1
`.trim(),
            },
        },
        label: "user",
    },
    {
        id: 4,
        method: "tools/call",
        params: {
            name: "query",
            arguments: {
                sql: `
SELECT
  id,
  "gameId",
  "providerName",
  "wageredAmount",
  "totalWinningAmount",
  "createdAt"
FROM "GameSession"
WHERE "userId" = (
    SELECT id
    FROM "User"
    WHERE email = '${sqlEmail}'
    LIMIT 1
)
AND COALESCE("isWin", false) = true
ORDER BY "createdAt" DESC
LIMIT 1
`.trim(),
            },
        },
        label: "lastWin",
    },
    {
        id: 5,
        method: "tools/call",
        params: {
            name: "query",
            arguments: {
                sql: `
SELECT g.id, g.name, g.category
FROM "Game" g
WHERE g.id = (
    SELECT "gameId"
    FROM "GameSession"
    WHERE "userId" = (
        SELECT id
        FROM "User"
        WHERE email = '${sqlEmail}'
        LIMIT 1
    )
    AND COALESCE("isWin", false) = true
    ORDER BY "createdAt" DESC
    LIMIT 1
)
LIMIT 1
`.trim(),
            },
        },
        label: "game",
    },
];

const results = new Map<string, unknown>();

const serverProcess = spawn("bun", ["run", "index.ts"], {
    stdio: ["pipe", "pipe", "pipe"],
    env: process.env,
});

serverProcess.stderr.on("data", (data) => {
    console.error(`[Server Error]: ${data}`);
});

let buffer = "";
let queryIndex = 0;

function parseContent(response: JsonRpcResponse) {
    const text = response.result?.content?.[0]?.text;
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function printSummary() {
    const tools = results.get("tools") as Array<{ name: string }> | undefined;
    const user = results.get("user") as Array<Record<string, unknown>> | undefined;
    const lastWin = results.get("lastWin") as Array<Record<string, unknown>> | undefined;
    const game = results.get("game") as Array<Record<string, unknown>> | undefined;

    console.log("\nMCP smoke test summary");
    console.log(`Email: ${email}`);
    console.log(`Tools: ${tools?.map((tool) => tool.name).join(", ") ?? "none"}`);

    if (!user || user.length === 0) {
        console.log("User: not found");
        return;
    }

    console.log(`User: ${String(user[0].email)} (${String(user[0].userName)})`);
    console.log(`Status: ${String(user[0].status)}`);
    console.log(`Last login: ${String(user[0].lastLogin)}`);

    if (!lastWin || lastWin.length === 0) {
        console.log("Last win: not found");
        return;
    }

    console.log(`Last win amount: ${String(lastWin[0].totalWinningAmount)}`);
    console.log(`Last wager: ${String(lastWin[0].wageredAmount)}`);
    console.log(`Last win time: ${String(lastWin[0].createdAt)}`);
    console.log(`Provider: ${String(lastWin[0].providerName)}`);

    if (game && game.length > 0) {
        console.log(`Game: ${String(game[0].name)} (${String(game[0].category)})`);
    } else {
        console.log(`Game ID: ${String(lastWin[0].gameId)}`);
    }
}

serverProcess.stdout.on("data", (data) => {
    buffer += data.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
        if (!line.trim()) continue;

        let response: JsonRpcResponse;
        try {
            response = JSON.parse(line);
        } catch {
            continue;
        }

        if (response.id === 1) {
            serverProcess.stdin.write(JSON.stringify({
                jsonrpc: "2.0",
                method: "notifications/initialized",
            }) + "\n");

            const request = queries[queryIndex];
            serverProcess.stdin.write(JSON.stringify({
                jsonrpc: "2.0",
                id: request.id,
                method: request.method,
                params: request.params,
            }) + "\n");
            continue;
        }

        const current = queries[queryIndex];
        if (!current || response.id !== current.id) continue;

        if (current.label === "tools") {
            results.set("tools", response.result?.tools ?? []);
        } else {
            if (response.result && "content" in response.result) {
                results.set(current.label, parseContent(response));
            }
        }

        if (response.result && "content" in response.result && (response as any).result?.isError) {
            console.error(`MCP request failed for ${current.label}`);
            process.exit(1);
        }

        queryIndex += 1;
        if (queryIndex >= queries.length) {
            printSummary();
            serverProcess.kill();
            process.exit(0);
        }

        const nextRequest = queries[queryIndex];
        serverProcess.stdin.write(JSON.stringify({
            jsonrpc: "2.0",
            id: nextRequest.id,
            method: nextRequest.method,
            params: nextRequest.params,
        }) + "\n");
    }
});

const initRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "mcp-smoke-test", version: "1.0.0" },
    },
};

console.log("Sending initialize request...");
serverProcess.stdin.write(JSON.stringify(initRequest) + "\n");

setTimeout(() => {
    console.error("Timeout waiting for response");
    serverProcess.kill();
    process.exit(1);
}, 15000);
