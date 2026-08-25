# Local Development Guide

This guide describes how to set up the `postgres-read` MCP server for local development.

## Prerequisites

- [Bun](https://bun.sh) (v1.2.0 or later)
- One or more PostgreSQL databases
- Git

## Setup Instructions

1.  **Clone the Repository**

    ```bash
    git clone <your-repo-url>
    cd postgres-read
    ```

2.  **Install Dependencies**

    ```bash
    bun install
    ```

3.  **Environment Configuration**

    Create a `.env` file in the root directory:

    ```bash
    touch .env
    ```

    Add one or more PostgreSQL connection strings to `.env`:

    ```env
    DATABASE_URL_PROD=postgresql://user:password@localhost:5432/prod_db?sslmode=require
    DATABASE_URL_ANALYTICS_DEV=postgresql://user:password@localhost:5432/analytics_dev?sslmode=require
    DATABASE_URL_BILLING_QA=postgresql://user:password@localhost:5432/billing_qa?sslmode=require
    DATABASE_URL_PARTNER_SANDBOX=postgresql://user:password@localhost:5432/partner_sandbox?sslmode=require
    ```

    `DATABASE_URL` also works as a fallback for `prod` if you want to keep the old setup. Any variable matching `DATABASE_URL_<TARGET>` becomes a database target, and `<TARGET>` is normalized to lowercase snake_case for tool names.

    Values in this project-root `.env` file take precedence over values injected by an MCP client's `env` configuration. If a variable is missing, empty, or commented out here, the server falls back to the corresponding MCP-provided environment value.

    > **Note:** Ensure at least one configured database is running and accessible.

## Running Locally

To start the server from source:

```bash
bun run index.ts
```

The server communicates via `stdin`/`stdout`. You won't see typical log output unless you attach a debugger or use an MCP client.

## Building the Project

To build a standalone executable for the current operating system and CPU:

```bash
bun run build
```

Build output is written to `dist/`. To cross-compile every supported release target:

```bash
bun run build:all
```

You can also build one target with `bun run scripts/build.ts <target>`, where `<target>` is `windows-x64`, `linux-x64`, `linux-arm64`, `macos-x64`, or `macos-arm64`.

Platform shortcuts are available as `bun run build:windows`, `bun run build:linux`, and `bun run build:macos`.

## Running the Dashboard

Start the cross-platform local UI from source:

```bash
bun run index.ts --ui
```

The default address is `http://127.0.0.1:8787`. Use `--port <number>` to change it or `--no-open` when running without a desktop browser.

## Testing

To verify the server is working correctly, you can run the verification script:


```bash
cp .env.example .env
# Edit .env with your credentials
bun run test
```

This script simulates an MCP client, initializing the connection and listing available tools.

Database-independent checks used by CI are also available locally:

```bash
bun run typecheck
bun run test:unit
```
