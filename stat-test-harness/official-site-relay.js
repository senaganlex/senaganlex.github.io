"use strict";

/*
  Helmet Heroes official-site relay (authorized deployment only).

  Deploy this script on the official page that embeds/launches the game.
  It never reads passwords, cookies, storage, or game memory. It only relays
  the explicit HH v5 bridge protocol between the GitHub Pages harness and an
  authorized game-build bridge.
*/
(function(global){
  const HARNESS_ORIGIN = "https://senaganlex.github.io";
  const VERSION = 5;
  const ALLOWED_GAME_ORIGIN_SUFFIXES = [".itch.zone", ".itch.io"];
  const pendingHarnessRequests = new Map();

  function allowedGameOrigin(origin){
    try{
      const host = new URL(origin).hostname;
      return ALLOWED_GAME_ORIGIN_SUFFIXES.some(s => host === s.slice(1) || host.endsWith(s));
    }catch{return false}
  }

  function isProtocolMessage(data){
    return data && typeof data === "object" && data.version === VERSION && typeof data.type === "string";
  }

  global.addEventListener("message", event => {
    if(!isProtocolMessage(event.data)) return;

    // Harness -> official page -> game iframe(s)
    if(event.origin === HARNESS_ORIGIN && event.source === global.opener){
      const id = event.data.requestId;
      if(id) pendingHarnessRequests.set(id, event.source);
      for(const frame of Array.from(global.frames)){
        try{ frame.postMessage(event.data, "*"); }catch{}
      }
      return;
    }

    // Authorized game iframe -> official page -> harness.
    if(allowedGameOrigin(event.origin) && global.opener){
      const id = event.data.requestId;
      if(id && !pendingHarnessRequests.has(id) && event.data.type !== "HH_AUTH_STATE") return;
      global.opener.postMessage(event.data, HARNESS_ORIGIN);
      if(id) pendingHarnessRequests.delete(id);
    }
  });
})(window);
