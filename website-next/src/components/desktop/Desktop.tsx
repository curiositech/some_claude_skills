"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useWindowManager, useAutoMinimizedWindows } from "@/state/windowManager";
import { useShallow } from "zustand/shallow";
import type { WindowState } from "@/state/windowManager";
import { useSkillsData } from "@/state/skillsData";
import { useViewport } from "@/hooks/useViewport";
import { Win31Background, Win31Window, Win31Dialog } from "@/components/win31";
import { MobileShell } from "./MobileShell";
import {
  openSkillDetails,
  openChangelogWindow,
  openMcpWindow,
  openAgentsWindow,
  openBundlesWindow,
  openAboutWindow,
  openFavoritesWindow,
  openBaitWindow,
  openSkillsBrowserWindow,
  openMediaWindow,
  openMSPaintWisdomWindow,
  openTutorialsWindow,
  openArtifactsWindow,
  openWelcomeWindow,
  openBrowserWindow,
  openSettingsWindow,
  openFeaturedWindow,
} from "@/lib/windowHelpers";
import { cn } from "@/lib/utils";
import { SkillsManagerWindow } from "./SkillsManagerWindow";
import { CategoryWindow } from "./CategoryWindow";
import { SkillWindow } from "./SkillWindow";
import { SkillDetailsContent } from "./SkillDetailsContent";
import { SkillFileTreeContent } from "./SkillFileTreeContent";
import { SkillInstallContent } from "./SkillInstallContent";
import { SkillsBrowserWindow } from "./SkillsBrowserWindow";
import { MediaWindow } from "./MediaWindow";
import { WinampWindow } from "./WinampWindow";
import { MSPaintWindow } from "./MSPaintWindow";
import { MSPaintWisdomWindow } from "./MSPaintWisdomWindow";
import { TutorialsWindow } from "./TutorialsWindow";
import { ArtifactsWindow } from "./ArtifactsWindow";
import { Taskbar } from "./Taskbar";
import { MenuBar } from "./MenuBar";
import { SplashScreen } from "./SplashScreen";
import { ChangelogWindow } from "./ChangelogWindow";
import { McpWindow } from "./McpWindow";
import { AgentsWindow } from "./AgentsWindow";
import { BundlesWindow } from "./BundlesWindow";
import { AboutWindow } from "./AboutWindow";
import { FavoritesWindow } from "./FavoritesWindow";
import { BaitWindow } from "./BaitWindow";
import { BrowserWindow } from "./BrowserWindow";
import { SettingsWindow } from "./SettingsWindow";
import { WelcomeWindow } from "./WelcomeWindow";
import { FeaturedWindow } from "./FeaturedWindow";
import { StartupWindow } from "./StartupWindow";
import { SiteBanner } from "./SiteBanner";
import type { Skill } from "@/types/skill";

/* ─── WindowStrip ───────────────────────────────────────────────────────── */

/**
 * A minimized title-bar chip shown above the taskbar when another window is
 * maximized. Clicking it opens a Win31 control menu.
 */
