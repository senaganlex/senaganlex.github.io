# Helmet Heroes Reborn — Authenticated Stat Test Harness v4

## Purpose

V4 adds an explicit authenticated-player workflow for the official Helmet Heroes site while preserving browser security boundaries.

## Official workflow

1. Click **Open Official Site & Authenticate**.
2. Sign in using the normal Helmet Heroes login controls in the official-site window.
3. The harness probes for a supported authenticated-session interface.
4. Player-stat retrieval is blocked until authentication is positively confirmed.
5. If an authenticated player is reported and `read-player-stats` is authorized, the harness requests the player's stat snapshot.
6. Stat modifiers remain disabled unless the authenticated session also explicitly authorizes the test mutation capabilities.

The harness never asks for or stores the user's account password.

## Important live-site limitation

A GitHub Pages application cannot read another origin's login cookies, DOM, storage, or private game state. Therefore the official site must provide one of:

- an explicit `postMessage` authentication/stat bridge, or
- a documented credentialed CORS API.

Without one of those interfaces, the correct result is:

`SUPPORTED INTERFACE NOT DETECTED`

This is not a login bypass problem and should not be worked around by reading cookies, injecting into the game, or intercepting session traffic.

See `OFFICIAL-INTEGRATION.md`.

## Hosted end-to-end authentication test

Click **Open Hosted Auth Test Bridge**.

1. The test window initially reports unauthenticated.
2. Click **Authenticate test player** in that window.
3. Return to the harness or click **Check Authenticated Session**.
4. The harness detects the authenticated test player.
5. It retrieves the original stat snapshot.
6. The nine independent modifiers become available.
7. Each requested change remains pending until acknowledgement.
8. Disabling a modifier restores only that statistic.
9. **Restore original values** restores the entire baseline.

## GitHub Pages files

```text
/
├── .nojekyll
├── 404.html
├── README.md
├── OFFICIAL-INTEGRATION.md
├── config.js
├── core.js
├── protocol.js
├── bridge-engine.js
├── official-auth-adapter.js
├── auth-sandbox.html
├── index.html
└── verify.mjs
```

## Verification

```bash
node verify.mjs
```
