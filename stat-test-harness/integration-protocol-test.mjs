import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const relaySource=fs.readFileSync("./official-site-relay.js","utf8");
const gameSource=fs.readFileSync("./game-test-bridge.js","utf8");

const harnessOrigin="https://senaganlex.github.io";
const relayOrigin="https://www.helmet-heroes.com";
const gameOrigin="https://html-classic.itch.zone";

let relayListener=null;
let gameListener=null;
const harnessInbox=[];

const harnessProxy={
  postMessage(data,targetOrigin){
    assert.equal(targetOrigin,harnessOrigin);
    harnessInbox.push(structuredClone(data));
  }
};

const relayProxyForGame={
  postMessage(data,targetOrigin){
    assert.equal(targetOrigin,relayOrigin);
    queueMicrotask(()=>relayListener?.({
      data:structuredClone(data),
      origin:gameOrigin,
      source:gameProxyForRelay
    }));
  }
};

const gameProxyForRelay={
  postMessage(data,targetOrigin){
    assert.equal(targetOrigin,gameOrigin);
    queueMicrotask(()=>gameListener?.({
      data:structuredClone(data),
      origin:relayOrigin,
      source:relayProxyForGame
    }));
  }
};

const frame={
  contentWindow:gameProxyForRelay,
  getAttribute(name){
    return name==="src" ? `${gameOrigin}/html/test/index.html` : null;
  }
};

const relayWindow={
  opener:harnessProxy,
  frames:[gameProxyForRelay],
  HH_RELAY_CONFIG:{
    harnessOrigin,
    allowedGameOrigins:[gameOrigin],
    allowedGameHostSuffixes:[],
    requestTtlMs:15000
  },
  HHProtocol:{
    VERSION:6,
    MSG:{ERROR:"HH_TEST_BRIDGE_ERROR"},
    envelope:(type,requestId,payload={})=>({type,version:6,requestId,payload}),
    validMessage:m=>m&&typeof m==="object"&&m.version===6&&typeof m.type==="string"
  },
  addEventListener(type,cb){if(type==="message")relayListener=cb}
};

const relayContext={
  window:relayWindow,
  document:{
    baseURI:`${relayOrigin}/`,
    querySelectorAll(selector){
      assert.equal(selector,"iframe");
      return [frame];
    }
  },
  URL,
  Date,
  Map,
  Array,
  setTimeout,
  clearTimeout
};
vm.createContext(relayContext);
vm.runInContext(relaySource,relayContext,{filename:"official-site-relay.js"});
assert.equal(typeof relayListener,"function");

let authenticated=true;
let currentStats={
  attackDamage:60,criticalChance:10,attackSpeed:1,defense:80,dexterity:50,
  luck:25,orbAttack:60,orbDefense:40,orbCritMultiplier:1.5
};
let applied={
  attackDamage:false,criticalChance:false,attackSpeed:false,defense:false,dexterity:false,
  luck:false,orbAttack:false,orbDefense:false,orbCritMultiplier:false
};

const gameWindow={
  HelmetHeroesTestHost:{
    allowedParentOrigins:[relayOrigin],
    async getAuthenticatedPlayer(){
      return {authenticated,player:authenticated?{id:"p1",username:"integration_player"}:null};
    },
    async getCapabilities(){
      return authenticated?["read-player-stats","apply-test-modifiers","restore-player-stats"]:[];
    },
    async getPlayerStats(){
      return {...currentStats};
    },
    async setTestModifiers(flags){
      applied={...applied,...flags};
      const base={attackDamage:60,criticalChance:10,attackSpeed:1,defense:80,dexterity:50,luck:25,orbAttack:60,orbDefense:40,orbCritMultiplier:1.5};
      currentStats=Object.fromEntries(Object.entries(base).map(([k,v])=>[k,applied[k]?v*2:v]));
      return {applied:{...applied},stats:{...currentStats}};
    },
    async restorePlayerStats(){
      applied=Object.fromEntries(Object.keys(applied).map(k=>[k,false]));
      currentStats={attackDamage:60,criticalChance:10,attackSpeed:1,defense:80,dexterity:50,luck:25,orbAttack:60,orbDefense:40,orbCritMultiplier:1.5};
      return {stats:{...currentStats}};
    }
  },
  addEventListener(type,cb){if(type==="message")gameListener=cb}
};

