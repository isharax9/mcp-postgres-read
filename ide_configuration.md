# IDE Configuration Guide

This guide explains how to configure the `postgres-read` MCP server for use with AI assistants and IDEs like Antigravity, Claude Desktop, and Cursor.

## Configuration File Locations

- **Antigravity**: Configure via `mcp_config.json` (see Option 2 below).
- **Claude Desktop (macOS)**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Cursor**: `~/.cursor/mcp.json` (or via Settings > Features > MCP)

## Configuration Options

You can configure the server to run either from local source code or using a pre-built executable.

### Option 1: Running from Local Source code

Use this method if you have the source code checked out locally and want to make changes.

**Prerequisites:**
- [Bun](https://bun.sh) installed
- Repository cloned locally

**Configuration JSON:**

```json
{
  "mcpServers": {
    "postgres-read": {
      "command": "bun",
      "args": [
        "run",
        "/absolute/path/to/your/postgres-read/index.ts"
      ],
      "env": {
        "DATABASE_URL": "postgresql://user:password@localhost:5432/dbname?sslmode=require"
      }
    }
  }
}
```

> **Note:** Replace `/absolute/path/to/your/postgres-read/index.ts` with the actual path to your `index.ts` file.

If the repository contains a project-root `.env`, its non-empty database values take precedence over this `env` block. Keep the `env` block to provide fallback values when a variable is absent, empty, or commented out in `.env`.

### Option 2: Running from a Downloaded Build Artifact (Recommended for Use)

Use this method if you downloaded a pre-built binary from the GitHub Releases page.

**Configuration JSON:**

```json
{
  "mcpServers": {
    "postgres-read": {
      "command": "/absolute/path/to/downloaded/postgres-read-<platform>-<architecture>",
      "args": [],
      "env": {
        "DATABASE_URL": "postgresql://user:password@localhost:5432/dbname?sslmode=require"
      }
    }
  }
}
```

> **Important:** When using the standalone executable, `args` must be an empty array `[]`. Do NOT use `bun run`.


> **Note:**
> 1. Replace the command with the extracted Windows, Linux, or macOS executable path. Windows paths should point to `postgres-read-windows-x64.exe`.
> 2. Ensure the file has execute permissions (`chmod +x postgres-read-macos-arm64`).
> 3. On macOS, you may need to allow the executable to run in System Settings > Privacy & Security if it's blocked.

## Environment Variables

The server requires at least one database environment variable:

- `DATABASE_URL_PROD` or legacy `DATABASE_URL` configures `prod`.
- Any `DATABASE_URL_<TARGET>` configures a named target such as `dev`, `qa`, or `analytics`.

When a `.env` file is placed beside the entrypoint or standalone executable, its active database values take precedence over this MCP-client `env` block.

## Dashboard Mode

The same executable can be launched manually with `--ui` to open its local status dashboard. This is a separate mode and must not be added to the MCP client's `args`, because MCP clients require the default stdio mode.
