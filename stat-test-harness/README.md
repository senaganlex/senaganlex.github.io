# Helmet Heroes Reborn — Authenticated Stat Test Harness v6

V6 is the production-completion build for the authorized test-harness architecture.

## Run certification

```bash
node verify.mjs
node integration-protocol-test.mjs
```

## Hosted full integration test

Deploy the repository root to GitHub Pages, then:

1. Open the harness.
2. Click **Open Hosted Full Integration Lab**.
3. In the game frame, click **Authenticate test player**.
4. Click **Check Authenticated Session** in the harness.
5. Confirm:
   - Authentication = AUTHENTICATED
   - Player-stat access = AUTHORIZED
   - Mutation access = AUTHORIZED
   - Baseline snapshot = LOADED
   - Diagnostic code = OK
6. Toggle each modifier and confirm only that statistic doubles after acknowledgement.
7. Disable it and confirm its original value is restored.
8. Use **Restore original values** and confirm all nine return to baseline.

## Live official integration

See:

- `OFFICIAL-INTEGRATION.md`
- `PRODUCTION-COMPLETION-STATUS.md`

The GitHub Pages application is complete. Actual live official player-stat access additionally requires the official/game origin to deploy an authorized provider.
