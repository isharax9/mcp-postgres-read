import { afterEach, describe, expect, test } from "bun:test";
import type { Server } from "bun";
import { startDashboard } from "../src/ui.js";

let server: Server<unknown> | undefined;

afterEach(() => {
    server?.stop(true);
    server = undefined;
});

describe("local dashboard", () => {
    test("serves the UI and a credential-free status response", async () => {
        const dashboard = startDashboard({ port: 0, openBrowser: false });
        server = dashboard.server;

        const page = await fetch(dashboard.url);
        expect(page.status).toBe(200);
        expect(await page.text()).toContain("Postgres Read MCP");

        const status = await fetch(`${dashboard.url}/api/status`);
        expect(status.status).toBe(200);
        const body = await status.json() as Record<string, unknown>;
        expect(body).toHaveProperty("version");
        expect(body).toHaveProperty("targets");
        expect(JSON.stringify(body)).not.toContain("postgresql://");
    });
});
