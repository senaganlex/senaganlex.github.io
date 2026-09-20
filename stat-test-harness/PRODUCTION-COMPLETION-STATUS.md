# Production completion status

## Completed in V6

- GitHub Pages project-path-safe deployment.
- Standard official-site login launch.
- No password handling by the harness.
- Explicit authenticated-session probing.
- Complete documented credentialed-CORS provider path: session, stats, test modifiers, and restoration.
- Authorized `postMessage` provider.
- Hardened official-site relay with exact iframe target origins.
- Authorized game bridge with explicit `HelmetHeroesTestHost` adapter.
- Sanitized player identity.
- Separate read-stat and mutation capability checks.
- Required stat-schema validation.
- Read-only operation when only stat-reading is authorized.
- Nine independently controlled modifiers in authorized test environments.
- Acknowledgement-driven ON/OFF state.
- Individual restoration.
- Full restoration.
- Request timeouts and error diagnostics.
- Stale/unexpected acknowledgement rejection.
- Hosted full-integration lab using relay + game bridge + adapter.
- Deterministic verifier.
- Executable relay/game-bridge protocol integration certification.

## External production dependency

The public Helmet Heroes page/game must deploy either:

1. the supplied relay + game bridge backed by an authorized game adapter, or
2. documented session/stat APIs with suitable CORS.

A GitHub Pages deployment alone cannot install code into `helmet-heroes.com` or `itch.zone`, and cannot read those origins' authenticated private state.

Therefore live official player-stat access cannot be certified until the site/game owner deploys one of those provider interfaces.
