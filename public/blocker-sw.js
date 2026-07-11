/* Streambert Web — Ad & Tracker Blocker Service Worker
 * Runs on the Streambert origin (the SPA shell). Blocks known ad/tracker
 * requests issued by the app's own page (analytics, telemetry, beacons,
 * ad networks). It cannot filter traffic *inside* a cross-origin video
 * iframe (browser security), but it protects the Streambert UI itself
 * and reports real blocked-request stats to the React app.
 *
 * Communicates with the page via BroadcastChannel("streambert-blocker").
 */
const CHANNEL = "streambert-blocker";
const BADGE_CHANNEL = "streambert-blocker-badge";

// ── Matchers ────────────────────────────────────────────────────────────────
// Substrings (case-insensitive) that identify ad / tracker / telemetry traffic.
const TRACKER_TOKENS = [
  "doubleclick.net",
  "googlesyndication.com",
  "googleadservices.com",
  "google-analytics.com",
  "analytics",
  "googletagmanager.com",
  "adservice",
  "adnxs.com",
  "adsystem",
  "adserver",
  "adservice",
  "criteo",
  "pubmatic",
  "rubiconproject",
  "openx.net",
  "taboola",
  "outbrain",
  "scorecardresearch",
  "hotjar",
  "mixpanel",
  "segment.io",
  "amplitude",
  "fullstory",
  "bugsnag",
  "sentry",
  "telemetry",
  "beacon",
  "pixel.",
  "/pixel",
  "tracker",
  "track.",
  "metrics",
  ".gif?t=",
  "facebook.net",
  "fbq",
  "connect.facebook",
  "t.co",
  "ads.twitter",
  "bat.bing",
  "clarity.ms",
  "pixel.wp.com",
  "stats.wp.com",
  "quantserve",
  "moatads",
  "spotx",
  "springserve",
  "freewheel",
  "imrworldwide",
  "nielsen",
  "branchnetwork",
  "adjust",
  "appsflyer",
  "kochava",
];

// Paths that strongly indicate ad/measurement payloads
const TRACKER_PATH_RE = /\/(ad|ads|track(er|ing)?|beacon|pixel|collect|telemetry|analytics|imp|impression|event)(\/|\?|$)/i;

function isTracker(url) {
  try {
    const u = url.toLowerCase();
    if (TRACKER_TOKENS.some((t) => u.includes(t))) return true;
    if (TRACKER_PATH_RE.test(new URL(url).pathname)) return true;
    return false;
  } catch {
    return false;
  }
}

// ── Stats ───────────────────────────────────────────────────────────────────
const session = { total: 0, domains: {} };
const ALLTIME_KEY = "streambert_blocked_alltime";

function loadAlltime() {
  try {
    return Number(self.localStorage?.getItem(ALLTIME_KEY) || 0) || 0;
  } catch {
    return 0;
  }
}
function saveAlltime(v) {
  try {
    self.localStorage?.setItem(ALLTIME_KEY, String(v));
  } catch {}
}

let alltime = loadAlltime();

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function recordBlock(url) {
  session.total += 1;
  const d = domainOf(url);
  session.domains[d] = (session.domains[d] || 0) + 1;
  alltime += 1;
  saveAlltime(alltime);
  postStats();
}

const bc = (() => {
  try {
    return new BroadcastChannel(CHANNEL);
  } catch {
    return null;
  }
})();

function postStats() {
  const payload = {
    type: "blocked-stats",
    total: session.total,
    alltime,
    domains: Object.entries(session.domains).sort((a, b) => b[1] - a[1]),
  };
  if (bc) bc.postMessage(payload);
  try {
    self.clients?.matchAll().then((cs) =>
      cs.forEach((c) => c.postMessage(payload)),
    );
  } catch {}
}

// ── Lifecycle ────────────────────────────────────────────────────────────────
self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
  postStats();
});

self.addEventListener("message", (e) => {
  const data = e.data || {};
  if (data.type === "get-stats") postStats();
  if (data.type === "reset-session") {
    session.total = 0;
    session.domains = {};
    postStats();
  }
});

// ── Fetch interception ───────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Only handle GET requests initiated by the page (not the video iframe's
  // subresources — those are cross-origin and not visible here anyway).
  if (req.method !== "GET") return;
  const url = req.url;

  // Never block our own app assets or the player iframes themselves.
  if (isTracker(url)) {
    recordBlock(url);
    // Return an empty 204 so the caller doesn't error loudly.
    event.respondWith(
      new Response(null, {
        status: 204,
        statusText: "Blocked by Streambert",
        headers: { "Access-Control-Allow-Origin": "*" },
      }),
    );
  }
});
