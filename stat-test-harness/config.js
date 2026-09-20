"use strict";
window.HH_OFFICIAL_CONFIG = {
  officialUrl: "https://www.helmet-heroes.com/",

  // Configure only documented, authorized HTTPS endpoints on the
  // configured official origin.
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
};
