import fs from "node:fs";
import assert from "node:assert/strict";
import {createRequire} from "node:module";

const require=createRequire(import.meta.url);
const core=require("./core.js");
const protocol=require("./protocol.js");
const adapter=require("./official-auth-adapter.js");
const {createBridgeEngine}=require("./bridge-engine.js");

assert.equal(core.STAT_DEFS.length,9);
assert.equal(core.validatePlayer({id:"1"}),true);
assert.equal(core.validatePlayer({username:"user"}),true);
assert.equal(core.validatePlayer({}),false);
assert.deepEqual(core.sanitizePlayer({id:123,username:"u",password:"secret",token:"secret"}),{id:"123",username:"u"});

assert.equal(core.hasCapabilities(["read-player-stats"],core.AUTH_CAPABILITIES),true);
assert.equal(core.hasCapabilities([],core.AUTH_CAPABILITIES),false);
assert.equal(core.hasCapabilities(["apply-test-modifiers","restore-player-stats"],core.MUTATION_CAPABILITIES),true);

assert.ok(protocol.MSG.AUTH_PROBE);
assert.ok(protocol.MSG.AUTH_STATE);
assert.ok(protocol.MSG.GET_STATS);
assert.ok(protocol.MSG.STATS);

const cfg=adapter.normalizeConfig({});
assert.equal(cfg.officialUrl,"https://www.helmet-heroes.com/");
assert.equal(adapter.validateOfficialEndpoint("https://www.helmet-heroes.com/api/test","https://www.helmet-heroes.com"),"https://www.helmet-heroes.com/api/test");
assert.throws(()=>adapter.validateOfficialEndpoint("https://evil.example/api","https://www.helmet-heroes.com"));

const baseline={...core.DEFAULTS};
const engine=createBridgeEngine(core,baseline);

for(const def of core.STAT_DEFS){
  const flags=core.emptyFlags(false);
  flags[def.key]=true;
  let result=engine.setModifiers(flags);
  assert.equal(result.applied[def.key],true);
  assert.equal(result.stats[def.key],baseline[def.key]*2);

  for(const other of core.STAT_DEFS){
    if(other.key!==def.key){
      assert.equal(result.applied[other.key],false);
      assert.equal(result.stats[other.key],baseline[other.key]);
    }
  }

  flags[def.key]=false;
  result=engine.setModifiers(flags);
  assert.equal(result.applied[def.key],false);
  assert.equal(result.stats[def.key],baseline[def.key]);
}

let all=engine.setModifiers(core.emptyFlags(true));
let d=core.detect(baseline,all.stats,all.applied);
assert.equal(d.enabledCount,9);
assert.equal(d.signatureMatches,9);

let restored=engine.restore();
assert.deepEqual(restored.stats,baseline);
assert.deepEqual(restored.applied,core.emptyFlags(false));

const index=fs.readFileSync("./index.html","utf8");
const authSandbox=fs.readFileSync("./auth-sandbox.html","utf8");
const integration=fs.readFileSync("./OFFICIAL-INTEGRATION.md","utf8");
const config=fs.readFileSync("./config.js","utf8");

assert.match(index,/Open Official Site &amp; Authenticate/);
assert.match(index,/Check Authenticated Session/);
assert.match(index,/Player-stat detection blocked: authentication has not been confirmed/);
assert.match(index,/SITE \/ BROWSER ONLY/);
assert.match(index,/event\.target\.checked=Boolean\(state\.applied\[key\]\)/);
assert.doesNotMatch(index,/document\.cookie|localStorage|sessionStorage/);
assert.doesNotMatch(index,/password\s*=|accessToken|refreshToken/);
assert.doesNotMatch(index,/http:\/\/localhost|127\.0\.0\.1/);

assert.match(authSandbox,/AUTH_PROBE/);
assert.match(authSandbox,/Authentication required/);
assert.match(authSandbox,/Authenticate test player/);
assert.match(integration,/Do not include passwords, cookies, access tokens/);
assert.match(config,/sessionEndpoint:\s*null/);
assert.match(config,/statsEndpoint:\s*null/);
assert.ok(fs.existsSync("./.nojekyll"));

console.log("PASS: V4 authenticated player-stat workflow verified:");
console.log("  - authentication is required before stat retrieval");
console.log("  - standard-site login remains outside the harness");
console.log("  - player identity is sanitized; secrets are not retained");
console.log("  - official session/API endpoints are fail-closed until explicitly configured");
console.log("  - all 9 modifiers remain independent and acknowledgement-driven");
console.log("  - individual and full restoration return the original baseline");
console.log("  - GitHub Pages deployment has no localhost dependency");
