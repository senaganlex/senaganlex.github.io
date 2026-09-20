"use strict";
(function (global) {
  function createBridgeEngine(core, initialStats) {
    const original = core.normalizeStats(initialStats);
    if (!original) throw new Error("Invalid initial stat snapshot");

    let applied = core.emptyFlags(false);
    let stats = { ...original };

    return {
      getOriginalStats() { return { ...original }; },
      getApplied() { return { ...applied }; },
      getStats() { return { ...stats }; },

      setModifiers(requested) {
        applied = core.normalizeFlags(requested);
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
