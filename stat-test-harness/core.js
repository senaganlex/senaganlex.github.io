"use strict";

(function (global) {
  const DEFAULTS = Object.freeze({
    attackDamage: 60,
    criticalChance: 10,
    attackSpeed: 1,
    defense: 80,
    dexterity: 50,
    luck: 25,
    orbAttack: 60,
    orbDefense: 40,
    orbCritMultiplier: 1.5
  });

  const STAT_DEFS = Object.freeze([
    { key: "attackDamage", label: "Attack / Damage ×2", step: 1 },
    { key: "criticalChance", label: "Critical Chance ×2", step: 0.1 },
    { key: "attackSpeed", label: "Attack Speed ×2", step: 0.01 },
    { key: "defense", label: "Defense ×2", step: 1 },
    { key: "dexterity", label: "Dexterity ×2", step: 1 },
    { key: "luck", label: "Luck ×2", step: 1 },
    { key: "orbAttack", label: "Orb Attack ×2", step: 1 },
    { key: "orbDefense", label: "Orb Defense ×2", step: 1 },
    { key: "orbCritMultiplier", label: "Orb Critical Multiplier ×2", step: 0.01 }
  ]);

  const AUTH_CAPABILITIES = Object.freeze(["read-player-stats"]);
  const MUTATION_CAPABILITIES = Object.freeze(["apply-test-modifiers", "restore-player-stats"]);

  function emptyFlags(value = false) {
    return Object.fromEntries(STAT_DEFS.map(s => [s.key, Boolean(value)]));
  }

  function calculateEffective(baseline, applied) {
    const result = {};
    for (const stat of STAT_DEFS) {
      const base = Number(baseline[stat.key]);
      result[stat.key] = applied[stat.key] ? base * 2 : base;
    }
    return result;
  }

  function validateStats(stats) {
    return Boolean(
      stats &&
      typeof stats === "object" &&
      STAT_DEFS.every(s => Number.isFinite(Number(stats[s.key])))
    );
  }

  function validatePlayer(player) {
    if (!player || typeof player !== "object") return false;
    const id = player.id == null ? "" : String(player.id).trim();
    const username = player.username == null ? "" : String(player.username).trim();
    return Boolean(id || username);
  }

  function sanitizePlayer(player) {
    if (!validatePlayer(player)) return null;
    return {
      id: player.id == null ? null : String(player.id),
      username: player.username == null ? null : String(player.username)
    };
  }

  function hasCapabilities(capabilities, required) {
    const caps = new Set(Array.isArray(capabilities) ? capabilities : []);
    return required.every(c => caps.has(c));
  }

  function detect(baseline, measured, applied) {
    let enabledCount = 0;
    let mismatchCount = 0;
    let signatureMatches = 0;

    for (const stat of STAT_DEFS) {
      const base = Number(baseline[stat.key]);
      const current = Number(measured[stat.key]);
      if (applied[stat.key]) enabledCount++;
      if (current !== base) mismatchCount++;
      if (base !== 0 && current === base * 2) signatureMatches++;
    }

    return {
      enabledCount,
      mismatchCount,
      signatureMatches,
      anomaly: mismatchCount > 0,
      suggestedAction: mismatchCount > 0 ? "Reject / reconcile to baseline" : "Allow"
    };
  }

  const api = {
    DEFAULTS,
    STAT_DEFS,
    AUTH_CAPABILITIES,
    MUTATION_CAPABILITIES,
    emptyFlags,
    calculateEffective,
    validateStats,
    validatePlayer,
    sanitizePlayer,
    hasCapabilities,
    detect
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HHCore = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
