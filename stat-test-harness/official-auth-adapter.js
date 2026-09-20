"use strict";
(function (global) {
  const DEFAULT_CONFIG = Object.freeze({
    officialUrl: "https://www.helmet-heroes.com/",
    sessionEndpoint: null,
    statsEndpoint: null,
    stateEndpoint: null,
    eventsEndpoint: null,
    setModifiersEndpoint: null,
    restoreEndpoint: null,
    requestTimeoutMs: 6000,
    sync: {
      activePollMs: 2000,
      passiveRetryMs: 10000,
      heartbeatMs: 5000,
      staleAfterMs: 15000
    }
  });

  function normalizeConfig(input = {}) {
    return {
      ...DEFAULT_CONFIG,
      ...input,
      sync: { ...DEFAULT_CONFIG.sync, ...(input.sync || {}) }
    };
  }

  function validateOfficialEndpoint(endpoint, officialOrigin) {
    if (!endpoint) return null;
    const u = new URL(endpoint);
    if (u.protocol !== "https:" || u.origin !== officialOrigin) {
      throw new Error("Official endpoint must use HTTPS on the configured official origin");
    }
    return u.href;
  }

  async function fetchJson(endpoint, timeoutMs, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: options.method || "GET",
        credentials: "include",
        mode: "cors",
        cache: "no-store",
        headers: {
          "Accept": "application/json",
          ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...(options.headers || {})
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal
      });

      if (!response.ok) {
        return { ok: false, code: `HTTP_${response.status}`, reason: `HTTP ${response.status}` };
      }

      try {
        return { ok: true, data: await response.json() };
      } catch {
        return { ok: false, code: "INVALID_JSON", reason: "Endpoint did not return valid JSON" };
      }
    } catch (error) {
      const timedOut = error && error.name === "AbortError";
      return {
        ok: false,
        code: timedOut ? "TIMEOUT" : "NETWORK_OR_CORS",
        reason: timedOut
          ? "Request timed out"
          : "Request could not be read from this origin; CORS, cookie policy, or network policy may block it"
      };
    } finally {
      clearTimeout(timer);
    }
  }

  function endpoint(config, key) {
    const official = new URL(config.officialUrl);
    return validateOfficialEndpoint(config[key], official.origin);
  }

  async function readSession(config) {
    const url = endpoint(config, "sessionEndpoint");
    if (!url) return { supported: false, code: "NOT_CONFIGURED", reason: "No official session endpoint configured" };

    const result = await fetchJson(url, config.requestTimeoutMs);
    if (!result.ok) return { supported: true, ...result };

    const data = result.data || {};
    return {
      supported: true,
      ok: true,
      authenticated: data.authenticated === true,
      player: data.player || null,
      capabilities: Array.isArray(data.capabilities) ? data.capabilities : [],
      stats: data.stats || null
    };
  }

  async function readStats(config) {
    const url = endpoint(config, "statsEndpoint");
    if (!url) return { supported: false, code: "NOT_CONFIGURED", reason: "No official player-stat endpoint configured" };

    const result = await fetchJson(url, config.requestTimeoutMs);
    if (!result.ok) return { supported: true, ...result };
    return { supported: true, ok: true, stats: result.data?.stats || result.data };
  }

  async function readState(config) {
    const url = endpoint(config, "stateEndpoint");
    if (!url) return { supported: false, code: "NOT_CONFIGURED", reason: "No official state endpoint configured" };

    const result = await fetchJson(url, config.requestTimeoutMs);
    if (!result.ok) return { supported: true, ...result };
    return { supported: true, ok: true, state: result.data || {} };
  }

  function eventsUrl(config) {
    const url = endpoint(config, "eventsEndpoint");
    return url || null;
  }

  async function setModifiers(config, modifiers) {
    const url = endpoint(config, "setModifiersEndpoint");
    if (!url) return { supported: false, code: "NOT_CONFIGURED", reason: "No official modifier endpoint configured" };

    const result = await fetchJson(url, config.requestTimeoutMs, {
      method: "POST",
      body: { modifiers }
    });
    if (!result.ok) return { supported: true, ...result };

    return {
      supported: true,
      ok: true,
      applied: result.data?.applied || null,
      stats: result.data?.stats || null,
      baseline: result.data?.baseline || null,
      revision: result.data?.revision ?? null
    };
  }

  async function restore(config) {
    const url = endpoint(config, "restoreEndpoint");
    if (!url) return { supported: false, code: "NOT_CONFIGURED", reason: "No official restoration endpoint configured" };

    const result = await fetchJson(url, config.requestTimeoutMs, {
      method: "POST",
      body: {}
    });
    if (!result.ok) return { supported: true, ...result };

    return {
      supported: true,
      ok: true,
      stats: result.data?.stats || null,
      baseline: result.data?.baseline || null,
      revision: result.data?.revision ?? null
    };
  }

  const api = {
    DEFAULT_CONFIG,
    normalizeConfig,
    validateOfficialEndpoint,
    readSession,
    readStats,
    readState,
    eventsUrl,
    setModifiers,
    restore
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HHOfficialAdapter = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