function WindowStrip({ win }: { win: WindowState }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const restoreWindow  = useWindowManager((s) => s.restoreWindow);
  const maximizeWindow = useWindowManager((s) => s.maximizeWindow);
  const closeWindow    = useWindowManager((s) => s.closeWindow);
  const activeId       = useWindowManager((s) => s.activeWindowId);
  const isActive = activeId === win.id;

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div ref={ref} className="relative shrink-0" style={{ width: 100 }}>
      {/* Title bar chip */}
      <button
        onClick={() => setMenuOpen((p) => !p)}
        className={cn(
          "w-full h-[var(--win31-titlebar-height)] flex items-center gap-1 px-0.5 select-none cursor-pointer",
          isActive
            ? "bg-[var(--color-titlebar-active)]"
            : "bg-[var(--color-titlebar-inactive)]",
          "border-2",
          "border-t-[var(--color-border-raised-light)] border-l-[var(--color-border-raised-light)]",
          "border-b-[var(--color-border-raised-dark)] border-r-[var(--color-border-raised-dark)]"
        )}
      >
        <span className="w-3 h-2.5 inline-flex items-center justify-center bg-[var(--color-surface)] shrink-0 border border-[var(--color-border-inset-dark)]">
          <span className="text-[5px] leading-none text-[var(--color-text-primary)]">■</span>
        </span>
        <span className="font-[family-name:var(--font-window)] text-[10px] text-[var(--color-titlebar-text)] truncate flex-1">
          {win.title}
        </span>
      </button>

      {/* Control menu */}
      {menuOpen && (
        <div className={cn(
          "absolute bottom-full left-0 mb-px z-[9999] min-w-[140px]",
          "bg-[var(--color-surface)]",
          "border-2",
          "border-t-[var(--color-border-raised-light)] border-l-[var(--color-border-raised-light)]",
          "border-b-[var(--color-border-raised-dark)] border-r-[var(--color-border-raised-dark)]",
          "shadow-[2px_2px_4px_rgba(0,0,0,0.3)] py-0.5"
        )}>
          {[
            { label: "Restore",  action: "restore",  disabled: false },
            { label: "Minimize", action: "minimize", disabled: true },
            { label: "Maximize", action: "maximize", disabled: false },
            null, // separator
            { label: "Close",    action: "close",    disabled: false, shortcut: "Alt+F4" },
          ].map((item, idx) =>
            item === null ? (
              <div key={idx} className="mx-1 my-0.5 border-t border-t-[var(--color-border-inset-light)] border-b border-b-[var(--color-border-inset-dark)]" />
            ) : (
              <button
                key={idx}
                disabled={item.disabled}
                onClick={() => {
                  setMenuOpen(false);
                  if (item.action === "restore")  restoreWindow(win.id);
                  if (item.action === "maximize") maximizeWindow(win.id);
                  if (item.action === "close")    closeWindow(win.id);
                }}
                className={cn(
                  "w-full text-left px-4 py-0.5 flex justify-between items-center",
                  "font-[family-name:var(--font-system)] text-xs",
                  "text-[var(--color-text-primary)]",
                  "disabled:text-[var(--color-text-muted)] disabled:cursor-default",
                  "enabled:hover:bg-[var(--color-titlebar-active)] enabled:hover:text-[var(--color-titlebar-text)]"
                )}
              >
                <span>{item.label}</span>
                {"shortcut" in item && item.shortcut && (
                  <span className="ml-4 text-[10px]">{item.shortcut}</span>
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface DesktopProps {
  initialOpenSkill?: string;
  initialWindow?: { type: string };
}

/* ─── MDI category window state ─────────────────────────────────────────── */

interface MDIWindowInfo {
  isOpen: boolean;
  zIndex: number;
}

/** Diagonal cascade — new windows stagger from top-left */
function getCascadePos(idx: number): { x: number; y: number } {
  const STEP = 24;
  const col = idx % 12;
  return { x: 680 + col * STEP, y: 30 + col * STEP };
}

/* ─── Desktop Component ─────────────────────────────────────────────────── */

/**
 * Desktop - Windows 3.1 Program Manager shell.
 *
 * Layout:
 *   - Wallpaper background image
 *   - SkillsManagerWindow (always visible, Program Manager style)
 *     └─ Folder icons per category; double-click opens CategoryWindow
 *   - CategoryWindows (floating Win31MDIWindow per opened category)
 *   - Floating Win31Windows (skill detail, MCP, agents, etc. via Zustand)
 *   - Taskbar at bottom
 *
 * Z-index layers:
 *   - SkillsManagerWindow: z-index 10 (base)
 *   - CategoryWindows:     z-index 50–149 (managed by mdiZCounter)
 *   - Floating windows:    z-index 200+ (Zustand store starts at 200)
 */
export function Desktop({
  initialOpenSkill,
  initialWindow,
}: DesktopProps) {
  /* ─── Skills data from Zustand store (loaded from /data/skills.json) ──── */

  const skills = useSkillsData(useShallow((s) => s.skills));
  const categories = useSkillsData(useShallow((s) => s.categories));
  const skillsByCategory = useSkillsData(useShallow((s) => s.skillsByCategory));
  const dataReady = useSkillsData((s) => s.initialized);
  /* ─── Viewport / responsive ──────────────────────────────────────────── */

  const { layoutMode, isMobile } = useViewport();
  const setLayoutMode = useWindowManager((s) => s.setLayoutMode);

  const reclampAllWindows = useWindowManager((s) => s.reclampAllWindows);

  // Sync viewport layoutMode → Zustand store
  useEffect(() => {
    setLayoutMode(layoutMode);
  }, [layoutMode, setLayoutMode]);

  // On orientation change or resize across breakpoints, reclamp windows
  useEffect(() => {
    const handler = () => reclampAllWindows();
    window.addEventListener("orientationchange", handler);
    return () => window.removeEventListener("orientationchange", handler);
  }, [reclampAllWindows]);

  /* ─── Floating window manager (Zustand) ─────────────────────────────── */

  const windows = useWindowManager(useShallow((s) => s.windows.filter((w) => !w.autoMinimized)));
  const autoMinimizedWindows = useAutoMinimizedWindows();
  const activeWindowId = useWindowManager((s) => s.activeWindowId);
  const closeWindow = useWindowManager((s) => s.closeWindow);
  const focusWindow = useWindowManager((s) => s.focusWindow);
  const minimizeWindow = useWindowManager((s) => s.minimizeWindow);
  const maximizeWindow = useWindowManager((s) => s.maximizeWindow);
  const restoreWindow = useWindowManager((s) => s.restoreWindow);
  const moveWindow = useWindowManager((s) => s.moveWindow);
  const resizeWindow = useWindowManager((s) => s.resizeWindow);

  /* ─── Program Manager z-index (participates in global z-order) ──────── */

  const [pmZIndex, setPmZIndex] = useState(10);
  const pmIsActive = activeWindowId === "__pm__";

  const focusPM = useCallback(() => {
    const store = useWindowManager.getState();
    setPmZIndex(store.nextZIndex);
    // Bump the global counter and clear the active floating window
    useWindowManager.setState({
      nextZIndex: store.nextZIndex + 1,
      activeWindowId: "__pm__",
    });
  }, []);

  /* ─── MDI category window state ─────────────────────────────────────── */

  const [mdiState, setMdiState] = useState<Record<string, MDIWindowInfo>>({});

  const mdiZCounterRef = useRef(50);

  // Re-initialize MDI state when categories load
  useEffect(() => {
    if (categories.length === 0) return;
    setMdiState((prev) => {
      const next: Record<string, MDIWindowInfo> = {};
      categories.forEach((cat, idx) => {
        next[cat] = prev[cat] ?? { isOpen: false, zIndex: 50 + idx };
      });
      return next;
    });
    mdiZCounterRef.current = 50 + categories.length;
  }, [categories]);
  const [activeMDI, setActiveMDI] = useState<string | null>(null);

  const openCategory = useCallback((category: string) => {
    mdiZCounterRef.current += 1;
    const newZ = mdiZCounterRef.current;
    setMdiState((prev) => ({
      ...prev,
      [category]: { isOpen: true, zIndex: newZ },
    }));
    setActiveMDI(category);
  }, []);

  const focusMDI = useCallback((category: string) => {
    mdiZCounterRef.current += 1;
    const newZ = mdiZCounterRef.current;
    setMdiState((prev) => ({
      ...prev,
      [category]: { ...prev[category], isOpen: true, zIndex: newZ },
    }));
    setActiveMDI(category);
  }, []);

  const closeMDI = useCallback((category: string) => {
    setMdiState((prev) => ({
      ...prev,
      [category]: { ...prev[category], isOpen: false },
    }));
    setActiveMDI(null);
  }, []);

  const openCategories = new Set(
    Object.entries(mdiState)
      .filter(([, v]) => v.isOpen)
      .map(([k]) => k)
  );

  /* ─── Splash screen ──────────────────────────────────────────────────── */

  const [splashVisible, setSplashVisible] = useState(true);

  /* ─── About dialog ───────────────────────────────────────────────────── */

  const [aboutOpen, setAboutOpen] = useState(false);

  /* ─── Load skill data from static JSON ─────────────────────────────── */

  useEffect(() => {
    useSkillsData.getState().load();
  }, []);

  /* ─── Open initial window once data is ready ────────────────────────── */

  const initialWindowOpenedRef = useRef(false);

  useEffect(() => {
    if (!dataReady || initialWindowOpenedRef.current) return;
    initialWindowOpenedRef.current = true;

    if (initialOpenSkill) {
      const skill = skills.find((s) => s.id === initialOpenSkill);
      if (skill) openSkillDetails(skill.id, skill.title);
    } else if (initialWindow) {
      switch (initialWindow.type) {
        case "mcp":            openMcpWindow();            break;
        case "agents":         openAgentsWindow();         break;
        case "bundles":        openBundlesWindow();        break;
        case "changelog":      openChangelogWindow();      break;
        case "about":          openAboutWindow();          break;
        case "favorites":      openFavoritesWindow();      break;
        case "bait":           openBaitWindow();           break;
        case "skills-browser": openSkillsBrowserWindow();  break;
        case "media":          openMediaWindow();          break;
        case "mspaint-wisdom": openMSPaintWisdomWindow();  break;
        case "tutorials":      openTutorialsWindow();      break;
        case "artifacts":      openArtifactsWindow();      break;
        case "browser":        openBrowserWindow();        break;
        case "settings":       openSettingsWindow();       break;
        case "welcome":        openWelcomeWindow();        break;
        case "featured":       openFeaturedWindow();       break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataReady]);

  /* ─── First-boot window choreography ──────────────────────────────── */
  //
  // Like Windows 3.1's Startup folder: items auto-launch on first visit.
  //
  // Desktop first visit: Splash → staggered cascade:
  //   +400ms  Skills Browser (back layer, reference)
  //   +600ms  Featured (mid-left, shows curated picks)
  //   +900ms  Welcome (front, greeting & guide)
  //
  // Mobile first visit: Splash → Welcome fullscreen (+400ms). One window only.
  //
  // Return visits (both): Splash → clean desk. No choreography.

  const choreographyDoneRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !dataReady || choreographyDoneRef.current) return;
    choreographyDoneRef.current = true;
    // Skip choreography on deep-linked routes (initialWindow/initialOpenSkill)
    if (initialWindow || initialOpenSkill) return;
    const seen = localStorage.getItem("scs_welcome_shown");
    if (!seen) {
      const mode = useWindowManager.getState().layoutMode;
      const isMobileMode = mode === "pocket" || mode === "pda";
      const timers: ReturnType<typeof setTimeout>[] = [];

      if (isMobileMode) {
        // Mobile: Welcome fullscreen only
        timers.push(setTimeout(() => openWelcomeWindow(), 400));
      } else {
        // Desktop: Startup folder items open in a staggered cascade
        timers.push(setTimeout(() => openSkillsBrowserWindow(), 400));
        timers.push(setTimeout(() => openFeaturedWindow(), 600));
        timers.push(setTimeout(() => openWelcomeWindow(), 900));
      }

      localStorage.setItem("scs_welcome_shown", "1");
      return () => timers.forEach(clearTimeout);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataReady]);

  /* ─── Skill lookup ───────────────────────────────────────────────────── */

  const findSkill = useCallback(
    (id: string): Skill | undefined => skills.find((s) => s.id === id),
    [skills]
  );

  /* ─── Render floating window content ────────────────────────────────── */

  const renderWindowContent = useCallback(
    (win: (typeof windows)[number]) => {
      switch (win.content.type) {
        case "skill": {
          const skill = findSkill(win.content.skillId);
          if (!skill) return (
            <div className="p-4 font-[family-name:var(--font-system)] text-xs text-[var(--color-text-secondary)]">
              Skill not found: {win.content.skillId}
            </div>
          );
          return <SkillWindow skill={skill} />;
        }
        // SKILL_DETAILS multi-window program
        case "skill-details":  return <SkillDetailsContent />;
        case "skill-filetree": return <SkillFileTreeContent />;
        case "skill-install":  return <SkillInstallContent />;
        // Program group windows
        case "skills-browser": return <SkillsBrowserWindow />;
        case "media":     return <MediaWindow />;
        case "winamp":    return <WinampWindow />;
        case "mspaint":   return <MSPaintWindow />;
        case "mspaint-wisdom": return <MSPaintWisdomWindow />;
        case "tutorials": return <TutorialsWindow />;
        case "artifacts": return <ArtifactsWindow />;
        // Content windows
        case "changelog": return <ChangelogWindow />;
        case "mcp":       return <McpWindow />;
        case "agents":    return <AgentsWindow />;
        case "bundles":   return <BundlesWindow />;
        case "about":     return <AboutWindow />;
        case "favorites": return <FavoritesWindow />;
        case "bait":      return <BaitWindow />;
        case "browser":   return <BrowserWindow initialUrl={(win.content as { type: "browser"; url?: string }).url} />;
        case "settings":  return <SettingsWindow />;
        case "welcome":   return <WelcomeWindow />;
        case "featured":  return <FeaturedWindow />;
        case "startup":   return <StartupWindow />;
        case "search":
          return (
            <div className="p-4 font-[family-name:var(--font-system)] text-xs text-[var(--color-text-primary)]">
              <p className="font-bold mb-2 text-[var(--color-text-accent)]">Find Skills</p>
              <p className="text-[var(--color-text-secondary)]">Search coming soon. Browse categories below.</p>
            </div>
          );
        default:
          return (
            <div className="p-4 font-[family-name:var(--font-system)] text-xs text-[var(--color-text-secondary)]">
              Window content unavailable.
            </div>
          );
      }
    },
    [findSkill]
  );

  /* ─── Render ────────────────────────────────────────────────────────── */

  // Mobile: pocket organizer layout
  if (isMobile) {
    return (
      <>
        <SiteBanner />
        {splashVisible && (
          <SplashScreen onDismiss={() => setSplashVisible(false)} />
        )}
        <MobileShell
          layoutMode={layoutMode}
          renderWindowContent={renderWindowContent}
        />
      </>
    );
  }

  // Desktop / Tablet: classic Win31 shell
  return (
    <>
      <SiteBanner />
      {/* Splash screen — shown on first load, reopened via Help > About */}
      {splashVisible && (
        <SplashScreen onDismiss={() => setSplashVisible(false)} />
      )}

      <div className="h-screen w-screen overflow-hidden flex flex-col">
        {/* ── Win31 menu bar at the very top ── */}
        <MenuBar onShowSplash={() => setSplashVisible(true)} />

        <Win31Background
          className={cn("flex-1 relative overflow-hidden", "!min-h-0")}
        >
          {/* ── Layer 1: Skills Program Manager (always visible) ── */}
          <SkillsManagerWindow
            zIndex={pmZIndex}
            isActive={pmIsActive}
            onFocus={focusPM}
          />

          {/* ── Layer 2: Open category windows ── */}
          {categories.map((category, idx) => {
            const mdi = mdiState[category];
            if (!mdi?.isOpen) return null;
            const pos = getCascadePos(idx);
            return (
              <CategoryWindow
                key={category}
                category={category}
                skills={skillsByCategory[category] || []}
                initialX={pos.x}
                initialY={pos.y}
                isActive={activeMDI === category}
                zIndex={mdi.zIndex}
                onClose={() => closeMDI(category)}
                onFocus={() => focusMDI(category)}
              />
            );
          })}

          {/* ── Layer 3: Floating skill/app windows (Zustand, z-index 200+) ── */}
          {windows.map((win) => (
            <Win31Window
              key={win.id}
              title={win.title}
              initialX={win.x}
              initialY={win.y}
              initialWidth={win.width}
              initialHeight={win.height}
              isActive={win.id === activeWindowId}
              zIndex={win.zIndex}
              isMinimized={win.isMinimized}
              isMaximized={win.isMaximized}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              onMaximize={() => maximizeWindow(win.id)}
              onRestore={() => restoreWindow(win.id)}
              onFocus={() => focusWindow(win.id)}
              onMove={(x, y) => moveWindow(win.id, x, y)}
              onResize={(w, h) => resizeWindow(win.id, w, h)}
            >
              {renderWindowContent(win)}
            </Win31Window>
          ))}

          {/* ── Layer 4: Auto-minimized title-bar strips (above taskbar) ── */}
          {autoMinimizedWindows.length > 0 && (
            <div
              className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-1 px-1 pb-1"
              style={{ zIndex: 9000 }}
            >
              {autoMinimizedWindows.map((win) => (
                <WindowStrip key={win.id} win={win} />
              ))}
            </div>
          )}
        </Win31Background>

        {/* Taskbar */}
        <Taskbar
          categories={categories}
          onCategoryClick={openCategory}
          onAboutClick={() => setAboutOpen(true)}
        />
      </div>

      {/* About dialog */}
      <Win31Dialog
        open={aboutOpen}
        onOpenChange={setAboutOpen}
        title="About Some Claude Skills"
        width="max-w-sm"
      >
        <div className="flex flex-col gap-3 text-center">
          <div className={cn("text-lg font-bold", "font-[family-name:var(--font-window)]", "text-[var(--color-text-accent)]")}>
            Some Claude Skills
          </div>
          <div className="text-xs text-[var(--color-text-secondary)]">Version 0.3.0</div>
          <div className={cn("border-t border-b py-2 my-1", "border-t-[var(--color-border-inset-light)]", "border-b-[var(--color-border-inset-dark)]")}>
            <p className="text-xs">
              A curated gallery of{" "}
              <strong className="text-[var(--color-text-accent)]">{skills.length}</strong>{" "}
              Claude Code skills across{" "}
              <strong className="text-[var(--color-text-accent)]">{categories.length}</strong>{" "}
              categories.
            </p>
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            Built with Next.js, Zustand, and Radix UI.<br />
            Windows 3.1 aesthetic. Modern engineering.
          </p>
        </div>
      </Win31Dialog>
    </>
  );
}
