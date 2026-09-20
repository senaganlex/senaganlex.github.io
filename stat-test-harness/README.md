# Helmet Heroes Reborn — Authenticated Stat Test Harness v7

## Fixed in V7

V6 incorrectly continued to show **Waiting for login** after the integration probe had already failed with `AUTH-BRIDGE-001`.

V7 separates these states:

- `WAITING FOR LOGIN / PROVIDER`
- `AUTHENTICATED`
- `NOT AUTHENTICATED`
- `AUTH STATE UNOBSERVABLE`

When the public official site exposes no supported bridge/API, the UI now reports:

- Authentication: `AUTH STATE UNOBSERVABLE`
- Session detection: `INTERFACE UNAVAILABLE`
- Diagnostic: `AUTH-BRIDGE-001`
- Header: `Integration unavailable`
- Sync: `AUTO-RETRY · RETRYING`

Automatic retry continues in the background.

## Realtime synchronization

V7 supports:

1. **Push synchronization** through protocol v7 `SUBSCRIBE` / `STATE_EVENT`.
2. **Automatic polling fallback** through `GET_STATE`.
3. **Secure EventSource/SSE** when an authorized `eventsEndpoint` is configured.
4. **HTTP state polling** for credentialed CORS providers.
5. **Heartbeat health checks** through `PING` / `PONG`.
6. Revision handling to reject older realtime snapshots.

No page refresh or manual **Check Now** action is required for an authorized provider.

## Hosted realtime integration test

1. Open the harness.
2. Click **Open Hosted Realtime Integration Lab**.
3. The harness subscribes before login.
4. Click **Authenticate test player** inside the game lab.
5. The harness should update automatically to authenticated and load stats.
6. Click **Simulate server stat update** inside the game lab.
7. Defense changes immediately in the harness without refreshing.
8. Toggle any test modifier; acknowledgement and measured values synchronize automatically.
9. Restore values and confirm immediate synchronization.

## Certification

```bash
node verify.mjs
node integration-protocol-test.mjs
```

## Live official-site dependency

Realtime synchronization cannot create access to data that the official/game origin does not expose. The public official path still requires an authorized protocol-v7 bridge or documented CORS/state/events API.

The harness never reads passwords, cookies, browser storage, game memory, or undocumented private runtime objects.
