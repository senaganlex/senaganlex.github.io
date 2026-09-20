# Live player-stat retrieval diagnostics — V5

## Observed failure

The harness can open the official game and the player can successfully sign in, but the GitHub Pages application receives no authenticated-session or player-stat messages.

That means the login is successful **inside the game**, while the external harness remains outside the browser security boundary.

## Why the current live page cannot return stats

The harness origin is:

`https://senaganlex.github.io`

The official/game content is on different origins. The game is also distributed through itch.io/itch.zone. A page on the GitHub origin cannot directly read another origin's:

- game DOM/canvas internals,
- cookies or session identifiers,
- JavaScript runtime objects,
- WebAssembly/Unity state,
- local/session storage.

A successful login therefore cannot be inferred from the fact that the game visibly entered the world.

## Actual fix

The missing component is an explicit bridge on the **official/game side**, not another GitHub Pages polling loop.

V5 includes:

- `official-site-relay.js` — install on an authorized official-site page that owns/embeds the game.
- `game-test-bridge.js` — include in an authorized test game build.

The game build supplies `window.HelmetHeroesTestHost` from its real authenticated/server-authorized state. The bridge serializes only sanitized identity and approved stats.

No password, cookie, access token, refresh token, or raw session ID is sent to the harness.

## Diagnostic codes

- `AUTH-BRIDGE-001` — login window is open, but no supported official/game bridge or CORS session endpoint responded.
- `AUTH-STATE-002` — a supported interface responded and reported unauthenticated.
- `STAT-ACCESS-002` — authenticated player detected, but `read-player-stats` capability is not authorized.
- `STAT-SCHEMA-003` — a stat response arrived but did not contain all required numeric fields.
- `OK` — authenticated player and required stat baseline are loaded.

## Required player-stat schema

```json
{
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
```

The names are the harness contract. The game-side adapter is responsible for mapping the game's authoritative field names to this schema.
