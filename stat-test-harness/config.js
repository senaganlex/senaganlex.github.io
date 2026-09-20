"use strict";
window.HH_OFFICIAL_CONFIG = {
  officialUrl: "https://www.helmet-heroes.com/",

  // Populate only with documented, authorized HTTPS endpoints on the
  // configured official origin.
  sessionEndpoint: null,
  statsEndpoint: null,
  setModifiersEndpoint: null,
  restoreEndpoint: null,

  probe: {
    intervalMs: 2500,
    maxAttempts: 24
  },

  requestTimeoutMs: 6000
};
