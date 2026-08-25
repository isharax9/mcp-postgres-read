# Changelog

All notable changes to this project are documented in this file. Releases follow [Semantic Versioning](https://semver.org/) and are prepared automatically from Conventional Commits by Release Please.

The next planned release is **v2.0.0**.

## [Unreleased]

### Added

- Cross-platform standalone builds for Windows x64, Ubuntu x64/arm64, and macOS x64/arm64.
- A localhost-only dashboard available through the `--ui` command-line flag.
- Cross-platform CI, unit tests, release archives, and SHA-256 checksums.

### Changed

- Project-root `.env` database values now take precedence over MCP-injected fallback values.
- Release automation now maintains this changelog and creates release pull requests.

## [1.0.2] - 2026-02-19

### Fixed

- Corrected the macOS release artifact build.

## [1.0.1] - 2026-02-19

### Fixed

- Corrected release artifact naming and related documentation.

## [1.0.0] - 2026-02-19

### Added

- Initial CI/CD and automated release setup.

[Unreleased]: https://github.com/isharax9/mcp-postgres-read/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/isharax9/mcp-postgres-read/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/isharax9/mcp-postgres-read/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/isharax9/mcp-postgres-read/releases/tag/v1.0.0
