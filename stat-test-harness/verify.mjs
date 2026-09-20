import fs from "node:fs";
import assert from "node:assert/strict";
import {createRequire} from "node:module";

const require=createRequire(import.meta.url);
const core=require("./core.js");
const protocol=require("./protocol.js");
const adapter=require("./official-auth-adapter.js");
const {createBridgeEngine}=require("./bridge-engine.js");

assert.equal(protocol.VERSION,6);
assert.equal(core.STAT_DEFS.length,9);

const baseline={...core.DEFAULTS};
const engine=createBridgeEngine(core,baseline);

for(const def of core.STAT_DEFS){
  const flags=core.emptyFlags(false);
  flags[def.key]=true;
  let r=engine.setModifiers(flags);

  assert.equal(r.applied[def.key],true,`${def.key}: expected applied`);
  assert.equal(r.stats[def.key],baseline[def.key]*2,`${def.key}: expected x2`);

  for(const other of core.STAT_DEFS){
    if(other.key!==def.key){
      assert.equal(r.applied[other.key],false,`${def.key}: unexpectedly enabled ${other.key}`);
      assert.equal(r.stats[other.key],baseline[other.key],`${def.key}: changed unrelated ${other.key}`);
    }
  }

  flags[def.key]=false;
  r=engine.setModifiers(flags);
  assert.equal(r.applied[def.key],false,`${def.key}: expected disabled`);
  assert.equal(r.stats[def.key],baseline[def.key],`${def.key}: baseline not restored`);
}

let r=engine.setModifiers(core.emptyFlags(true));
let d=core.detect(baseline,r.stats,r.applied);
assert.equal(d.enabledCount,9);
assert.equal(d.signatureMatches,9);

r=engine.restore();
assert.deepEqual(r.stats,baseline);
assert.deepEqual(r.applied,core.emptyFlags(false));

assert.equal(core.validatePlayer({id:"1"}),true);
assert.equal(core.validatePlayer({username:"u"}),true);
assert.equal(core.validatePlayer({}),false);
assert.deepEqual(
  core.sanitizePlayer({id:123,username:"u",password:"secret",accessToken:"secret"}),
  {id:"123",username:"u"}
);

const cfg=adapter.normalizeConfig({});
assert.equal(cfg.officialUrl,"https://www.helmet-heroes.com/");
assert.equal(cfg.requestTimeoutMs,6000);
assert.equal(cfg.probe.maxAttempts,24);
assert.equal(cfg.setModifiersEndpoint,null);
assert.equal(cfg.restoreEndpoint,null);
assert.equal(typeof adapter.setModifiers,"function");
assert.equal(typeof adapter.restore,"function");
assert.equal(adapter.validateOfficialEndpoint(
  "https://www.helmet-heroes.com/api/test",
  "https://www.helmet-heroes.com"
),"https://www.helmet-heroes.com/api/test");
assert.throws(()=>adapter.validateOfficialEndpoint(
  "https://example.com/api/test",
  "https://www.helmet-heroes.com"
));

const index=fs.readFileSync("./index.html","utf8");
const relay=fs.readFileSync("./official-site-relay.js","utf8");
const game=fs.readFileSync("./game-test-bridge.js","utf8");
const relaySandbox=fs.readFileSync("./relay-sandbox.html","utf8");
const gameSandbox=fs.readFileSync("./game-sandbox.html","utf8");
const docs=fs.readFileSync("./OFFICIAL-INTEGRATION.md","utf8");

assert.match(index,/Authenticated Stat Test Harness v6/);
assert.match(index,/STAT-TIMEOUT-004/);
assert.match(index,/MOD-ACK-005/);
assert.match(index,/RESTORE-ACK-006/);
assert.match(index,/MOD-HTTP-020/);
assert.match(index,/RESTORE-HTTP-021/);
assert.match(index,/state\.transport==="http"/);
assert.match(index,/AUTHORIZED/);
assert.doesNotMatch(index,/document\.cookie|localStorage|sessionStorage/);
assert.doesNotMatch(index,/http:\/\/localhost|127\.0\.0\.1/);

assert.match(relay,/querySelectorAll\("iframe"\)/);
assert.match(relay,/RELAY_NO_GAME_FRAME/);
assert.match(relay,/postMessage\(event\.data, frame\.origin\)/);
assert.match(game,/HelmetHeroesTestHost/);
assert.match(game,/allowedParentOrigins/);
assert.match(relaySandbox,/official-site-relay\.js/);
assert.match(gameSandbox,/game-test-bridge\.js/);
assert.match(docs,/version 6/i);

for(const f of [
  ".nojekyll","index.html","core.js","protocol.js","bridge-engine.js",
  "official-auth-adapter.js","official-site-relay.js","game-test-bridge.js",
  "relay-sandbox.html","game-sandbox.html"
]) assert.ok(fs.existsSync(f),`missing ${f}`);

console.log("PASS: V6 static/deterministic certification");
console.log(" - 9 independent modifiers");
console.log(" - individual restoration + restore-all");
console.log(" - authentication/stat capability separation");
console.log(" - request timeouts + stale acknowledgement protection");
console.log(" - hardened official relay + game adapter contract");
console.log(" - GitHub Pages relative deployment; no localhost runtime dependency");
