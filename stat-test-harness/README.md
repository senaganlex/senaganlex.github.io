# Helmet Heroes Reborn — Stat Anomaly Test Harness

This project is a standalone defensive testing simulator.

It intentionally does **not**:
- inject JavaScript into the live itch.io game iframe,
- patch or inspect game memory,
- alter network packets or WebSocket traffic,
- modify a real player account,
- bypass server-side checks.

## Included modifiers

Each modifier is independently toggleable:

- Attack / Damage ×2
- Critical Chance ×2
- Attack Speed ×2
- Defense ×2
- Dexterity ×2
- Luck ×2
- Orb Attack ×2
- Orb Defense ×2
- Orb Critical Multiplier ×2

When a modifier is disabled, the effective value returns immediately to the stored baseline.

## Defensive testing features

- Per-stat baseline editor
- Per-stat ON/OFF indicator
- Effective-value display
- Enable-all / disable-all controls
- Random anomaly scenario generator
- Event log
- Baseline mismatch detector
- Exact ×2 signature detector
- Suggested defensive action indicator

## Run

Open `index.html` directly in a browser.

For a local web server:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

## Integration pattern for an authorized private test build

If you control a private development build, connect the harness to a test-only adapter exposed by that build. Keep the adapter server-authorized and disabled in production.

Recommended contract:

```js
const testAdapter = {
  async getBaselineStats() {},
  async applySyntheticStats(stats) {},
  async restoreBaseline() {},
  async subscribeToValidationEvents(callback) {}
};
```

Do not point the adapter at public production accounts or use it to bypass authoritative server validation.
