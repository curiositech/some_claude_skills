"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const SITES = [
  {
    id: "os2",
    label: "Desktop OS",
    url: "https://os2.someclaudeskills.com",
    description: "Windows 3.1 desktop experience",
    current: true,
  },
  {
    id: "classic",
    label: "Classic Site",
    url: "https://someclaudeskills.com",
    description: "Docusaurus documentation site",
    current: false,
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
 * SiteBanner — Cross-site navigation switcher.
 *
 * Compact Win31-styled hamburger in the top-left that opens a dropdown
 * with links to all SomeClaudeSkills properties.
 * Fixed position, always visible above the desktop chrome.
 */
export function SiteBanner() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-1 left-1 z-[99999]">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 px-1.5 py-0.5 cursor-pointer",
          "font-[family-name:var(--font-system)] text-[9px] font-bold",
          "bg-[var(--color-surface)] text-[var(--color-text-primary)]",
          "border",
          open
            ? [
                "border-t-[var(--color-border-raised-dark)]",
                "border-l-[var(--color-border-raised-dark)]",
                "border-b-[var(--color-border-raised-light)]",
                "border-r-[var(--color-border-raised-light)]",
              ]
            : [
                "border-t-[var(--color-border-raised-light)]",
                "border-l-[var(--color-border-raised-light)]",
                "border-b-[var(--color-border-raised-dark)]",
                "border-r-[var(--color-border-raised-dark)]",
              ],
          "shadow-[1px_1px_0_var(--color-border-raised-dark)]",
          "opacity-60 hover:opacity-100 transition-opacity"
        )}
        aria-label="Switch site"
        aria-expanded={open}
      >
        <span className="text-[8px] leading-none">
          {open ? "\u25BC" : "\u2630"}
        </span>
        Sites
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "absolute top-full left-0 mt-0.5 w-52",
              "bg-[var(--color-surface)]",
              "border-2",
              "border-t-[var(--color-border-raised-light)]",
              "border-l-[var(--color-border-raised-light)]",
              "border-b-[var(--color-border-raised-dark)]",
              "border-r-[var(--color-border-raised-dark)]",
              "shadow-[2px_2px_0_var(--color-border-raised-dark)]"
            )}
          >
            {/* Title strip */}
            <div
              className={cn(
                "px-2 py-1",
                "bg-[var(--color-titlebar-active)]",
                "font-[family-name:var(--font-system)] text-[9px] font-bold",
                "text-[var(--color-titlebar-text)]"
              )}
            >
              SomeClaudeSkills.com
            </div>

            {/* Site links */}
            <div className="py-0.5">
              {SITES.map((site) => (
                <a
                  key={site.id}
                  href={site.current ? undefined : site.url}
                  onClick={site.current ? (e) => { e.preventDefault(); setOpen(false); } : undefined}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 no-underline",
                    "font-[family-name:var(--font-system)] text-[10px]",
                    site.current
                      ? "bg-[var(--color-surface-inset)] text-[var(--color-text-primary)] cursor-default"
                      : "text-[var(--color-text-primary)] hover:bg-[var(--color-titlebar-active)] hover:text-[var(--color-titlebar-text)]"
                  )}
                >
                  <span className="w-2 text-center text-[8px]">
                    {site.current ? "\u25B6" : ""}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{site.label}</div>
                    <div className={cn(
                      "text-[8px] truncate",
                      site.current ? "text-[var(--color-text-muted)]" : "opacity-70"
                    )}>
                      {site.description}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Footer */}
            <div
              className={cn(
                "px-2 py-1 border-t border-t-[var(--color-border-inset-light)]",
                "font-[family-name:var(--font-code)] text-[8px] text-[var(--color-text-muted)]"
              )}
            >
              <a className="studio-signature" href="https://curiositech.ai/" aria-label="Curiositech home">
                <span className="studio-signature__mark" aria-hidden="true" />
                <span className="studio-signature__wordmark" aria-hidden="true" />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
