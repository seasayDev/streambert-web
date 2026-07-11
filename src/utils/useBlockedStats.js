import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Tracks blocked request stats.
 * In web: blocked stats are not available (no Electron ad-blocker IPC).
 *
 * @param {string|number} resetKey - When this changes, session counters reset.
 */
export function useBlockedStats(resetKey) {
  const [sessionTotal, setSessionTotal] = useState(0);
  const sessionDomainsRef = useRef({});
  const [alltimeTotal, setAlltimeTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Reset session counters when the media changes
  useEffect(() => {
    setSessionTotal(0);
    sessionDomainsRef.current = {};
  }, [resetKey]);

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
  };
}