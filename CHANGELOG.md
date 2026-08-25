# Changelog

All notable changes to this project are documented in this file. Releases follow [Semantic Versioning](https://semver.org/) and are prepared automatically from Conventional Commits by Release Please.

The next planned release is **v2.0.0**.

## [2.0.1](https://github.com/isharax9/mcp-postgres-read/compare/v2.0.0...v2.0.1) (2026-08-25)


### Bug Fixes

* **release:** checkout before publishing assets ([7ade069](https://github.com/isharax9/mcp-postgres-read/commit/7ade069079f94f072808bd79023e1dc793536ce9))
* **release:** checkout before publishing assets ([c5dc996](https://github.com/isharax9/mcp-postgres-read/commit/c5dc996b364b6e0254ba253deb511844c4474bab))

## [2.0.0](https://github.com/isharax9/mcp-postgres-read/compare/v1.0.2...v2.0.0) (2026-08-25)


### ⚠ BREAKING CHANGES

* release assets now use platform-specific archive names instead of the legacy single macOS artifact.

### Features

* add cross-platform releases and dashboard ([989039d](https://github.com/isharax9/mcp-postgres-read/commit/989039df4d05377f571523a5c83b338ebedfaa8d))
* add MCP smoke test workflow ([77198b3](https://github.com/isharax9/mcp-postgres-read/commit/77198b38a77aad3b0b57f41cbbd450e1a3712108))
* enhance multi-database support and update documentation ([1ad36d6](https://github.com/isharax9/mcp-postgres-read/commit/1ad36d696514fefa8537856bbb7156aed2dcf695))
* implement environment variable management and update documentation ([3e32a3a](https://github.com/isharax9/mcp-postgres-read/commit/3e32a3adf13a535bb12fbdb6991c6ee60f9ce5cf))
* setup ci/cd pipeline with semantic release ([63d5f64](https://github.com/isharax9/mcp-postgres-read/commit/63d5f64d44df4a5499a87727be904df44cfb8902))


### Bug Fixes

* **ci:** use Windows release name in native verification ([5b35b20](https://github.com/isharax9/mcp-postgres-read/commit/5b35b202aaefd7bd98eb5418c4cfeaa5285d141b))
* update artifact name and docs ([fa458eb](https://github.com/isharax9/mcp-postgres-read/commit/fa458eb69782cd0653883aa53a8d30d5292ddefc))
* update artifact to macos build ([aeaa1fc](https://github.com/isharax9/mcp-postgres-read/commit/aeaa1fc2c12001683c3b82821ac503a790fe0f26))

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
