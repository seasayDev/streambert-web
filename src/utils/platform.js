// platform.js — detect runtime environment.
// Streambert is shared between an Electron desktop app and a static web build.
// Features that require the desktop shell (window.electron) are disabled on web.

export const IS_DESKTOP =
  typeof window !== "undefined" && !!window.electron;

export const IS_WEB = !IS_DESKTOP;

// Features gated to the desktop app (downloader, m3u8 capture, PiP, etc.)
export const CAN_DOWNLOAD = IS_DESKTOP;