const gameContext={
  window:gameWindow,
  Date,
  Array,
  String,
  Error,
  setTimeout,
  clearTimeout
};
vm.createContext(gameContext);
vm.runInContext(gameSource,gameContext,{filename:"game-test-bridge.js"});
assert.equal(typeof gameListener,"function");

function fromHarness(data){
  relayListener({data,origin:harnessOrigin,source:harnessProxy});
}
const wait=()=>new Promise(r=>setTimeout(r,5));
function take(type,requestId){
  const i=harnessInbox.findIndex(m=>m.type===type&&m.requestId===requestId);
  assert.notEqual(i,-1,`Missing ${type} for ${requestId}; inbox=${JSON.stringify(harnessInbox)}`);
  return harnessInbox.splice(i,1)[0];
}

// Authentication
fromHarness({type:"HH_AUTH_PROBE",version:6,requestId:"auth-1",payload:{nonce:"n-1"}});
await wait();
let m=take("HH_AUTH_STATE","auth-1");
assert.equal(m.payload.nonce,"n-1");
assert.equal(m.payload.authenticated,true);
assert.equal(m.payload.player.username,"integration_player");
assert.ok(m.payload.capabilities.includes("read-player-stats"));

// Stat read
fromHarness({type:"HH_TEST_GET_PLAYER_STATS",version:6,requestId:"stats-1",payload:{}});
await wait();
m=take("HH_TEST_PLAYER_STATS","stats-1");
assert.equal(m.payload.stats.attackDamage,60);
assert.equal(m.payload.stats.defense,80);

// Independent mutation
fromHarness({
  type:"HH_TEST_SET_MODIFIERS",version:6,requestId:"apply-1",
  payload:{modifiers:{...applied,attackDamage:true}}
});
await wait();
m=take("HH_TEST_MODIFIERS_APPLIED","apply-1");
assert.equal(m.payload.applied.attackDamage,true);
assert.equal(m.payload.stats.attackDamage,120);
assert.equal(m.payload.stats.defense,80);

// Individual restoration through complete desired map
fromHarness({
  type:"HH_TEST_SET_MODIFIERS",version:6,requestId:"apply-2",
  payload:{modifiers:{...m.payload.applied,attackDamage:false}}
});
await wait();
m=take("HH_TEST_MODIFIERS_APPLIED","apply-2");
assert.equal(m.payload.applied.attackDamage,false);
assert.equal(m.payload.stats.attackDamage,60);

// Restore all
fromHarness({type:"HH_TEST_SET_MODIFIERS",version:6,requestId:"apply-all",payload:{modifiers:Object.fromEntries(Object.keys(applied).map(k=>[k,true]))}});
await wait();
m=take("HH_TEST_MODIFIERS_APPLIED","apply-all");
assert.equal(Object.values(m.payload.applied).filter(Boolean).length,9);
assert.equal(m.payload.stats.defense,160);

fromHarness({type:"HH_TEST_RESTORE_ALL",version:6,requestId:"restore-1",payload:{}});
await wait();
m=take("HH_TEST_RESTORED","restore-1");
assert.equal(m.payload.stats.attackDamage,60);
assert.equal(m.payload.stats.defense,80);

console.log("PASS: V6 actual relay/game-bridge protocol integration");
console.log(" - harness -> official relay -> game bridge");
console.log(" - authenticated player acknowledgement");
console.log(" - player-stat retrieval");
console.log(" - independent modifier application/restoration");
console.log(" - restore-all");
