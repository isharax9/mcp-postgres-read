import { SQL } from "bun";

export type DatabaseTarget = string;

const DATABASE_URL_PREFIX = "DATABASE_URL_";

function normalizeDatabaseUrl(connectionString: string) {
    const databaseUrl = new URL(connectionString);
    databaseUrl.searchParams.delete("schema");
    return databaseUrl.toString();
}

function createConnection(connectionString: string) {
    return new SQL(normalizeDatabaseUrl(connectionString), {
        ssl: true,
        max: 5,
        idleTimeout: 30,
    });
}

function normalizeTargetName(rawTargetName: string) {
    return rawTargetName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

function resolveConfiguredDatabases() {
    const configured = new Map<DatabaseTarget, SQL>();

    for (const [envKey, envValue] of Object.entries(process.env)) {
        if (!envKey.startsWith(DATABASE_URL_PREFIX) || envKey === "DATABASE_URL_PROD") {
            continue;
        }

        const connectionString = envValue?.trim();
        if (!connectionString) {
            continue;
        }

        const rawTargetName = envKey.slice(DATABASE_URL_PREFIX.length);
        const normalizedTarget = normalizeTargetName(rawTargetName);

        if (!normalizedTarget) {
            continue;
        }

        configured.set(normalizedTarget, createConnection(connectionString));
    }

    const prodDatabaseUrl = process.env.DATABASE_URL_PROD?.trim() || process.env.DATABASE_URL?.trim();
    if (prodDatabaseUrl) {
        configured.set("prod", createConnection(prodDatabaseUrl));
    }

    if (configured.size === 0) {
        throw new Error(
            "At least one database URL is required. Set DATABASE_URL, DATABASE_URL_PROD, or any DATABASE_URL_<TARGET> environment variable."
        );
    }

    return new Map([...configured.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

const databaseConnections = resolveConfiguredDatabases();

export function getConfiguredTargets() {
    return Array.from(databaseConnections.keys());
}

export function getDb(target: DatabaseTarget) {
    const db = databaseConnections.get(target);
    if (!db) {
        throw new Error(`Database target "${target}" is not configured`);
    }
    return db;
}
