// src/utils/antiRedirect.js
//
// Blocks ad-popups triggered by embedded video players.
//
// HOW THIS WORKS (and why it's not futile):
// These scraped embed players live in a cross-origin <iframe>, so we cannot
// touch their DOM or JS directly. BUT the ad scripts pop new tabs by calling
// `window.top.open(adUrl)` — and `window.top` IS this Streambert page. They
// are calling a property on OUR window object, which we can replace. So
// overriding window.open here genuinely intercepts "click pause -> new ad tab".
//
// Cross-origin frames also CANNOT set window.top.location (browser blocks it
// with SecurityError), so top-level redirect hijacks are already stopped by
// the browser. window.open is the real vector, and we cover it.

import { PLAYER_SOURCES } from "./api";

const SAFE_HOSTS = new Set([
  "themoviedb.org",
  "www.themoviedb.org",
  "api.themoviedb.org",
  "image.tmdb.org",
  "github.com",
  "github.io",
  "vercel.app",
  "netlify.app",
]);

// Whitelist the player/embed hosts themselves (used by the <iframe src>).
PLAYER_SOURCES.forEach((s) => {
  try {
    SAFE_HOSTS.add(new URL(s.movieUrl("0")).hostname);
  } catch {
    /* ignore malformed */
  }
});

let installed = false;
let blockedCount = 0;

function isSafe(url) {
  if (!url) return true; // window.open() with no URL — let it through
  try {
    const u = new URL(url, window.location.href);
    if (u.hostname === window.location.hostname) return true;
    if (SAFE_HOSTS.has(u.hostname)) return true;
    return false;
  } catch {
    return false; // unparseable -> treat as unsafe, block
  }
}

function notifyBlocked(url) {
  blockedCount += 1;
  try {
    window.dispatchEvent(
      new CustomEvent("streambert:redirect-blocked", {
        detail: { url, count: blockedCount },
      }),
    );
  } catch {
    /* no-op */
  }
}

/**
 * Streambert's own external links always allowed (bypasses the guard).
 */
export function safeOpenExternal(url) {
  const open = window.__originalOpen || window.open;
  return open(url, "_blank", "noopener");
}

export function installAntiRedirect() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const original = window.open ? window.open.bind(window) : null;
  window.__originalOpen = original;

  window.open = function (url, ...rest) {
    if (!isSafe(url)) {
      notifyBlocked(url);
      return null; // block the ad popup
    }
    return original ? original(url, ...rest) : null;
  };

  // Defensive: block location.assign hijacks that somehow reach the top page.
  if (window.location && typeof window.location.assign === "function") {
    const origAssign = window.location.assign.bind(window.location);
    window.location.assign = function (url) {
      if (isSafe(url)) return origAssign(url);
      notifyBlocked(url);
    };
  }
}
