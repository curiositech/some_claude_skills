import React, { useState, useEffect, useRef } from "react";

const SITES = [
  {
    id: "os2",
    label: "Desktop OS",
    url: "https://os2.someclaudeskills.com",
    description: "Windows 3.1 desktop experience",
    current: false,
  },
  {
    id: "classic",
    label: "Classic Site",
    url: "https://someclaudeskills.com",
    description: "Docusaurus documentation site",
    current: true,
  },
  {
    id: "docs",
    label: "Documentation",
    url: "https://someclaudeskills.com/docs/guides/claude-skills-guide",
    description: "Getting started guide",
    current: false,
  },
  {
    id: "artifacts",
    label: "Artifacts",
    url: "https://someclaudeskills.com/artifacts",
    description: "Examples & showcases",
    current: false,
  },
];

/**
 * SiteBanner — Cross-site navigation switcher for the Docusaurus site.
 *
 * Mirrors the OS2 SiteBanner: compact Win31-styled hamburger in the top-left
 * that opens a dropdown with links to all SomeClaudeSkills properties.
 * Fixed position, always visible above the navbar.
 */
export default function SiteBanner() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div ref={ref} style={styles.container}>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          ...styles.button,
          ...(open ? styles.buttonPressed : styles.buttonRaised),
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.opacity = "1";
        }}
        aria-label="Switch site"
        aria-expanded={open}
      >
        <span style={styles.icon}>{open ? "\u25BC" : "\u2630"}</span>
        Sites
      </button>

      {/* Dropdown */}
      {open && (
        <div style={styles.dropdown}>
          {/* Title strip */}
          <div style={styles.titleStrip}>SomeClaudeSkills.com</div>

          {/* Site links */}
          <div style={styles.linkList}>
            {SITES.map((site) => (
              <a
                key={site.id}
                href={site.current ? undefined : site.url}
                onClick={
                  site.current
                    ? (e) => {
                        e.preventDefault();
                        setOpen(false);
                      }
                    : undefined
                }
                style={{
                  ...styles.link,
                  ...(site.current ? styles.linkCurrent : {}),
                }}
                onMouseEnter={(e) => {
                  if (!site.current) {
                    e.currentTarget.style.background = "var(--theme-action-bg)";
                    e.currentTarget.style.color = "var(--theme-action-text)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!site.current) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--theme-text)";
                  }
                }}
              >
                <span style={styles.marker}>
                  {site.current ? "\u25B6" : ""}
                </span>
                <div style={styles.linkContent}>
                  <div style={styles.linkLabel}>{site.label}</div>
                  <div
                    style={{
                      ...styles.linkDesc,
                      ...(site.current ? styles.linkDescCurrent : {}),
                    }}
                  >
                    {site.description}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Footer */}
          <div style={styles.footer}>someclaudeskills.com</div>
        </div>
      )}
    </div>
  );
}

/* ── Inline styles (avoids CSS module dependency) ─────────────────────── */

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    top: 4,
    left: 4,
    zIndex: 99999,
    fontFamily: "var(--font-system, 'IBM Plex Mono', monospace)",
  },
  button: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 6px",
    fontSize: 9,
    fontWeight: 700,
    fontFamily: "var(--font-system, 'IBM Plex Mono', monospace)",
    background: "var(--win31-gray, #c0c0c0)",
    color: "var(--theme-text)",
    cursor: "pointer",
    opacity: 1,
    transition: "opacity 0.15s",
    boxShadow: "1px 1px 0 var(--win31-border-outer-dark, #000000)",
  },
  buttonRaised: {
    borderTop: "1px solid var(--win31-border-outer-light, var(--theme-border))",
    borderLeft: "1px solid var(--win31-border-outer-light, var(--theme-border))",
    borderBottom: "1px solid var(--win31-border-outer-dark, var(--theme-border))",
    borderRight: "1px solid var(--win31-border-outer-dark, var(--theme-border))",
  },
  buttonPressed: {
    borderTop: "1px solid var(--win31-border-outer-dark, var(--theme-border))",
    borderLeft: "1px solid var(--win31-border-outer-dark, var(--theme-border))",
    borderBottom: "1px solid var(--win31-border-outer-light, var(--theme-border))",
    borderRight: "1px solid var(--win31-border-outer-light, var(--theme-border))",
  },
  icon: {
    fontSize: 8,
    lineHeight: 1,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: 2,
    width: 208,
    background: "var(--win31-gray, #c0c0c0)",
    borderWidth: 2,
    borderStyle: "solid",
    borderTopColor: "var(--win31-border-outer-light, var(--theme-border))",
    borderLeftColor: "var(--win31-border-outer-light, var(--theme-border))",
    borderBottomColor: "var(--win31-border-outer-dark, var(--theme-border))",
    borderRightColor: "var(--win31-border-outer-dark, var(--theme-border))",
    boxShadow: "2px 2px 0 var(--win31-border-outer-dark, #000000)",
  },
  titleStrip: {
    padding: "4px 8px",
    background: "var(--win31-navy, #000080)",
    fontSize: 9,
    fontWeight: 700,
    fontFamily: "var(--font-system, 'IBM Plex Mono', monospace)",
    color: "var(--theme-titlebar-text)",
  },
  linkList: {
    padding: "2px 0",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 8px",
    fontSize: 10,
    fontFamily: "var(--font-system, 'IBM Plex Mono', monospace)",
    color: "var(--theme-text)",
    textDecoration: "none",
    cursor: "pointer",
    transition: "transform 0.1s",
  },
  linkCurrent: {
    background: "var(--theme-elevated)",
    cursor: "default",
  },
  marker: {
    width: 8,
    textAlign: "center" as const,
    fontSize: 8,
  },
  linkContent: {
    color: "inherit",
    flex: 1,
    minWidth: 0,
  },
  linkLabel: {
    color: "inherit",
    fontWeight: 700,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  linkDesc: {
    color: "inherit",
    fontSize: 8,
    opacity: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  linkDescCurrent: {
    color: "var(--theme-muted)",
    opacity: 1,
  },
  footer: {
    padding: "4px 8px",
    borderTop: "1px solid var(--win31-border-inner-light, var(--theme-border-light))",
    fontSize: 8,
    fontFamily: "var(--font-code, 'IBM Plex Mono', monospace)",
    color: "var(--theme-muted)",
  },
};
