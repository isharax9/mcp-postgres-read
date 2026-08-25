# Postgres Read MCP Server

A Model Context Protocol (MCP) server that provides read-only access to one or more PostgreSQL databases. It allows AI assistants like Antigravity, Claude, or Cursor to safely query your databases and inspect schemas.

## Documentation

- **[Local Development Guide](./local_development.md)**  
  Instructions for setting up the project locally, installing dependencies, and running tests.

- **[IDE Configuration Guide](./ide_configuration.md)**  
  How to configure this MCP server with AI clients like:
  - Antigravity
  - Claude Desktop
  - Cursor

- **[Contribution Guide](./contribution_guide.md)**  
  Guidelines for contributing to the project, reporting issues, and submitting pull requests.

## Features

- **Multi-Database Access**: Connect to any number of named database targets.
- **Read-Only Access**: Safely query your databases without risk of modification.
- **Schema Inspection**: List tables and view table definitions.
- **Secure**: Uses environment variables for connection strings.
- **Fast**: Built on the [Bun](https://bun.sh) runtime.
- **Cross-platform**: Standalone releases for Windows, Ubuntu/Linux, and macOS.
- **Local Dashboard**: Optional browser UI for connection health without exposing credentials.

## Environment Variables

Configure one or more of these in your `.env`:

```env
DATABASE_URL_PROD=postgresql://user:password@host:5432/prod_db?sslmode=require
DATABASE_URL_ANALYTICS_DEV=postgresql://user:password@host:5432/analytics_dev?sslmode=require
DATABASE_URL_BILLING_QA=postgresql://user:password@host:5432/billing_qa?sslmode=require
DATABASE_URL_PARTNER_SANDBOX=postgresql://user:password@host:5432/partner_sandbox?sslmode=require
```

`DATABASE_URL` is still supported as a backward-compatible fallback for `prod`.

The project-root `.env` file has precedence over variables supplied by the MCP client. Non-empty `.env` database values are used first; missing, empty, or commented-out values fall back to the process environment (for example, the `env` block in `mcp.json`). For `prod`, each source checks `DATABASE_URL_PROD` before the legacy `DATABASE_URL` fallback.

Each `DATABASE_URL_<TARGET>` variable becomes a tool target named from `<TARGET>` after normalization:

- Uppercase becomes lowercase
- Non-alphanumeric characters become `_`
- Leading and trailing `_` are removed

Examples:

- `DATABASE_URL_ANALYTICS_DEV` -> `analytics_dev`
- `DATABASE_URL_BILLING-QA` is not a valid env var name in most shells, so use `DATABASE_URL_BILLING_QA` -> `billing_qa`
- `DATABASE_URL_PARTNER_SANDBOX` -> `partner_sandbox`

## Available Tools

For each configured database target, the server exposes:

- **`list_tables_<target>`**: List all tables in the public schema.
- **`describe_table_<target>`**: Get schema details for a specific table.
- **`query_<target>`**: Execute a read-only SQL query (`SELECT` only).

Example targets:

- `prod`
- `analytics_dev`
- `billing_qa`
- `partner_sandbox`

## Quick Verification

Run the basic MCP handshake check:

```bash
bun --env-file=.env run test
```

Run the fuller smoke test for tool discovery and sample `prod` queries:

```bash
bun --env-file=.env run test:smoke -- ishara.lakshitha.eds@gmail.com
```

## Local Dashboard

The source server and every standalone executable include the same localhost-only dashboard:

```bash
# From source
bun run index.ts --ui

# From a release build (Windows)
postgres-read-windows-x64.exe --ui

# From a release build (macOS or Linux)
./postgres-read-macos-arm64 --ui
```

The dashboard opens at `http://127.0.0.1:8787`, lists configured target names, and runs only `SELECT 1` connectivity checks. Use `--no-open` to prevent automatic browser launch or `--port 9000` to choose another local port.

Do not add `--ui` to an MCP client configuration. The default mode remains the stdio MCP server.

## Release Downloads

GitHub Releases provide these checksummed archives:

- `postgres-read-windows-x64.zip`
- `postgres-read-linux-x64.tar.gz`
- `postgres-read-linux-arm64.tar.gz`
- `postgres-read-macos-x64.tar.gz` (Intel)
- `postgres-read-macos-arm64.tar.gz` (Apple Silicon)

Place `.env` beside the extracted executable when you want file-based credentials. MCP-client environment variables remain available as fallbacks.

Release history is recorded in [CHANGELOG.md](./CHANGELOG.md), with highlights for the next release in [RELEASE_NOTES.md](./RELEASE_NOTES.md).

## Troubleshooting

### macOS: "App is damaged and can't be opened"
If you see this error when running the binary on macOS, it's due to Gatekeeper blocking unsigned binaries. Run the following command to allow execution:

```bash
xattr -d com.apple.quarantine postgres-read-macos-arm64
```

On macOS and Linux, ensure the extracted binary is executable:

```bash
chmod +x postgres-read-*
```
