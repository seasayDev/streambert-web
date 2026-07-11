import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";

// Register the ad/tracker blocker Service Worker (web build only).
// It protects the Streambert app shell and reports real blocked-request stats.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/blocker-sw.js")
      .catch(() => {
        /* SW unsupported / blocked — feature simply stays inert */
      });
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);