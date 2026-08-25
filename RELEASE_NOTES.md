# v2.0.0 Release Notes

The next release makes Postgres Read MCP a cross-platform application while preserving its stdio MCP behavior.

## Highlights

- Downloadable Windows x64 (`.exe`), Ubuntu x64/arm64, and macOS Intel/Apple Silicon builds.
- A small local dashboard launched with `postgres-read --ui`.
- Live, read-only connectivity checks for every configured database target.
- Project `.env` credentials take precedence, with the MCP client's `env` block retained as fallback.
- Automated CI on Windows, Ubuntu, and macOS, plus checksummed GitHub Release archives.

The dashboard binds only to `127.0.0.1`, never displays connection strings, and uses `SELECT 1` for health checks.
