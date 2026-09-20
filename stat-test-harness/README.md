# Helmet Heroes Reborn — Stat Anomaly Test Harness v3

## Root cause fixed

V2 had two different concepts mixed together:

1. a local UI simulation, and
2. a real bridge connection.

A toggle could become visually **ON** even when no game/test bridge had received or acknowledged a change. The official-site screenshot showing `HANDSHAKING`, `0` received messages, and no capabilities means no player-stat data channel existed.

V3 is acknowledgement-driven.

A modifier is **ON only after the connected test bridge confirms it**.

## Complete v3 flow

1. Open a bridge target.
2. Exchange `HH_TEST_BRIDGE_HELLO` / `HH_TEST_BRIDGE_READY`.
3. Verify capabilities:
   - `read-player-stats`
   - `apply-test-modifiers`
   - `restore-player-stats`
4. Request the original stat snapshot.
5. Store the returned values as the restoration baseline.
6. Request one or more modifier changes.
7. Keep the UI in `PENDING` until acknowledgement.
8. Update the ON/OFF state and measured values only from `HH_TEST_MODIFIERS_APPLIED`.
9. When a modifier is disabled, the bridge recalculates from the original baseline and acknowledges the restored value.
10. `Restore original values` turns all modifiers off and restores the full baseline.

## GitHub Pages

Production URL:

`https://senaganlex.github.io/stat-test-harness/`

All internal resources use repository-relative paths:

- `./core.js`
- `./protocol.js`
- `./sandbox.html`

No localhost runtime dependency exists.

Expected repository root:

```text
/
├── .nojekyll
├── 404.html
├── core.js
├── protocol.js
├── bridge-engine.js
├── index.html
├── sandbox.html
├── verify.mjs
└── README.md
```

## Hosted end-to-end verification

On GitHub Pages:

1. Open the application.
2. Confirm **Deployment ready**.
3. Click **Open hosted test bridge**.
4. Confirm:
   - Handshake = `CONNECTED`
   - Player-stat access = `AUTHORIZED`
   - Baseline snapshot = `LOADED`
5. Toggle one stat.
6. It becomes `PENDING`.
7. After bridge acknowledgement it becomes `ON`.
8. Only that stat's measured value becomes exactly ×2.
9. Disable it.
10. It becomes `PENDING`, then `OFF`, and its measured value returns to the original baseline.
11. Repeat for all nine modifiers.
12. `Restore original values` must return every modifier to OFF and every measured value to the original snapshot.

## Official-site behavior

The official-site button probes for the same authorized bridge protocol. It does not consider the website itself a stat connection.

If the target does not implement the protocol, the application reports:

- handshake timeout or insufficient capabilities,
- player-stat access unavailable,
- modifier controls disabled.

This is deliberate. It prevents a local UI toggle from being misreported as a live game modification.

For a developer-controlled beta build, implement the v3 bridge protocol in the test build. Do not enable that bridge in production.


## Deterministic certification

Run:

```bash
node verify.mjs
```

The verifier executes the same bridge stat engine used by `sandbox.html` and checks the entire flow for every modifier: original snapshot → independent application → acknowledgement → measured ×2 value → individual restoration → restore-all.
