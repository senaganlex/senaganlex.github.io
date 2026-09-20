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
assert.equal(core.validatePlayer({}),false);
assert.deepEqual(core.sanitizePlayer({id:1,username:"u",password:"x",token:"y"}),{id:"1",username:"u"});
assert.ok(protocol.MSG.AUTH_PROBE && protocol.MSG.AUTH_STATE && protocol.MSG.GET_STATS && protocol.MSG.STATS);
assert.equal(protocol.envelope("X","r").version,5);

const cfg=adapter.normalizeConfig({});
assert.equal(cfg.officialUrl,"https://www.helmet-heroes.com/");
assert.throws(()=>adapter.validateOfficialEndpoint("https://evil.example/x","https://www.helmet-heroes.com"));

const baseline={...core.DEFAULTS};
const engine=createBridgeEngine(core,baseline);
for(const def of core.STAT_DEFS){
  const flags=core.emptyFlags(false);flags[def.key]=true;
  let r=engine.setModifiers(flags);
  assert.equal(r.applied[def.key],true);assert.equal(r.stats[def.key],baseline[def.key]*2);
  for(const other of core.STAT_DEFS) if(other.key!==def.key) assert.equal(r.stats[other.key],baseline[other.key]);
  flags[def.key]=false;r=engine.setModifiers(flags);assert.equal(r.stats[def.key],baseline[def.key]);
}
assert.deepEqual(engine.restore().stats,baseline);

const index=fs.readFileSync("./index.html","utf8");
const relay=fs.readFileSync("./official-site-relay.js","utf8");
const gameBridge=fs.readFileSync("./game-test-bridge.js","utf8");
const diag=fs.readFileSync("./LIVE-INTEGRATION-DIAGNOSTICS.md","utf8");
assert.match(index,/AUTH-BRIDGE-001/);
assert.match(index,/Diagnostic code/);
assert.doesNotMatch(index,/document\.cookie|localStorage|sessionStorage/);
assert.doesNotMatch(index,/http:\/\/localhost|127\.0\.0\.1/);
assert.match(relay,/https:\/\/senaganlex\.github\.io/);
assert.doesNotMatch(relay,/document\.cookie|localStorage|sessionStorage/);
assert.match(gameBridge,/HelmetHeroesTestHost/);
assert.match(gameBridge,/getAuthenticatedPlayer/);
assert.match(gameBridge,/getPlayerStats/);
assert.doesNotMatch(gameBridge,/document\.cookie|localStorage|sessionStorage/);
assert.match(diag,/AUTH-BRIDGE-001/);
assert.ok(fs.existsSync("./.nojekyll"));

console.log("PASS: V5 diagnostics and authorized live-integration contract verified");
console.log("PASS: all 9 modifiers remain independent with baseline restoration");
console.log("PASS: no localhost, password, cookie, storage, or token scraping dependency");
