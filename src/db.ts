
import { SQL } from "bun";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
}

const databaseUrl = new URL(process.env.DATABASE_URL);
databaseUrl.searchParams.delete("schema");

const db = new SQL(databaseUrl.toString(), {
    ssl: true,
    max: 5,
    idleTimeout: 30,
});

export default db;
