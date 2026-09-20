# Helmet Heroes Reborn — Stat Anomaly Test Harness v2

## What changed

v2 adds a controlled connection layer.

### Official-site mode

The harness can open:

`https://www.helmet-heroes.com/`

and send a non-mutating `HH_TEST_BRIDGE_HELLO` handshake. The harness reports **CONNECTED** only if the opened page explicitly answers with a matching `HH_TEST_BRIDGE_READY` message.

The official connector does not:
- inject JavaScript,
- read cross-origin page internals,
- inspect memory,
- intercept WebSocket/network traffic,
- alter player stats,
- send modifier state into the live service.

This is intentionally fail-closed.

### Local beta bridge simulator

`Open local beta bridge` launches `sandbox.html`, which implements the handshake and accepts the nine synthetic stat modifiers.

`Push state to local bridge` sends the current test scenario to the simulator, which:
1. compares effective values to baseline values,
2. detects exact ×2 signatures,
3. returns telemetry,
4. recommends `ALLOW` or `REJECT_AND_RECONCILE`.

This provides an end-to-end test target for the detection/countermeasure logic.

## Run locally

Because `postMessage` origin checks are part of the test, run this through a local web server rather than opening the HTML with `file://`.

```bash
cd helmet-heroes-reborn-stat-test-harness-v2
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

## Test sequence

1. Click `Open local beta bridge`.
2. Confirm the bridge state becomes `CONNECTED`.
3. Toggle any combination of modifiers.
4. Click `Push state to local bridge`.
5. Inspect the simulator's validation response and the harness telemetry/log.

## Live/private integration

For a developer-controlled private build, implement the same handshake in the test build and keep it disabled in production. The live public connector should remain telemetry/handshake-only unless the game developer provides an explicit authorized testing interface.
