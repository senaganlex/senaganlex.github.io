import fs from "node:fs";
import assert from "node:assert/strict";
import {createRequire} from "node:module";

const require=createRequire(import.meta.url);
const core=require("./core.js");
const protocol=require("./protocol.js");
const {createBridgeEngine}=require("./bridge-engine.js");

assert.equal(core.STAT_DEFS.length,9,"Expected nine modifiers");
assert.equal(core.hasRequiredCapabilities(core.REQUIRED_CAPABILITIES),true);
assert.equal(core.hasRequiredCapabilities(["telemetry"]),false);

const baseline={...core.DEFAULTS};
const engine=createBridgeEngine(core,baseline);

assert.deepEqual(engine.getOriginalStats(),baseline);
assert.deepEqual(engine.getStats(),baseline);
assert.deepEqual(engine.getApplied(),core.emptyFlags(false));

for(const def of core.STAT_DEFS){
  const flags=core.emptyFlags(false);
  flags[def.key]=true;

  let result=engine.setModifiers(flags);
  assert.equal(result.applied[def.key],true,`${def.key} acknowledgement must be ON`);
  assert.equal(result.stats[def.key],baseline[def.key]*2,`${def.key} must double`);

  for(const other of core.STAT_DEFS){
    if(other.key!==def.key){
      assert.equal(result.applied[other.key],false,`${def.key} must not enable ${other.key}`);
      assert.equal(result.stats[other.key],baseline[other.key],`${def.key} must not alter ${other.key}`);
    }
  }

  flags[def.key]=false;
  result=engine.setModifiers(flags);
  assert.equal(result.applied[def.key],false,`${def.key} acknowledgement must be OFF`);
  assert.equal(result.stats[def.key],baseline[def.key],`${def.key} must restore original value`);
}

let all=core.emptyFlags(true);
let result=engine.setModifiers(all);
let detection=core.detect(baseline,result.stats,result.applied);
assert.equal(detection.enabledCount,9);
assert.equal(detection.mismatchCount,9);
assert.equal(detection.signatureMatches,9);
assert.equal(detection.anomaly,true);

result=engine.restore();
assert.deepEqual(result.applied,core.emptyFlags(false));
assert.deepEqual(result.stats,baseline);
detection=core.detect(baseline,result.stats,result.applied);
assert.equal(detection.enabledCount,0);
assert.equal(detection.mismatchCount,0);
assert.equal(detection.signatureMatches,0);
assert.equal(detection.anomaly,false);

for(const name of ["HELLO","READY","GET_STATS","STATS","SET","APPLIED","RESTORE","RESTORED","ERROR"]){
  assert.ok(protocol.MSG[name],`Missing protocol message ${name}`);
}

const index=fs.readFileSync("./index.html","utf8");
const sandbox=fs.readFileSync("./sandbox.html","utf8");
const fallback=fs.readFileSync("./404.html","utf8");

assert.match(index,/new URL\("\.\/",document\.baseURI\)/);
assert.match(index,/\.\/sandbox\.html/);
assert.match(index,/\.\/core\.js/);
assert.match(index,/\.\/protocol\.js/);
assert.match(index,/\.\/bridge-engine\.js/);
assert.doesNotMatch(index,/http:\/\/localhost|127\.0\.0\.1/);
assert.match(index,/Player-stat access/);
assert.match(index,/event\.target\.checked=Boolean\(state\.applied\[key\]\)/);

assert.match(sandbox,/HHBridgeEngine/);
assert.match(sandbox,/read-player-stats/);
assert.match(sandbox,/apply-test-modifiers/);
assert.match(sandbox,/restore-player-stats/);
assert.match(fallback,/\/stat-test-harness\//);
assert.ok(fs.existsSync("./.nojekyll"));

console.log("PASS: V3 complete test flow verified:");
console.log("  - explicit handshake/capability contract");
console.log("  - original player-stat snapshot");
console.log("  - all 9 modifiers independently applied");
console.log("  - acknowledged ON/OFF state");
console.log("  - exact x2 measured values");
console.log("  - individual restoration");
console.log("  - restore-all baseline recovery");
console.log("  - GitHub Pages relative paths / no localhost dependency");
