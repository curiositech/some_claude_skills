"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export const LS_KEY_ANTHROPIC = "mspaint_anthropic_api_key";
export const LS_KEY_PEXELS    = "mspaint_pexels_api_key";
export const LS_KEY_MODEL     = "mspaint_model";
export const LS_KEY_ADMIN     = "mspaint_admin_token";

export type MsPaintModel = "claude-haiku-4-5-20251001" | "claude-sonnet-4-20250514";

export const MODEL_OPTIONS: { value: MsPaintModel; label: string; note: string }[] = [
  {
    value: "claude-haiku-4-5-20251001",
    label: "Haiku (fast)",
    note:  "~$0.01/drawing · best for quick sketches",
  },
  {
    value: "claude-sonnet-4-20250514",
    label: "Sonnet (quality)",
    note:  "~$0.05/drawing · best for detailed scenes",
  },
];

export function SettingsWindow() {
  const [anthropicKey, setAnthropicKey] = useState("");
  const [pexelsKey, setPexelsKey] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [model, setModel] = useState<MsPaintModel>("claude-sonnet-4-20250514");
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"api" | "about">("api");

  useEffect(() => {
    setAnthropicKey(localStorage.getItem(LS_KEY_ANTHROPIC) || "");
    setPexelsKey(localStorage.getItem(LS_KEY_PEXELS) || "");
    setAdminToken(localStorage.getItem(LS_KEY_ADMIN) || "");
    const saved = localStorage.getItem(LS_KEY_MODEL) as MsPaintModel | null;
    if (saved && MODEL_OPTIONS.some(o => o.value === saved)) setModel(saved);
  }, []);

  const handleSave = () => {
    if (anthropicKey.trim()) {
      localStorage.setItem(LS_KEY_ANTHROPIC, anthropicKey.trim());
    } else {
      localStorage.removeItem(LS_KEY_ANTHROPIC);
    }
    if (pexelsKey.trim()) {
      localStorage.setItem(LS_KEY_PEXELS, pexelsKey.trim());
    } else {
      localStorage.removeItem(LS_KEY_PEXELS);
    }
    if (adminToken.trim()) {
      localStorage.setItem(LS_KEY_ADMIN, adminToken.trim());
    } else {
      localStorage.removeItem(LS_KEY_ADMIN);
    }
    localStorage.setItem(LS_KEY_MODEL, model);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabBtn = (tab: "api" | "about", label: string) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={cn(
        "px-3 py-1 text-[10px] font-bold font-[family-name:var(--font-system)] cursor-pointer",
        "border-2",
        activeTab === tab
          ? "bg-[var(--color-surface)] border-t-[var(--color-border-raised-dark)] border-l-[var(--color-border-raised-dark)] border-b-[var(--color-surface)] border-r-[var(--color-border-raised-light)]"
          : "bg-[var(--color-surface-inset)] border-t-[var(--color-border-raised-light)] border-l-[var(--color-border-raised-light)] border-b-[var(--color-border-raised-dark)] border-r-[var(--color-border-raised-dark)]"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-[var(--color-surface)]">
      {/* Tab bar */}
      <div className="flex gap-1 px-3 pt-3 border-b-2 border-b-[var(--color-border-raised-dark)]">
        {tabBtn("api", "API Keys")}
        {tabBtn("about", "About")}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        {activeTab === "api" && (
          <div className="space-y-4">
            <p className="text-[10px] font-[family-name:var(--font-system)] text-[var(--color-text-secondary)] leading-relaxed">
              API keys are stored in your browser (localStorage) and sent with each
              request. Your API key is never logged or stored on the server.
            </p>
            <p className="text-[9px] font-[family-name:var(--font-system)] text-[var(--color-text-muted)] leading-relaxed">
              Note: free AI drawings (without your own key) are powered by Cloudflare
              and are limited per visitor. To improve the drawing AI, the prompt,
              the generated drawing, and the resulting image are logged. Add your own
              key for unlimited drawing.
            </p>

            {/* Anthropic key */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold font-[family-name:var(--font-system)] text-[var(--color-text-primary)]">
                Anthropic API Key
              </label>
              <p className="text-[9px] font-[family-name:var(--font-system)] text-[var(--color-text-muted)]">
                Required for MS Paint AI drawing. Get yours at console.anthropic.com
              </p>
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className={cn(
                  "w-full px-2 py-1.5",
                  "text-[10px] font-[family-name:var(--font-code)]",
                  "text-[var(--color-text-primary)]",
                  "bg-[var(--color-surface-inset)]",
                  "border border-t-[var(--color-border-inset-dark)] border-l-[var(--color-border-inset-dark)]",
                  "border-b-[var(--color-border-raised-light)] border-r-[var(--color-border-raised-light)]",
                  "outline-none focus:outline-none",
                  "placeholder:text-[var(--color-text-muted)]"
                )}
              />
              {anthropicKey && (
                <p className="text-[9px] text-[var(--color-success)] font-[family-name:var(--font-system)]">
                  Key set ({anthropicKey.length} chars)
                </p>
              )}
            </div>

            {/* Model selector */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold font-[family-name:var(--font-system)] text-[var(--color-text-primary)]">
                Model
              </label>
              <div className="space-y-1.5">
                {MODEL_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex items-start gap-2 p-2 cursor-pointer",
                      "border border-t-[var(--color-border-inset-dark)] border-l-[var(--color-border-inset-dark)]",
                      "border-b-[var(--color-border-raised-light)] border-r-[var(--color-border-raised-light)]",
                      model === opt.value
                        ? "bg-[var(--color-surface-inset)]"
                        : "bg-[var(--color-surface-raised)]"
                    )}
                  >
                    <input
                      type="radio"
                      name="model"
                      value={opt.value}
                      checked={model === opt.value}
                      onChange={() => setModel(opt.value)}
                      className="mt-0.5 shrink-0"
                    />
                    <div>
                      <span className="block text-[10px] font-bold font-[family-name:var(--font-system)] text-[var(--color-text-primary)]">
                        {opt.label}
                      </span>
                      <span className="block text-[9px] font-[family-name:var(--font-system)] text-[var(--color-text-muted)]">
                        {opt.note}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Pexels key */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold font-[family-name:var(--font-system)] text-[var(--color-text-primary)]">
                Pexels API Key (optional)
              </label>
              <p className="text-[9px] font-[family-name:var(--font-system)] text-[var(--color-text-muted)]">
                Enables reference images for MS Paint. Free at pexels.com/api
              </p>
              <input
                type="password"
                value={pexelsKey}
                onChange={(e) => setPexelsKey(e.target.value)}
                placeholder="(optional)"
                className={cn(
                  "w-full px-2 py-1.5",
                  "text-[10px] font-[family-name:var(--font-code)]",
                  "text-[var(--color-text-primary)]",
                  "bg-[var(--color-surface-inset)]",
                  "border border-t-[var(--color-border-inset-dark)] border-l-[var(--color-border-inset-dark)]",
                  "border-b-[var(--color-border-raised-light)] border-r-[var(--color-border-raised-light)]",
                  "outline-none",
                  "placeholder:text-[var(--color-text-muted)]"
                )}
              />
            </div>

            {/* Operator unlock (admin token) */}
            <div className="space-y-1.5 border-t-2 border-t-[var(--color-border-raised-dark)] pt-3">
              <label className="block text-[10px] font-bold font-[family-name:var(--font-system)] text-[var(--color-text-primary)]">
                Operator Unlock (admin only)
              </label>
              <p className="text-[9px] font-[family-name:var(--font-system)] text-[var(--color-text-muted)]">
                The site operator&apos;s ADMIN_TOKEN. Unlocks server-side Claude
                drawing and any model, uncounted, on the operator&apos;s account.
                Leave blank — this is not needed for normal use.
              </p>
              <input
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                placeholder="(operator only)"
                className={cn(
                  "w-full px-2 py-1.5",
                  "text-[10px] font-[family-name:var(--font-code)]",
                  "text-[var(--color-text-primary)]",
                  "bg-[var(--color-surface-inset)]",
                  "border border-t-[var(--color-border-inset-dark)] border-l-[var(--color-border-inset-dark)]",
                  "border-b-[var(--color-border-raised-light)] border-r-[var(--color-border-raised-light)]",
                  "outline-none",
                  "placeholder:text-[var(--color-text-muted)]"
                )}
              />
              {adminToken && (
                <p className="text-[9px] text-[var(--color-success)] font-[family-name:var(--font-system)]">
                  Operator mode armed — drawings use server Claude, uncounted.
                </p>
              )}
            </div>

            {/* Save button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-bold font-[family-name:var(--font-system)] cursor-pointer",
                  "bg-[var(--color-surface-raised)]",
                  "border border-t-[var(--color-border-raised-light)] border-l-[var(--color-border-raised-light)]",
                  "border-b-[var(--color-border-raised-dark)] border-r-[var(--color-border-raised-dark)]",
                  "active:border-t-[var(--color-border-raised-dark)] active:border-l-[var(--color-border-raised-dark)]",
                  "active:border-b-[var(--color-border-raised-light)] active:border-r-[var(--color-border-raised-light)]"
                )}
              >
                Save
              </button>
              {saved && (
                <span className="text-[10px] text-[var(--color-success)] font-[family-name:var(--font-system)]">
                  Saved!
                </span>
              )}
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-3">
            <div className={cn(
              "p-3 bg-[var(--color-surface-inset)]",
              "border border-t-[var(--color-border-inset-dark)] border-l-[var(--color-border-inset-dark)]",
              "border-b-[var(--color-border-raised-light)] border-r-[var(--color-border-raised-light)]",
              "font-[family-name:var(--font-window)] text-[var(--color-titlebar-active)] text-2xl"
            )}>
              SomeClaudeSkills
            </div>
            <p className="text-[10px] font-[family-name:var(--font-system)] text-[var(--color-text-secondary)] leading-relaxed">
              A curated gallery of Claude Code skills with a Windows 3.1 aesthetic.
              192 skills and counting.
            </p>
            <p className="text-[10px] font-[family-name:var(--font-system)] text-[var(--color-text-secondary)] leading-relaxed">
              Version: website-next (Next.js 15 + Cloudflare Pages)
            </p>
            <p className="text-[9px] font-[family-name:var(--font-system)] text-[var(--color-text-muted)]">
              Built with Claude Code · Deployed on Cloudflare Pages
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
