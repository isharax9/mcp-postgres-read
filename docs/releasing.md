# Release Process

Releases are automated with Release Please and GitHub Actions.

The next release is **v2.0.0**, requested by the breaking-feature Conventional Commit for the cross-platform application release.

## Normal Release Flow

1. Merge Conventional Commit changes into `main`.
2. The **Release Please** workflow opens or updates a release pull request.
3. Review the proposed version, generated release notes, `package.json`, and `CHANGELOG.md` changes.
4. Merge the release pull request.
5. Release Please creates the version tag and GitHub Release.
6. The workflow cross-compiles and attaches five platform archives and `SHA256SUMS.txt`.

Version selection follows Conventional Commits:

- `fix:` creates a patch release.
- `feat:` creates a minor release.
- `feat!:` or a `BREAKING CHANGE:` footer creates a major release.

## Supported Release Targets

| Target | Archive | Runtime |
| --- | --- | --- |
| Windows x64 | `postgres-read-windows-x64.zip` | Windows 10/11 x64 |
| Linux x64 | `postgres-read-linux-x64.tar.gz` | Ubuntu/Linux x64 |
| Linux arm64 | `postgres-read-linux-arm64.tar.gz` | Ubuntu/Linux arm64 |
| macOS x64 | `postgres-read-macos-x64.tar.gz` | Intel Mac |
| macOS arm64 | `postgres-read-macos-arm64.tar.gz` | Apple Silicon Mac |

## Manual Verification

Before merging a release pull request, run:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run test:unit
bun run build:all
```

Database-backed MCP smoke tests remain manual because CI does not receive production or development credentials.
