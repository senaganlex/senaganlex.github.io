"use strict";

/*
  Helmet Heroes game-build bridge (authorized test builds only).

  Required game-owned adapter:
    window.HelmetHeroesTestHost = {
      getAuthenticatedPlayer: async () => ({ authenticated, player }),
      getCapabilities: async () => ["read-player-stats", ...],
      getPlayerStats: async () => ({ attackDamage, criticalChance, ... }),
      setTestModifiers: async (flags) => ({ applied, stats }),       // optional/test-only
      restorePlayerStats: async () => ({ stats })                   // optional/test-only
    }

  This bridge does not discover private game objects itself. The game build
  must explicitly provide the adapter from its authenticated/server-authorized
  state. Passwords, cookies, session IDs, and access tokens must never be
  returned through this bridge.
*/
(function(global){
  const VERSION = 5;
  const MSG = {
    AUTH_PROBE:"HH_AUTH_PROBE", AUTH_STATE:"HH_AUTH_STATE",
    GET_STATS:"HH_TEST_GET_PLAYER_STATS", STATS:"HH_TEST_PLAYER_STATS",
    SET:"HH_TEST_SET_MODIFIERS", APPLIED:"HH_TEST_MODIFIERS_APPLIED",
    RESTORE:"HH_TEST_RESTORE_ALL", RESTORED:"HH_TEST_RESTORED",
    ERROR:"HH_TEST_BRIDGE_ERROR"
  };

  const safePlayer = p => p && typeof p === "object" ? {
    id: p.id == null ? null : String(p.id),
    username: p.username == null ? null : String(p.username)
  } : null;

  function reply(event,type,requestId,payload={}){
    event.source.postMessage({type,version:VERSION,requestId,payload},event.origin);
  }
  function host(){
    const h=global.HelmetHeroesTestHost;
    if(!h) throw new Error("HelmetHeroesTestHost adapter is not installed in this game build");
    return h;
  }
  async function session(h){
    const s=await h.getAuthenticatedPlayer();
    const caps=typeof h.getCapabilities==="function" ? await h.getCapabilities() : [];
    return {authenticated:s?.authenticated===true,player:safePlayer(s?.player),capabilities:Array.isArray(caps)?caps:[]};
  }

  global.addEventListener("message",async event=>{
    const m=event.data;
    if(!m||typeof m!=="object"||m.version!==VERSION) return;
    try{
      const h=host();
      if(m.type===MSG.AUTH_PROBE){
        const s=await session(h);
        reply(event,MSG.AUTH_STATE,m.requestId,{nonce:m.payload?.nonce,...s});
        return;
      }
      const s=await session(h);
      if(!s.authenticated) throw new Error("Authentication required");
      if(m.type===MSG.GET_STATS){
        if(typeof h.getPlayerStats!=="function") throw new Error("Player-stat provider unavailable");
        reply(event,MSG.STATS,m.requestId,{stats:await h.getPlayerStats()}); return;
      }
      if(m.type===MSG.SET){
        if(typeof h.setTestModifiers!=="function") throw new Error("Test modifier capability unavailable");
        reply(event,MSG.APPLIED,m.requestId,await h.setTestModifiers(m.payload?.modifiers||{})); return;
      }
      if(m.type===MSG.RESTORE){
        if(typeof h.restorePlayerStats!=="function") throw new Error("Restore capability unavailable");
        reply(event,MSG.RESTORED,m.requestId,await h.restorePlayerStats()); return;
      }
    }catch(error){
      reply(event,MSG.ERROR,m.requestId,{message:String(error?.message||error)});
    }
  });
})(window);
