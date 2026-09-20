# Official Helmet Heroes integration contract — version 7

## Purpose

The GitHub Pages harness can become fully connected only when an origin controlled by the Helmet Heroes site/game owner exposes an explicit authorized interface.

The package contains both required browser-side components:

- `official-site-relay.js`
- `game-test-bridge.js`

These are complete relay/adapter components, but they must be deployed by the owner of the corresponding official/game origins.

## Topology

```text
https://senaganlex.github.io/stat-test-harness/
        |
        | protocol v6
        v
https://www.helmet-heroes.com/     <- official-site-relay.js
        |
        | protocol v6
        v
authorized game/test iframe        <- game-test-bridge.js
        |
        v
window.HelmetHeroesTestHost        <- game-owned adapter
```

## Game-owned adapter

The game/test build supplies:

```js
window.HelmetHeroesTestHost = {
  allowedParentOrigins: [
    "https://www.helmet-heroes.com"
  ],

  async getAuthenticatedPlayer() {
    return {
      authenticated: true,
      player: { id: "123", username: "example" }
    };
  },

  async getCapabilities() {
    return [
      "read-player-stats",
      "apply-test-modifiers",
      "restore-player-stats"
    ];
  },

  async getPlayerStats() {
    return {
      attackDamage: 60,
      criticalChance: 10,
      attackSpeed: 1,
      defense: 80,
      dexterity: 50,
      luck: 25,
      orbAttack: 60,
      orbDefense: 40,
      orbCritMultiplier: 1.5
    };
  },

  async setTestModifiers(flags) {
    // Authorized test-environment implementation.
    // Return { applied, stats } after the server/test build confirms the change.
  },

  async restorePlayerStats() {
    // Return { stats } after restoration is confirmed.
  }
};
```

The adapter is deliberately not auto-discovered from private game runtime objects.

## Security requirements

Do not return or relay:

- passwords
- raw cookies
- session IDs
- access tokens
- refresh tokens
- private authentication secrets

Restrict mutation capability to authorized test environments/accounts.

## Alternative CORS API

If the site owner provides documented HTTPS APIs, configure `sessionEndpoint` and `statsEndpoint` in `config.js`.

The API must explicitly allow the harness origin and, if cookie-backed, credentialed CORS.

## Diagnostic meaning

- `AUTH-BRIDGE-001`: no authorized official bridge or session API responded.
- `AUTH-STATE-002`: supported provider reports unauthenticated.
- `STAT-ACCESS-002`: authenticated but `read-player-stats` is not authorized.
- `STAT-SCHEMA-003`: returned stats do not match the required schema.
- `STAT-TIMEOUT-004`: stat request was not acknowledged.
- `MOD-ACK-005`: modifier request timed out.
- `RESTORE-ACK-006`: restoration timed out.
- `OK`: player identity and stat baseline are loaded; no current protocol error.


## Complete HTTPS API alternative

For a fully functional API transport, configure all four endpoints in `config.js`:

```js
sessionEndpoint: "https://www.helmet-heroes.com/api/test-harness/session",
statsEndpoint: "https://www.helmet-heroes.com/api/test-harness/player-stats",
setModifiersEndpoint: "https://www.helmet-heroes.com/api/test-harness/modifiers",
restoreEndpoint: "https://www.helmet-heroes.com/api/test-harness/restore"
```

Mutation response:

```json
{
  "applied": {
    "attackDamage": true
  },
  "stats": {
    "attackDamage": 120,
    "criticalChance": 10,
    "attackSpeed": 1,
    "defense": 80,
    "dexterity": 50,
    "luck": 25,
    "orbAttack": 60,
    "orbDefense": 40,
    "orbCritMultiplier": 1.5
  }
}
```

The server must normalize the complete `applied` map before responding. The example above is abbreviated only for readability.

Restoration response:

```json
{
  "stats": {
    "attackDamage": 60,
    "criticalChance": 10,
    "attackSpeed": 1,
    "defense": 80,
    "dexterity": 50,
    "luck": 25,
    "orbAttack": 60,
    "orbDefense": 40,
    "orbCritMultiplier": 1.5
  }
}
```

Use server-side authorization and CSRF protections appropriate to the official authentication design. Do not weaken authentication or expose these mutation endpoints to ordinary production accounts.


## Realtime provider contract — version 7

For immediate synchronization, the game adapter should implement:

```js
async getRealtimeSnapshot() {
  return {
    authenticated: true,
    player: { id: "123", username: "example" },
    capabilities: [
      "read-player-stats",
      "apply-test-modifiers",
      "restore-player-stats",
      "realtime-state"
    ],
    baseline: { /* required stat schema */ },
    stats: { /* current measured values */ },
    applied: { /* complete modifier map */ },
    revision: 42
  };
}

async subscribe(listener) {
  const unsubscribe = gameState.onChange(reason => listener(reason));
  return unsubscribe;
}
```

The bridge converts these callbacks into `HH_TEST_STATE_EVENT` messages.

For an HTTPS API integration, `stateEndpoint` may return the same snapshot shape and `eventsEndpoint` may expose Server-Sent Events containing that JSON. V7 automatically falls back to state polling if push events are not available.
