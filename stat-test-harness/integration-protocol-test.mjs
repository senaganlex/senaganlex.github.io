import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const relaySource=fs.readFileSync("./official-site-relay.js","utf8");
const gameSource=fs.readFileSync("./game-test-bridge.js","utf8");

const harnessOrigin="https://senaganlex.github.io";
const relayOrigin="https://www.helmet-heroes.com";
const gameOrigin="https://html-classic.itch.zone";

let relayListener=null,gameListener=null;
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
    queueMicrotask(()=>relayListener?.({data:structuredClone(data),origin:gameOrigin,source:gameProxyForRelay}));
  }
};

const gameProxyForRelay={
  postMessage(data,targetOrigin){
    assert.equal(targetOrigin,gameOrigin);
    queueMicrotask(()=>gameListener?.({data:structuredClone(data),origin:relayOrigin,source:relayProxyForGame}));
  }
};

const frame={
  contentWindow:gameProxyForRelay,
  getAttribute(name){return name==="src"?`${gameOrigin}/html/test/index.html`:null}
};

const relayWindow={
  opener:harnessProxy,
  HH_RELAY_CONFIG:{harnessOrigin,allowedGameOrigins:[gameOrigin],allowedGameHostSuffixes:[],requestTtlMs:15000},
  HHProtocol:{
    VERSION:7,
    MSG:{ERROR:"HH_TEST_BRIDGE_ERROR"},
    envelope:(type,requestId,payload={})=>({type,version:7,requestId,payload}),
    validMessage:m=>m&&typeof m==="object"&&m.version===7&&typeof m.type==="string"
  },
  addEventListener(type,cb){if(type==="message")relayListener=cb}
};

const relayContext={
  window:relayWindow,
  document:{baseURI:`${relayOrigin}/`,querySelectorAll(){return [frame]}},
  URL,Date,Map,Array,setTimeout,clearTimeout
};
vm.createContext(relayContext);
vm.runInContext(relaySource,relayContext);

let authenticated=false,revision=0;
const player={id:"p1",username:"integration_player"};
let baseline={attackDamage:60,criticalChance:10,attackSpeed:1,defense:80,dexterity:50,luck:25,orbAttack:60,orbDefense:40,orbCritMultiplier:1.5};
let applied=Object.fromEntries(Object.keys(baseline).map(k=>[k,false]));
let measured={...baseline};
const listeners=new Set();

function recalc(){measured=Object.fromEntries(Object.entries(baseline).map(([k,v])=>[k,applied[k]?v*2:v]))}
function emit(reason){revision++;for(const listener of listeners)listener(reason)}

const gameWindow={
  HelmetHeroesTestHost:{
    allowedParentOrigins:[relayOrigin],
    async getAuthenticatedPlayer(){return {authenticated,player:authenticated?player:null}},
    async getCapabilities(){return authenticated?["read-player-stats","apply-test-modifiers","restore-player-stats","realtime-state"]:["realtime-state"]},
    async getPlayerStats(){return {...baseline}},
    async getRealtimeSnapshot(){
      return {authenticated,player:authenticated?player:null,capabilities:await this.getCapabilities(),baseline:authenticated?{...baseline}:null,stats:authenticated?{...measured}:null,applied:authenticated?{...applied}:null,revision};
    },
    async subscribe(listener){listeners.add(listener);return ()=>listeners.delete(listener)},
    async setTestModifiers(flags){applied={...flags};recalc();emit("modifier-change");return {applied:{...applied},stats:{...measured},baseline:{...baseline},revision}},
    async restorePlayerStats(){applied=Object.fromEntries(Object.keys(applied).map(k=>[k,false]));recalc();emit("restore");return {stats:{...measured},baseline:{...baseline},revision}}
  },
  addEventListener(type,cb){if(type==="message")gameListener=cb}
};

const gameContext={window:gameWindow,Date,Array,String,Error,Map,setTimeout,clearTimeout};
vm.createContext(gameContext);
vm.runInContext(gameSource,gameContext);

function fromHarness(data){relayListener({data,origin:harnessOrigin,source:harnessProxy})}
const wait=()=>new Promise(r=>setTimeout(r,8));
function take(type,requestId=null){
  const i=harnessInbox.findIndex(m=>m.type===type&&(requestId===null||m.requestId===requestId));
  assert.notEqual(i,-1,`Missing ${type}; inbox=${JSON.stringify(harnessInbox)}`);
  return harnessInbox.splice(i,1)[0];
}

// Subscribe before login: must acknowledge and push initial unauthenticated state.
fromHarness({type:"HH_TEST_SUBSCRIBE",version:7,requestId:"sub-1",payload:{}});
await wait();
let m=take("HH_TEST_SUBSCRIBED","sub-1");
assert.equal(m.payload.push,true);
m=take("HH_TEST_STATE_EVENT");
assert.equal(m.payload.authenticated,false);

// Login should push immediately without a new probe.
authenticated=true;
emit("authentication-changed");
await wait();
m=take("HH_TEST_STATE_EVENT");
assert.equal(m.payload.authenticated,true);
assert.equal(m.payload.player.username,"integration_player");
assert.equal(m.payload.stats.defense,80);

// External server stat update should push automatically.
baseline={...baseline,defense:85};recalc();emit("server-stat-update");
await wait();
m=take("HH_TEST_STATE_EVENT");
assert.equal(m.payload.baseline.defense,85);
assert.equal(m.payload.stats.defense,85);

// Modifier still works and emits state.
fromHarness({type:"HH_TEST_SET_MODIFIERS",version:7,requestId:"apply-1",payload:{modifiers:{...applied,defense:true}}});
await wait();
m=take("HH_TEST_MODIFIERS_APPLIED","apply-1");
assert.equal(m.payload.stats.defense,170);

// A realtime state event is also pushed for modifier change.
m=take("HH_TEST_STATE_EVENT");
assert.equal(m.payload.stats.defense,170);

// Restore and confirm pushed synchronization.
fromHarness({type:"HH_TEST_RESTORE_ALL",version:7,requestId:"restore-1",payload:{}});
await wait();
m=take("HH_TEST_RESTORED","restore-1");
assert.equal(m.payload.stats.defense,85);
m=take("HH_TEST_STATE_EVENT");
assert.equal(m.payload.stats.defense,85);

console.log("PASS: V7 realtime relay/game integration");
console.log(" - subscription established before login");
console.log(" - login change pushed automatically");
console.log(" - external server stat update pushed automatically");
console.log(" - modifier and restoration updates synchronized immediately");
