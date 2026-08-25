import { describe, expect, test } from "bun:test";
import { getFirstEnvironmentValue, getPreferredEnvironmentValue } from "../src/environment.js";

describe("database environment precedence", () => {
    test("prefers a project .env value", () => {
        expect(getPreferredEnvironmentValue(
            "DATABASE_URL_DEV",
            { DATABASE_URL_DEV: "project-dev" },
            { DATABASE_URL_DEV: "mcp-dev" },
        )).toBe("project-dev");
    });

    test("falls back to the MCP process environment", () => {
        expect(getPreferredEnvironmentValue(
            "DATABASE_URL_DEV",
            { DATABASE_URL_DEV: "  " },
            { DATABASE_URL_DEV: "mcp-dev" },
        )).toBe("mcp-dev");
    });

    test("prefers the project source before the legacy prod fallback", () => {
        const keys = ["DATABASE_URL_PROD", "DATABASE_URL"];
        const projectValue = getFirstEnvironmentValue(keys, { DATABASE_URL: "project-prod" });
        const runtimeValue = getFirstEnvironmentValue(keys, { DATABASE_URL_PROD: "mcp-prod" });
        expect(projectValue || runtimeValue).toBe("project-prod");
    });
});
