"use strict";
(function (global) {
  const VERSION = 7;

  const MSG = Object.freeze({
    AUTH_PROBE: "HH_AUTH_PROBE",
    AUTH_STATE: "HH_AUTH_STATE",

    GET_STATS: "HH_TEST_GET_PLAYER_STATS",
    STATS: "HH_TEST_PLAYER_STATS",

    GET_STATE: "HH_TEST_GET_STATE",
    STATE: "HH_TEST_STATE",

    SUBSCRIBE: "HH_TEST_SUBSCRIBE",
    SUBSCRIBED: "HH_TEST_SUBSCRIBED",
    STATE_EVENT: "HH_TEST_STATE_EVENT",

    SET: "HH_TEST_SET_MODIFIERS",
    APPLIED: "HH_TEST_MODIFIERS_APPLIED",

    RESTORE: "HH_TEST_RESTORE_ALL",
    RESTORED: "HH_TEST_RESTORED",

    PING: "HH_TEST_PING",
    PONG: "HH_TEST_PONG",

    ERROR: "HH_TEST_BRIDGE_ERROR",
    BYE: "HH_TEST_BRIDGE_BYE"
  });

  function envelope(type, requestId = null, payload = {}) {
    return { type, version: VERSION, requestId, payload };
  }

  function validMessage(value) {
    return Boolean(
      value &&
      typeof value === "object" &&
      value.version === VERSION &&
      typeof value.type === "string"
    );
  }

  const api = { VERSION, MSG, envelope, validMessage };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HHProtocol = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
