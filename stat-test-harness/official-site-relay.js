"use strict";
/*
  Authorized official-site relay.

  Install only on a page controlled by the Helmet Heroes site owner.
  It relays the versioned test protocol; it never reads passwords, cookies,
  storage, game memory, or undocumented runtime objects.
*/
(function (global) {
  const { VERSION, MSG, envelope, validMessage } = global.HHProtocol || {
    VERSION: 6,
    MSG: { ERROR: "HH_TEST_BRIDGE_ERROR" },
    envelope: (type, requestId, payload={}) => ({type, version:6, requestId, payload}),
    validMessage: m => m && typeof m === "object" && m.version === 6 && typeof m.type === "string"
  };

  const cfg = {
    harnessOrigin: "https://senaganlex.github.io",
    allowedGameHostSuffixes: [".itch.zone", ".itch.io"],
    allowedGameOrigins: [],
    requestTtlMs: 15000,
    ...(global.HH_RELAY_CONFIG || {})
  };

  const pending = new Map();

  function allowedGameOrigin(origin) {
    if (cfg.allowedGameOrigins.includes(origin)) return true;
    try {
      const host = new URL(origin).hostname;
      return cfg.allowedGameHostSuffixes.some(s => host === s.slice(1) || host.endsWith(s));
    } catch { return false; }
  }

  function gameFrames() {
    const frames = [];
    for (const frame of Array.from(document.querySelectorAll("iframe"))) {
      const src = frame.getAttribute("src");
      if (!src || !frame.contentWindow) continue;
      try {
        const origin = new URL(src, document.baseURI).origin;
        if (allowedGameOrigin(origin)) frames.push({ windowRef: frame.contentWindow, origin });
      } catch {}
    }
    return frames;
  }

  function isKnownGameSource(event) {
    return gameFrames().some(f => f.windowRef === event.source && f.origin === event.origin);
  }

  function prune() {
    const now = Date.now();
    for (const [id, meta] of pending) {
      if (meta.expiresAt <= now) pending.delete(id);
    }
  }

  global.addEventListener("message", event => {
    if (!validMessage(event.data)) return;
    prune();

    // Harness -> official page -> authorized game iframe.
    if (event.origin === cfg.harnessOrigin && event.source === global.opener) {
      const id = event.data.requestId;
      const frames = gameFrames();

      if (!frames.length) {
        global.opener?.postMessage(
          envelope(MSG.ERROR || "HH_TEST_BRIDGE_ERROR", id, {
            code: "RELAY_NO_GAME_FRAME",
            message: "No authorized game iframe was found on the official page"
          }),
          cfg.harnessOrigin
        );
        return;
      }

      if (id) {
        pending.set(id, {
          harnessWindow: event.source,
          expiresAt: Date.now() + cfg.requestTtlMs
        });
      }

      for (const frame of frames) {
        try { frame.windowRef.postMessage(event.data, frame.origin); } catch {}
      }
      return;
    }

    // Authorized game iframe -> official page -> harness.
    if (allowedGameOrigin(event.origin) && isKnownGameSource(event) && global.opener) {
      const id = event.data.requestId;
      if (id && !pending.has(id)) return;
      global.opener.postMessage(event.data, cfg.harnessOrigin);
      if (id) pending.delete(id);
    }
  });
})(window);
