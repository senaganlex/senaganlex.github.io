"use strict";

(function (global) {
  const DEFAULT_CONFIG = Object.freeze({
    officialUrl: "https://www.helmet-heroes.com/",
    // Populate these ONLY when Helmet Heroes supplies documented endpoints.
    // They must be HTTPS URLs on the official Helmet Heroes origin.
    sessionEndpoint: null,
    statsEndpoint: null
  });

  function normalizeConfig(input = {}) {
    return { ...DEFAULT_CONFIG, ...input };
  }

  function validateOfficialEndpoint(endpoint, officialOrigin) {
    if (!endpoint) return null;
    const u = new URL(endpoint);
    if (u.protocol !== "https:" || u.origin !== officialOrigin) {
      throw new Error("Official endpoint must use HTTPS on the Helmet Heroes origin");
    }
    return u.href;
  }

  async function readSessionViaHttp(config) {
    const official = new URL(config.officialUrl);
    const endpoint = validateOfficialEndpoint(config.sessionEndpoint, official.origin);
    if (!endpoint) {
      return { supported: false, reason: "No documented official session endpoint configured" };
    }

    let response;
    try {
      response = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
        mode: "cors",
        cache: "no-store",
        headers: { "Accept": "application/json" }
      });
    } catch (error) {
      return {
        supported: true,
        ok: false,
        reason: "Session endpoint could not be read from this origin. CORS or cookie policy may not permit it.",
        error: String(error && error.message || error)
      };
    }

    if (!response.ok) {
      return { supported: true, ok: false, reason: `Session endpoint returned HTTP ${response.status}` };
    }

    let data;
    try { data = await response.json(); }
    catch { return { supported: true, ok: false, reason: "Session endpoint did not return JSON" }; }

    return {
      supported: true,
      ok: true,
      authenticated: data.authenticated === true,
      player: data.player || null,
      capabilities: Array.isArray(data.capabilities) ? data.capabilities : [],
      stats: data.stats || null
    };
  }

  async function readStatsViaHttp(config) {
    const official = new URL(config.officialUrl);
    const endpoint = validateOfficialEndpoint(config.statsEndpoint, official.origin);
    if (!endpoint) {
      return { supported: false, reason: "No documented official player-stat endpoint configured" };
    }

    let response;
    try {
      response = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
        mode: "cors",
        cache: "no-store",
        headers: { "Accept": "application/json" }
      });
    } catch (error) {
      return {
        supported: true,
        ok: false,
        reason: "Player-stat endpoint could not be read from this origin. CORS or cookie policy may not permit it.",
        error: String(error && error.message || error)
      };
    }

    if (!response.ok) {
      return { supported: true, ok: false, reason: `Player-stat endpoint returned HTTP ${response.status}` };
    }

    let data;
    try { data = await response.json(); }
    catch { return { supported: true, ok: false, reason: "Player-stat endpoint did not return JSON" }; }

    return { supported: true, ok: true, stats: data.stats || data };
  }

  const api = { DEFAULT_CONFIG, normalizeConfig, validateOfficialEndpoint, readSessionViaHttp, readStatsViaHttp };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HHOfficialAdapter = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
