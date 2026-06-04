import { getConfiguredTargets, getDb, type DatabaseTarget } from "./db.js";
import { safeQuery } from "./validation.js";

type ToolDefinition = {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: Record<string, unknown>;
        required?: string[];
    };
};

type ToolAction = (args: any) => Promise<{
    content: Array<{ type: "text"; text: string }>;
}>;

const toolHandlers = new Map<string, ToolAction>();

function textResponse(payload: unknown) {
    return {
        content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    };
}

function sanitizeTableName(rawTableName: string) {
    return rawTableName.replace(/[^a-zA-Z0-9_]/g, "");
}

function registerDatabaseTools(target: DatabaseTarget): ToolDefinition[] {
    const db = getDb(target);

    const queryToolName = `query_${target}`;
    const listTablesToolName = `list_tables_${target}`;
    const describeTableToolName = `describe_table_${target}`;

    toolHandlers.set(queryToolName, async (args) => {
        const rows = await safeQuery(target, args?.sql as string);
        return textResponse(rows);
    });

    toolHandlers.set(listTablesToolName, async () => {
        const rows = await db.unsafe(`
            SELECT table_name, table_type
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        return textResponse(rows);
    });

    toolHandlers.set(describeTableToolName, async (args) => {
        const tableName = sanitizeTableName(args?.table_name as string);
        const rows = await db.unsafe(`
            SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = '${tableName}'
            ORDER BY ordinal_position
        `);
        return textResponse(rows);
    });

    return [
        {
            name: queryToolName,
            description: `Execute a read-only SQL SELECT query against the ${target} database`,
            inputSchema: {
                type: "object",
                properties: {
                    sql: { type: "string", description: "A SELECT or WITH (CTE) SQL statement" },
                },
                required: ["sql"],
            },
        },
        {
            name: listTablesToolName,
            description: `List all tables in the public schema for the ${target} database`,
            inputSchema: { type: "object", properties: {} },
        },
        {
            name: describeTableToolName,
            description: `Get column definitions and types for a specific table in the public schema for the ${target} database`,
            inputSchema: {
                type: "object",
                properties: {
                    table_name: { type: "string", description: "Table name" },
                },
                required: ["table_name"],
            },
        },
    ];
}

function registerLegacyProdAliases(): ToolDefinition[] {
    const prodDb = getDb("prod");

    toolHandlers.set("query", async (args) => {
        const rows = await safeQuery("prod", args?.sql as string);
        return textResponse(rows);
    });

    toolHandlers.set("list_tables", async () => {
        const rows = await prodDb.unsafe(`
            SELECT table_name, table_type
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        return textResponse(rows);
    });

    toolHandlers.set("describe_table", async (args) => {
        const tableName = sanitizeTableName(args?.table_name as string);
        const rows = await prodDb.unsafe(`
            SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = '${tableName}'
            ORDER BY ordinal_position
        `);
        return textResponse(rows);
    });

    return [
        {
            name: "query",
            description: "Execute a read-only SQL SELECT query against the prod database",
            inputSchema: {
                type: "object",
                properties: {
                    sql: { type: "string", description: "A SELECT or WITH (CTE) SQL statement" },
                },
                required: ["sql"],
            },
        },
        {
            name: "list_tables",
            description: "List all tables in the public schema for the prod database",
            inputSchema: { type: "object", properties: {} },
        },
        {
            name: "describe_table",
            description: "Get column definitions and types for a specific table in the public schema for the prod database",
            inputSchema: {
                type: "object",
                properties: {
                    table_name: { type: "string", description: "Table name" },
                },
                required: ["table_name"],
            },
        },
    ];
}

const configuredTargets = getConfiguredTargets();

export const TOOLS = [
    ...configuredTargets.flatMap(registerDatabaseTools),
    ...(configuredTargets.includes("prod") ? registerLegacyProdAliases() : []),
];

export async function handleCallTool(name: string, args: any) {
    const handler = toolHandlers.get(name);
    if (!handler) {
        throw new Error(`Unknown tool: ${name}`);
    }

    return await handler(args);
}
