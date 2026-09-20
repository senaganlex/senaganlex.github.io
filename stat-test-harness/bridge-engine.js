"use strict";

(function (global) {
  function createBridgeEngine(core, initialStats) {
    if (!core.validateStats(initialStats)) {
      throw new Error("Invalid initial stat snapshot");
    }

    const original = { ...initialStats };
    let applied = core.emptyFlags(false);
    let stats = { ...original };

    return {
      getOriginalStats() {
        return { ...original };
      },
      getApplied() {
        return { ...applied };
      },
      getStats() {
        return { ...stats };
      },
      setModifiers(requested) {
        if (!requested || typeof requested !== "object") {
          throw new Error("Invalid modifiers payload");
        }
        const next = core.emptyFlags(false);
        for (const def of core.STAT_DEFS) {
          next[def.key] = Boolean(requested[def.key]);
        }
        applied = next;
        stats = core.calculateEffective(original, applied);
        return { applied: { ...applied }, stats: { ...stats } };
      },
      restore() {
        applied = core.emptyFlags(false);
        stats = { ...original };
        return { applied: { ...applied }, stats: { ...stats } };
      }
    };
  }

  const api = { createBridgeEngine };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HHBridgeEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
