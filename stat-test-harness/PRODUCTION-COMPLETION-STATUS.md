# V7 production status

## Completed

- Corrected misleading post-timeout authentication display.
- Authentication now distinguishes `unobservable` from `unauthenticated`.
- Automatic passive integration re-probing continues after `AUTH-BRIDGE-001`.
- Protocol-v7 realtime subscription.
- Realtime state events.
- Polling fallback when push is unsupported.
- Heartbeat connection health.
- Optional authenticated SSE events endpoint.
- HTTP state polling.
- Realtime player/session/capability/stat/modifier synchronization.
- Revision tracking.
- Nine independent test modifiers.
- Acknowledgement-driven ON/OFF state.
- Individual and full restoration.
- Hosted full relay/game realtime lab.
- Deterministic and protocol integration tests.
- GitHub Pages-compatible relative deployment.

## External dependency that remains

The live `helmet-heroes.com` / game origin must expose an authorized provider before the GitHub Pages harness can observe the authenticated live player's private stats.

V7 continuously detects that provider if it becomes available, but it does not bypass browser same-origin isolation.
