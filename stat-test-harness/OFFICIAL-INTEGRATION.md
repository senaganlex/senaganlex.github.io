# Official Helmet Heroes Authentication / Player-Stat Integration Contract

This document describes what the official site must expose for the GitHub Pages harness to detect an authenticated player without handling credentials.

## Browser security boundary

The harness runs at:

`https://senaganlex.github.io/stat-test-harness/`

The official site runs at:

`https://www.helmet-heroes.com/`

They are different origins. Standard browser security prevents the GitHub Pages application from directly reading:

- Helmet Heroes cookies
- session tokens
- password fields
- DOM state
- local/session storage
- private JavaScript objects
- game memory

The integration must therefore be explicitly supported by the official site.

## Option A — postMessage bridge

After the user signs in through the normal Helmet Heroes login, an official page can respond to messages from the allowed harness origin.

### Authentication probe

Harness → official page:

```json
{
  "type": "HH_AUTH_PROBE",
  "version": 4,
  "requestId": "auth-...",
  "payload": {
    "nonce": "nonce-...",
    "request": ["authenticated-player", "capabilities"]
  }
}
```

Official page → harness:

```json
{
  "type": "HH_AUTH_STATE",
  "version": 4,
  "requestId": "auth-...",
  "payload": {
    "nonce": "nonce-...",
    "authenticated": true,
    "player": {
      "id": "server-side-player-id",
      "username": "player_name"
    },
    "capabilities": [
      "read-player-stats",
      "apply-test-modifiers",
      "restore-player-stats"
    ]
  }
}
```

Do not include passwords, cookies, access tokens, refresh tokens, or session IDs in this payload.

The official page must validate `event.origin === "https://senaganlex.github.io"` and should restrict the integration to explicitly authorized test accounts/environments.

## Option B — credentialed CORS API

If Helmet Heroes provides documented HTTPS endpoints, set them in `config.js`.

Example contract:

`GET /api/test-harness/session`

```json
{
  "authenticated": true,
  "player": {
    "id": "server-side-player-id",
    "username": "player_name"
  },
  "capabilities": ["read-player-stats"]
}
```

`GET /api/test-harness/player-stats`

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

Server requirements:

- HTTPS only.
- Exact `Access-Control-Allow-Origin: https://senaganlex.github.io`.
- `Access-Control-Allow-Credentials: true` if cookie authentication is used.
- Appropriate `SameSite` / `Secure` cookie settings.
- No account secrets in JSON responses.
- Server-side authorization for test-only mutation capabilities.
- Do not enable stat-mutation endpoints for ordinary production accounts.

## Required behavior

The harness does not request player stats until an authenticated session is positively confirmed.

If the site does not expose either supported interface, the harness reports that authentication cannot be observed from the GitHub Pages origin. It does not attempt to bypass browser isolation.
