"use strict";

/*
  Official integration configuration.

  Keep both endpoints null unless Helmet Heroes provides documented,
  authorized HTTPS endpoints for external applications.

  The harness never asks for a password and never reads/stores cookies
  or session tokens itself. When an authorized credentialed CORS endpoint
  is configured, the browser's normal cookie jar handles authentication.
*/
window.HH_OFFICIAL_CONFIG = {
  officialUrl: "https://www.helmet-heroes.com/",
  sessionEndpoint: null,
  statsEndpoint: null
};
