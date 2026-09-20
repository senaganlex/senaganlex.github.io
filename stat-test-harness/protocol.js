"use strict";

(function (global) {
  const MSG = Object.freeze({
    AUTH_PROBE: "HH_AUTH_PROBE",
    AUTH_STATE: "HH_AUTH_STATE",
    GET_STATS: "HH_TEST_GET_PLAYER_STATS",
    STATS: "HH_TEST_PLAYER_STATS",
    SET: "HH_TEST_SET_MODIFIERS",
    APPLIED: "HH_TEST_MODIFIERS_APPLIED",
    RESTORE: "HH_TEST_RESTORE_ALL",
    RESTORED: "HH_TEST_RESTORED",
    ERROR: "HH_TEST_BRIDGE_ERROR",
    BYE: "HH_TEST_BRIDGE_BYE"
  });

  function envelope(type, requestId, payload = {}) {
    return { type, version: 5, requestId, payload };
  }

  const api = { MSG, envelope };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HHProtocol = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
