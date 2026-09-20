"use strict";
/*
  Authorized game-build bridge.

  The game build must provide:
    window.HelmetHeroesTestHost = {
      getAuthenticatedPlayer: async () => ({authenticated, player}),
      getCapabilities: async () => ["read-player-stats", ...],
      getPlayerStats: async () => ({...}),
      setTestModifiers: async flags => ({applied, stats}),   // test-only optional
      restorePlayerStats: async () => ({stats})              // test-only optional
    }

  No passwords, cookies, session IDs, access tokens, or refresh tokens are
  returned through this bridge.
*/
(function (global) {
  const VERSION = 6;
  const MSG = {
    AUTH_PROBE:"HH_AUTH_PROBE", AUTH_STATE:"HH_AUTH_STATE",
    GET_STATS:"HH_TEST_GET_PLAYER_STATS", STATS:"HH_TEST_PLAYER_STATS",
    SET:"HH_TEST_SET_MODIFIERS", APPLIED:"HH_TEST_MODIFIERS_APPLIED",
    RESTORE:"HH_TEST_RESTORE_ALL", RESTORED:"HH_TEST_RESTORED",
    PING:"HH_TEST_PING", PONG:"HH_TEST_PONG",
    ERROR:"HH_TEST_BRIDGE_ERROR", BYE:"HH_TEST_BRIDGE_BYE"
  };

  const defaultAllowedOrigins = [
    "https://www.helmet-heroes.com",
    "https://helmet-heroes.com",
    "https://senaganlex.github.io"
  ];

  const safePlayer = p => p && typeof p === "object" ? {
    id: p.id == null ? null : String(p.id),
    username: p.username == null ? null : String(p.username)
  } : null;

  function host() {
    const h = global.HelmetHeroesTestHost;
    if (!h) throw new Error("HelmetHeroesTestHost adapter is not installed in this game build");
    return h;
  }

  function allowedOrigin(eventOrigin, h) {
    const configured = Array.isArray(h.allowedParentOrigins) ? h.allowedParentOrigins : [];
    return [...defaultAllowedOrigins, ...configured].includes(eventOrigin);
  }

  function reply(event, type, requestId, payload = {}) {
    event.source.postMessage({ type, version: VERSION, requestId, payload }, event.origin);
  }

  async function session(h) {
    if (typeof h.getAuthenticatedPlayer !== "function") {
      throw new Error("Authenticated-player provider unavailable");
    }
    const s = await h.getAuthenticatedPlayer();
    const caps = typeof h.getCapabilities === "function" ? await h.getCapabilities() : [];
    return {
      authenticated: s?.authenticated === true,
      player: safePlayer(s?.player),
      capabilities: Array.isArray(caps) ? caps : []
    };
  }

  global.addEventListener("message", async event => {
    const m = event.data;
    if (!m || typeof m !== "object" || m.version !== VERSION) return;

    let h;
    try {
      h = host();
      if (!allowedOrigin(event.origin, h)) return;

      if (m.type === MSG.PING) {
        reply(event, MSG.PONG, m.requestId, { ready: true });
        return;
      }

      if (m.type === MSG.AUTH_PROBE) {
        const s = await session(h);
        reply(event, MSG.AUTH_STATE, m.requestId, { nonce: m.payload?.nonce, ...s });
        return;
      }

      const s = await session(h);
      if (!s.authenticated) throw new Error("Authentication required");

      if (m.type === MSG.GET_STATS) {
        if (typeof h.getPlayerStats !== "function") throw new Error("Player-stat provider unavailable");
        reply(event, MSG.STATS, m.requestId, { stats: await h.getPlayerStats() });
        return;
      }

      if (m.type === MSG.SET) {
        if (typeof h.setTestModifiers !== "function") throw new Error("Test modifier capability unavailable");
        reply(event, MSG.APPLIED, m.requestId, await h.setTestModifiers(m.payload?.modifiers || {}));
        return;
      }

      if (m.type === MSG.RESTORE) {
        if (typeof h.restorePlayerStats !== "function") throw new Error("Restore capability unavailable");
        reply(event, MSG.RESTORED, m.requestId, await h.restorePlayerStats());
        return;
      }
    } catch (error) {
      reply(event, MSG.ERROR, m.requestId, {
        code: "GAME_BRIDGE_ERROR",
        message: String(error?.message || error)
      });
    }
  });
})(window);
