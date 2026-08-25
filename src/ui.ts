import { spawn } from "node:child_process";
import { getConfiguredTargets } from "./db.js";
import { safeQuery } from "./validation.js";
import { APP_VERSION } from "./version.js";

type DashboardOptions = {
    port?: number;
    openBrowser?: boolean;
};

const html = String.raw`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Postgres Read MCP</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; color: #e8f2ee; background: radial-gradient(circle at 15% 0%, #173b35 0, transparent 36rem), #09110f; }
    main { width: min(960px, calc(100% - 32px)); margin: 0 auto; padding: 56px 0 72px; }
    header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 32px; }
    .eyebrow { margin: 0 0 10px; color: #71e3b6; font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
    h1 { margin: 0; font-size: clamp(32px, 6vw, 56px); letter-spacing: -.05em; line-height: 1; }
    .subtitle { margin: 16px 0 0; color: #9cb4aa; max-width: 600px; font-size: 16px; line-height: 1.6; }
    .version { flex: none; padding: 9px 12px; border: 1px solid #2a5146; border-radius: 999px; color: #b7d5c9; background: #10211d; font: 700 12px ui-monospace, monospace; }
    .panel { border: 1px solid #234239; border-radius: 20px; overflow: hidden; background: rgba(14, 29, 25, .88); box-shadow: 0 28px 80px rgba(0, 0, 0, .28); }
    .panel-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 22px; border-bottom: 1px solid #234239; }
    .panel-head h2 { margin: 0; font-size: 16px; }
    button { border: 0; border-radius: 10px; padding: 10px 14px; color: #06100d; background: #71e3b6; font-weight: 800; cursor: pointer; }
    button:hover { background: #8bedc6; }
    button:disabled { cursor: wait; opacity: .65; }
    #targets { display: grid; gap: 1px; background: #234239; }
    .target { display: grid; grid-template-columns: minmax(120px, 1fr) auto auto; align-items: center; gap: 18px; padding: 20px 22px; background: #0e1d19; }
    .name { font: 750 15px ui-monospace, "SFMono-Regular", Consolas, monospace; }
    .latency { color: #829e93; font: 12px ui-monospace, monospace; }
    .badge { min-width: 88px; padding: 7px 10px; border-radius: 999px; text-align: center; font-size: 12px; font-weight: 800; }
    .checking { color: #dfc47a; background: #302a18; }
    .healthy { color: #82edc3; background: #12392d; }
    .failed { color: #ff9c9c; background: #3a1d1d; }
    .empty { padding: 32px 22px; color: #9cb4aa; background: #0e1d19; }
    footer { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-top: 20px; color: #6f8c81; font-size: 12px; }
    footer span::before { content: ""; display: inline-block; width: 6px; height: 6px; margin-right: 8px; border-radius: 50%; background: #3b6658; vertical-align: 1px; }
    @media (max-width: 560px) { header { display: block; } .version { display: inline-block; margin-top: 20px; } .target { grid-template-columns: 1fr auto; } .latency { display: none; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <p class="eyebrow">Local control panel</p>
        <h1>Postgres Read MCP</h1>
        <p class="subtitle">A private view of configured database targets and read-only connectivity. Connection strings never leave this machine.</p>
      </div>
      <span class="version" id="version">loading</span>
    </header>
    <section class="panel">
      <div class="panel-head">
        <h2>Database targets</h2>
        <button id="refresh" type="button">Check connections</button>
      </div>
      <div id="targets"><div class="empty">Loading configured targets…</div></div>
    </section>
    <footer><span>localhost only</span><span>SELECT 1 health checks</span><span id="platform"></span></footer>
  </main>
  <script>
    const targetsElement = document.querySelector("#targets");
    const refreshButton = document.querySelector("#refresh");

    function render(results) {
      targetsElement.replaceChildren();
      if (!results.length) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "No database targets are configured.";
        targetsElement.append(empty);
        return;
      }
      for (const result of results) {
        const row = document.createElement("div");
        row.className = "target";
        const name = document.createElement("span");
        name.className = "name";
        name.textContent = result.target;
        const latency = document.createElement("span");
        latency.className = "latency";
        latency.textContent = result.latencyMs == null ? "—" : result.latencyMs + " ms";
        const badge = document.createElement("span");
        badge.className = "badge " + (result.ok ? "healthy" : "failed");
        badge.textContent = result.ok ? "Connected" : "Unavailable";
        row.append(name, latency, badge);
        targetsElement.append(row);
      }
    }

    async function check() {
      refreshButton.disabled = true;
      refreshButton.textContent = "Checking…";
      try {
        const response = await fetch("/api/health", { cache: "no-store" });
        if (!response.ok) throw new Error("Health request failed");
        render(await response.json());
      } catch {
        render([{ target: "Dashboard API", ok: false, latencyMs: null }]);
      } finally {
        refreshButton.disabled = false;
        refreshButton.textContent = "Check connections";
      }
    }

    fetch("/api/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((status) => {
        document.querySelector("#version").textContent = "v" + status.version;
        document.querySelector("#platform").textContent = status.platform + " / " + status.arch;
      });
    refreshButton.addEventListener("click", check);
    check();
  </script>
</body>
</html>`;

function jsonResponse(value: unknown, status = 200) {
    return new Response(JSON.stringify(value), {
        status,
        headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store",
            "x-content-type-options": "nosniff",
        },
    });
}

async function checkConnections() {
    return Promise.all(getConfiguredTargets().map(async (target) => {
        const startedAt = performance.now();
        try {
            await safeQuery(target, "SELECT 1 AS ok");
            return { target, ok: true, latencyMs: Math.round(performance.now() - startedAt) };
        } catch {
            return { target, ok: false, latencyMs: Math.round(performance.now() - startedAt) };
        }
    }));
}

function openBrowser(url: string) {
    const command = process.platform === "win32"
        ? ["cmd", "/c", "start", "", url]
        : process.platform === "darwin"
            ? ["open", url]
            : ["xdg-open", url];

    try {
        const child = spawn(command[0]!, command.slice(1), {
            detached: true,
            stdio: "ignore",
            windowsHide: true,
        });
        child.on("error", () => undefined);
        child.unref();
    } catch {
        // The URL is printed by the CLI when no graphical browser is available.
    }
}

export function startDashboard(options: DashboardOptions = {}) {
    const server = Bun.serve({
        hostname: "127.0.0.1",
        port: options.port ?? 8787,
        async fetch(request) {
            const url = new URL(request.url);

            if (request.method === "GET" && url.pathname === "/") {
                return new Response(html, {
                    headers: {
                        "content-type": "text/html; charset=utf-8",
                        "content-security-policy": "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'none'",
                        "x-content-type-options": "nosniff",
                        "x-frame-options": "DENY",
                    },
                });
            }

            if (request.method === "GET" && url.pathname === "/api/status") {
                return jsonResponse({
                    version: APP_VERSION,
                    platform: process.platform,
                    arch: process.arch,
                    targets: getConfiguredTargets(),
                });
            }

            if (request.method === "GET" && url.pathname === "/api/health") {
                return jsonResponse(await checkConnections());
            }

            if (request.method === "GET" && url.pathname === "/favicon.ico") {
                return new Response(null, { status: 204 });
            }

            return jsonResponse({ error: "Not found" }, 404);
        },
    });

    const url = `http://${server.hostname}:${server.port}`;
    if (options.openBrowser !== false) {
        setTimeout(() => openBrowser(url), 150);
    }

    return { server, url };
}
