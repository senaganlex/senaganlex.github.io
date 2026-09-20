"use strict";
/*
  Authorized game-build bridge — protocol v7.

  Required game-owned adapter:
    window.HelmetHeroesTestHost

  Read path:
    getAuthenticatedPlayer()
    getCapabilities()
    getPlayerStats()

  Optional/full realtime path:
    getRealtimeSnapshot()
    subscribe(listener) -> unsubscribe()

  Authorized test-mutation path:
    setTestModifiers(flags)
    restorePlayerStats()

  This bridge does not discover private game objects and never returns
  passwords, cookies, session identifiers, or authentication tokens.
*/
(function (global) {
  const VERSION = 7;

  const MSG = {
    AUTH_PROBE:"HH_AUTH_PROBE",
    AUTH_STATE:"HH_AUTH_STATE",
    GET_STATS:"HH_TEST_GET_PLAYER_STATS",
    STATS:"HH_TEST_PLAYER_STATS",
    GET_STATE:"HH_TEST_GET_STATE",
    STATE:"HH_TEST_STATE",
    SUBSCRIBE:"HH_TEST_SUBSCRIBE",
    SUBSCRIBED:"HH_TEST_SUBSCRIBED",
    STATE_EVENT:"HH_TEST_STATE_EVENT",
    SET:"HH_TEST_SET_MODIFIERS",
    APPLIED:"HH_TEST_MODIFIERS_APPLIED",
    RESTORE:"HH_TEST_RESTORE_ALL",
    RESTORED:"HH_TEST_RESTORED",
    PING:"HH_TEST_PING",
    PONG:"HH_TEST_PONG",
    ERROR:"HH_TEST_BRIDGE_ERROR",
    BYE:"HH_TEST_BRIDGE_BYE"
  };

  const defaultAllowedOrigins = [
    "https://www.helmet-heroes.com",
    "https://helmet-heroes.com",
    "https://senaganlex.github.io"
  ];

  const subscriptions = new Map();

  function host() {
    const h = global.HelmetHeroesTestHost;
    if (!h) throw new Error("HelmetHeroesTestHost adapter is not installed in this game build");
    return h;
  }

  function allowedOrigin(eventOrigin, h) {
    const configured = Array.isArray(h.allowedParentOrigins) ? h.allowedParentOrigins : [];
    return [...defaultAllowedOrigins, ...configured].includes(eventOrigin);
  }

  function safePlayer(player) {
    if (!player || typeof player !== "object") return null;
    return {
      id: player.id == null ? null : String(player.id),
      username: player.username == null ? null : String(player.username)
    };
  }

  function reply(event, type, requestId, payload = {}) {
    event.source.postMessage({ type, version: VERSION, requestId, payload }, event.origin);
  }

  function push(subscription, payload) {
    subscription.source.postMessage({
      type: MSG.STATE_EVENT,
      version: VERSION,
      requestId: null,
      payload
    }, subscription.origin);
  }

  async function sessionSnapshot(h) {
    if (typeof h.getAuthenticatedPlayer !== "function") {
      throw new Error("Authenticated-player provider unavailable");
    }

    const session = await h.getAuthenticatedPlayer();
    const capabilities = typeof h.getCapabilities === "function"
      ? await h.getCapabilities()
      : [];

    return {
      authenticated: session?.authenticated === true,
      player: safePlayer(session?.player),
      capabilities: Array.isArray(capabilities) ? capabilities : []
    };
  }

  async function realtimeSnapshot(h) {
    if (typeof h.getRealtimeSnapshot === "function") {
      const snapshot = await h.getRealtimeSnapshot();
      return {
        authenticated: snapshot?.authenticated === true,
        player: safePlayer(snapshot?.player),
        capabilities: Array.isArray(snapshot?.capabilities) ? snapshot.capabilities : [],
        baseline: snapshot?.baseline || null,
        stats: snapshot?.stats || null,
        applied: snapshot?.applied || null,
        revision: Number.isFinite(Number(snapshot?.revision)) ? Number(snapshot.revision) : null
      };
    }

    const session = await sessionSnapshot(h);
    const baseline = session.authenticated && typeof h.getPlayerStats === "function"
      ? await h.getPlayerStats()
      : null;

    return {
      ...session,
      baseline,
      stats: baseline,
      applied: null,
      revision: null
    };
  }

  function removeSubscription(source) {
    const old = subscriptions.get(source);
    if (!old) return;
    try { old.unsubscribe?.(); } catch {}
    subscriptions.delete(source);
  }

  global.addEventListener("message", async event => {
    const message = event.data;
    if (!message || typeof message !== "object" || message.version !== VERSION) return;

    let h;
    try {
      h = host();
      if (!allowedOrigin(event.origin, h)) return;

      if (message.type === MSG.PING) {
        reply(event, MSG.PONG, message.requestId, { ready: true, timestamp: Date.now() });
        return;
      }

      if (message.type === MSG.SUBSCRIBE) {
        removeSubscription(event.source);

        let unsubscribe = null;
        let pushSupported = false;

        if (typeof h.subscribe === "function") {
          const source = event.source;
          const origin = event.origin;
          const listener = async reason => {
            try {
              const snapshot = await realtimeSnapshot(h);
              push({ source, origin }, { reason: reason || "provider-update", ...snapshot, timestamp: Date.now() });
            } catch {}
          };

          const maybeUnsubscribe = await h.subscribe(listener);
          if (typeof maybeUnsubscribe === "function") unsubscribe = maybeUnsubscribe;
          pushSupported = true;
          subscriptions.set(event.source, { source:event.source, origin:event.origin, unsubscribe });
        }

        reply(event, MSG.SUBSCRIBED, message.requestId, {
          push: pushSupported,
          pollRecommended: !pushSupported
        });

        if (pushSupported) {
          const snapshot = await realtimeSnapshot(h);
          push({ source:event.source, origin:event.origin }, {
            reason:"subscription-initial-state",
            ...snapshot,
            timestamp:Date.now()
          });
        }
        return;
      }

      if (message.type === MSG.AUTH_PROBE) {
        const s = await sessionSnapshot(h);
        reply(event, MSG.AUTH_STATE, message.requestId, {
          nonce: message.payload?.nonce,
          ...s
        });
        return;
      }

      if (message.type === MSG.GET_STATE) {
        reply(event, MSG.STATE, message.requestId, await realtimeSnapshot(h));
        return;
      }

      const session = await sessionSnapshot(h);
      if (!session.authenticated) throw new Error("Authentication required");

      if (message.type === MSG.GET_STATS) {
        if (typeof h.getPlayerStats !== "function") throw new Error("Player-stat provider unavailable");
        reply(event, MSG.STATS, message.requestId, { stats: await h.getPlayerStats() });
        return;
      }

      if (message.type === MSG.SET) {
        if (typeof h.setTestModifiers !== "function") throw new Error("Test modifier capability unavailable");
        reply(event, MSG.APPLIED, message.requestId, await h.setTestModifiers(message.payload?.modifiers || {}));
        return;
      }

      if (message.type === MSG.RESTORE) {
        if (typeof h.restorePlayerStats !== "function") throw new Error("Restore capability unavailable");
        reply(event, MSG.RESTORED, message.requestId, await h.restorePlayerStats());
        return;
      }

      if (message.type === MSG.BYE) {
        removeSubscription(event.source);
      }
    } catch (error) {
      reply(event, MSG.ERROR, message.requestId, {
        code: "GAME_BRIDGE_ERROR",
        message: String(error?.message || error)
      });
    }
  });
})(window);
