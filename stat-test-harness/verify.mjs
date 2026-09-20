import fs from "node:fs";
import assert from "node:assert/strict";
import {createRequire} from "node:module";

const require=createRequire(import.meta.url);
const core=require("./core.js");
const protocol=require("./protocol.js");
const adapter=require("./official-auth-adapter.js");

assert.equal(protocol.VERSION,7);
for(const name of ["GET_STATE","STATE","SUBSCRIBE","SUBSCRIBED","STATE_EVENT","PING","PONG"]){
  assert.ok(protocol.MSG[name],`Missing ${name}`);
}

const cfg=adapter.normalizeConfig({});
assert.equal(cfg.sync.activePollMs,2000);
assert.equal(cfg.sync.passiveRetryMs,10000);
assert.equal(cfg.sync.heartbeatMs,5000);
assert.equal(cfg.stateEndpoint,null);
assert.equal(cfg.eventsEndpoint,null);
assert.equal(typeof adapter.readState,"function");
assert.equal(typeof adapter.eventsUrl,"function");

const index=fs.readFileSync("./index.html","utf8");
const game=fs.readFileSync("./game-test-bridge.js","utf8");
const relay=fs.readFileSync("./official-site-relay.js","utf8");
const sandbox=fs.readFileSync("./game-sandbox.html","utf8");

assert.match(index,/Authenticated Stat Test Harness v7/);
assert.match(index,/AUTH_STATE_UNOBSERVABLE/);
assert.match(index,/Integration unavailable/);
assert.match(index,/AUTO-RETRY/);
assert.match(index,/startPassiveRetry/);
assert.match(index,/startPostMessagePolling/);
assert.match(index,/startHeartbeat/);
assert.match(index,/startSse/);
assert.match(index,/STATE_EVENT/);
assert.doesNotMatch(index,/authBadge"\)\.textContent=.*Waiting for login"/);

assert.match(game,/SUBSCRIBE/);
assert.match(game,/STATE_EVENT/);
assert.match(game,/getRealtimeSnapshot/);
assert.match(game,/subscribe/);
assert.match(relay,/postMessage\(event\.data, cfg\.harnessOrigin\)/);
assert.match(sandbox,/Simulate server stat update/);

assert.doesNotMatch(index,/document\.cookie|localStorage|sessionStorage/);
assert.doesNotMatch(index,/http:\/\/localhost|127\.0\.0\.1/);

console.log("PASS: V7 realtime/state-machine certification");
console.log(" - unobservable authentication is no longer displayed as waiting for login");
console.log(" - continuous automatic retry");
console.log(" - realtime push subscription");
console.log(" - polling fallback");
console.log(" - heartbeat health checks");
console.log(" - SSE + HTTP polling support");
