import { useState, useEffect } from "react";

// ── Inline markdown + GitHub formatter ───────────────────────────────────────
function inlineFormat(text) {
  const parts = [];
  const re =
    /(~~[^~]+~~|\*\*[^*]+\*\*|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s<>"')]+|@[\w-]+)/g;
  let last = 0,
    m,
    k = 0;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last)
      parts.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    const raw = m[0];

    if (raw.startsWith("~~")) {
      parts.push(
        <s key={k++} style={{ color: "var(--text3)" }}>
          {raw.slice(2, -2)}
        </s>,
      );
    } else if (raw.startsWith("**")) {
      parts.push(
        <strong key={k++} style={{ color: "var(--text)", fontWeight: 600 }}>
          {raw.slice(2, -2)}
        </strong>,
      );
    } else if (raw.startsWith("*") || raw.startsWith("_")) {
      parts.push(
        <em key={k++} style={{ color: "var(--text2)", fontStyle: "italic" }}>
          {raw.slice(1, -1)}
        </em>,
      );
    } else if (raw.startsWith("`")) {
      parts.push(
        <code
          key={k++}
          style={{
            fontSize: 11,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 3,
            padding: "1px 5px",
            fontFamily: "monospace",
            color: "var(--text)",
          }}
        >
          {raw.slice(1, -1)}
        </code>,
      );
    } else if (raw.startsWith("![")) {
      const mm = raw.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (mm) {
        parts.push(
          <img
            key={k++}
            src={mm[2]}
            alt={mm[1]}
            style={{
              maxWidth: "100%",
              verticalAlign: "middle",
              borderRadius: 6,
              border: "1px solid var(--border)",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />,
        );
      }
    } else if (raw.startsWith("[")) {
      const mm = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (mm) {
        parts.push(
          <a
            key={k++}
            href={mm[2]}
            onClick={(e) => {
              e.preventDefault();
              window.open(mm[2], "_blank", "noopener,noreferrer");
            }}
            style={{
              color: "var(--red)",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {mm[1]}
          </a>,
        );
      }
    } else if (raw.startsWith("@")) {
      const username = raw.slice(1);
      parts.push(
        <a
          key={k++}
          href={`https://github.com/${username}`}
          onClick={(e) => {
            e.preventDefault();
            window.open(`https://github.com/${username}`, "_blank", "noopener,noreferrer");
          }}
          style={{
            color: "var(--red)",
            textDecoration: "none",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          {raw}
        </a>,
      );
    } else if (raw.startsWith("http")) {
      let label = raw;
      try {
        const u = new URL(raw);
        const prMatch = u.pathname.match(/\/(pull|issues?)\/(\d+)$/);
        if (prMatch) label = `#${prMatch[2]}`;
        else label = u.hostname.replace(/^www\./, "") + u.pathname;
      } catch {}
      parts.push(
        <a
          key={k++}
          href={raw}
          onClick={(e) => {
            e.preventDefault();
            window.open(raw, "_blank", "noopener,noreferrer");
          }}
          style={{
            color: "var(--red)",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "0.95em",
          }}
        >
          {label}
        </a>,
      );
    }

    last = m.index + raw.length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return parts.length ? parts : text;
}

// ── Block-level markdown renderer ────────────────────────────────────────────
function renderChangelog(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      elements.push(
        <div
          key={key++}
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text)",
            marginTop: 14,
            marginBottom: 4,
            letterSpacing: 0.3,
          }}
        >
          {inlineFormat(line.slice(4))}
        </div>,
      );
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <div
          key={key++}
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--text)",
            marginTop: 16,
            marginBottom: 6,
            borderBottom: "1px solid var(--border)",
            paddingBottom: 4,
          }}
        >
          {inlineFormat(line.slice(3))}
        </div>,
      );
      continue;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <div
          key={key++}
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--text)",
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          {inlineFormat(line.slice(2))}
        </div>,
      );
      continue;
    }

    if (/^([-*_])\1{2,}\s*$/.test(line.trim())) {
      elements.push(
        <div
          key={key++}
          style={{
            borderBottom: "1px solid var(--border)",
            margin: "12px 0",
          }}
        />,
      );
      continue;
    }

    if (line.startsWith("> ")) {
      elements.push(
        <div
          key={key++}
          style={{
            borderLeft: "3px solid var(--red)",
            paddingLeft: 10,
            margin: "4px 0",
            color: "var(--text3)",
            fontSize: 13,
            fontStyle: "italic",
            lineHeight: 1.6,
          }}
        >
          {inlineFormat(line.slice(2))}
        </div>,
      );
      continue;
    }

    const htmlImgMatch = line.match(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/i);
    if (htmlImgMatch) {
      const src = htmlImgMatch[1];
      const altMatch = line.match(/\balt="([^"]*)"/i);
      const alt = altMatch ? altMatch[1] : "";
      elements.push(
        <div key={key++} style={{ margin: "10px 0" }}>
          <img
            src={src}
            alt={alt}
            style={{
              maxWidth: "100%",
              borderRadius: 8,
              border: "1px solid var(--border)",
              display: "block",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>,
      );
      continue;
    }

    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      const [, alt, src] = imgMatch;
      elements.push(
        <div key={key++} style={{ margin: "10px 0" }}>
          <img
            src={src}
            alt={alt}
            style={{
              maxWidth: "100%",
              borderRadius: 8,
              border: "1px solid var(--border)",
              display: "block",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>,
      );
      continue;
    }

    const numMatch = line.match(/^(\d+)\. (.*)$/);
    if (numMatch) {
      elements.push(
        <div
          key={key++}
          style={{
            display: "flex",
            gap: 8,
            fontSize: 13,
            color: "var(--text2)",
            lineHeight: 1.6,
            marginBottom: 2,
          }}
        >
          <span
            style={{
              color: "var(--red)",
              flexShrink: 0,
              fontWeight: 600,
              minWidth: 18,
              textAlign: "right",
            }}
          >
            {numMatch[1]}.
          </span>
          <span>{inlineFormat(numMatch[2])}</span>
        </div>,
      );
      continue;
    }

    if (/^[-*] /.test(line)) {
      elements.push(
        <div
          key={key++}
          style={{
            display: "flex",
            gap: 8,
            fontSize: 13,
            color: "var(--text2)",
            lineHeight: 1.6,
            marginBottom: 2,
          }}
        >
          <span style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }}>
            •
          </span>
          <span>{inlineFormat(line.slice(2))}</span>
        </div>,
      );
      continue;
    }

    if (line.trim() === "") {
      elements.push(<div key={key++} style={{ height: 6 }} />);
      continue;
    }

    elements.push(
      <div
        key={key++}
        style={{
          fontSize: 13,
          color: "var(--text2)",
          lineHeight: 1.6,
          marginBottom: 2,
        }}
      >
        {inlineFormat(line)}
      </div>,
    );
  }
  return elements;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function UpdateModal({
  updateInfo,
  activeDownloads = 0,
  onClose,
}) {
  const { latest, current, url, changelog } = updateInfo;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 6000,
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          width: "100%",
          maxWidth: 560,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "24px 28px 16px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 20 }}>🎉</span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    letterSpacing: 1,
                  }}
                >
                  UPDATE AVAILABLE
                </span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {current && (
                  <>
                    <span style={{ color: "var(--text3)" }}>v{current}</span>
                    <span style={{ color: "var(--text3)", fontSize: 11 }}>→</span>
                  </>
                )}
                <a
                  href={url}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  style={{
                    color: "var(--red)",
                    fontWeight: 600,
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                  title="View on GitHub"
                >
                  v{latest} ↗
                </a>
                <span style={{ color: "var(--text3)" }}>
                  (web version — use GitHub for updates)
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text3)",
                cursor: "pointer",
                fontSize: 18,
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Changelog ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {changelog ? (
            <>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  color: "var(--text3)",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                What's New
              </div>
              <div>{renderChangelog(changelog)}</div>
            </>
          ) : (
            <div
              style={{
                fontSize: 13,
                color: "var(--text3)",
                fontStyle: "italic",
              }}
            >
              No changelog available.
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
            <a
              href={url}
              onClick={(e) => {
                e.preventDefault();
                window.open(url, "_blank", "noopener,noreferrer");
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "9px 18px",
                background: "var(--red)",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              View on GitHub ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}