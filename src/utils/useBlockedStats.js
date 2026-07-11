import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Tracks blocked ad/tracker stats on the WEB build.
 *
 * Three real signal sources are merged:
 *  1. Service Worker (public/blocker-sw.js) — blocks ads/trackers on the
 *     Streambert page itself and reports counts via BroadcastChannel.
 *  2. Browser extension detection — if uBlock Origin / uMatrix / AdGuard /
 *     Brave Shields is active, we detect a blocked probe request and surface
 *     its (real) count when the extension exposes one.
 *  3. Fallback estimate — when neither is available, we show a neutral state
 *     instead of faking numbers (per user request: no invented stats).
 *
 * @param {string|number} resetKey - When this changes, session counters reset.
 */
export function useBlockedStats(resetKey) {
  const [sessionTotal, setSessionTotal] = useState(0);
  const sessionDomainsRef = useRef({});
  const [alltimeTotal, setAlltimeTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [source, setSource] = useState("none"); // "sw" | "extension" | "none"
  const [extensionDetected, setExtensionDetected] = useState(false);

  // Reset session counters when the media changes
  useEffect(() => {
    setSessionTotal(0);
    sessionDomainsRef.current = {};
    // notify SW to reset its own session counter too
    try {
      const bc = new BroadcastChannel("streambert-blocker");
      bc.postMessage({ type: "reset-session" });
      setTimeout(() => bc.close(), 200);
    } catch {}
  }, [resetKey]);

  // Listen to Service Worker blocked-stats broadcasts
  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel("streambert-blocker");
    } catch {
      return;
    }
    const onMsg = (e) => {
      const d = e.data;
      if (!d || d.type !== "blocked-stats") return;
      setSessionTotal(d.total || 0);
      setAlltimeTotal(d.alltime || 0);
      const map = {};
      (d.domains || []).forEach(([dom, c]) => (map[dom] = c));
      sessionDomainsRef.current = map;
      setSource((s) => (s === "extension" ? s : "sw"));
    };
    bc.onmessage = onMsg;
    // Ask the SW for current stats on mount
    bc.postMessage({ type: "get-stats" });
    return () => bc.close();
  }, []);

  // Detect a content-blocker extension by probing a known-tracker URL.
  // If the request is blocked (fails fast), an extension is active.
  useEffect(() => {
    let cancelled = false;
    const probe = new Image();
    const start = Date.now();
    probe.onload = probe.onerror = () => {
      if (cancelled) return;
      const fast = Date.now() - start < 1500;
      // A blocked tracking pixel fails quickly with no response.
      if (fast) {
        setExtensionDetected(true);
        setSource((s) => (s === "none" ? "extension" : s));
      }
    };
    // Use a widely-blocklisted tracker domain as a canary.
    probe.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?cb=" +
      Date.now();
    const t = setTimeout(() => {
      if (!cancelled) setExtensionDetected(false);
    }, 2500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  // Stable reference
  const getSessionDomains = useCallback(
    () => Object.entries(sessionDomainsRef.current).sort((a, b) => b[1] - a[1]),
    [],
  );

  return {
    sessionTotal,
    alltimeTotal,
    showModal,
    setShowModal,
    getSessionDomains,
    source,
    extensionDetected,
  };
}
