# Developers Guide

Deep-dive reference documentation for GraphDB Workbench internals. Each topic below lives in its own file under `reference/`.

## Architecture & APIs
- [Context API](reference/context-api.md) — stateful context services and the `ContextService` abstraction
- [Persistence API](reference/persistence-api.md) — local-storage-backed persistence
- [HTTP interceptors](reference/http-interceptors.md) — request/response interceptor chains
- [Logging](reference/logging.md) — centralized logging service

## Extending the workbench
- [Plugin system](reference/plugin-system.md) — extension points, `plugin.js`, and color themes
- [Icons](reference/icons.md) — Remix + Icomoon icon sets
- [Internationalization (i18n)](reference/i18n.md) — translation merging and validation

## Build & delivery
- [Bundling](reference/bundling.md) — webpack build pipeline
- [CI](reference/ci.md) — Jenkins pipeline and code coverage
- [Release](reference/release.md) — release pipeline

## Testing & troubleshooting
- [Security testing](reference/security-testing.md) — the e2e security suite
- [Known issues](reference/known-issues.md) — Chrome Basic Auth caching
