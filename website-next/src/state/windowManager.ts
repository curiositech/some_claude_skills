import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import type { LayoutMode } from "../hooks/useViewport";

export type WindowContentType =
  // Legacy single-window skill viewer (kept for backwards compat)
  | { type: "skill"; skillId: string }
  // SKILL_DETAILS multi-window program (3 linked windows via skillNav store)
  | { type: "skill-details" }
  | { type: "skill-filetree" }
  | { type: "skill-install" }
  // Program-group browser windows
  | { type: "skills-browser" }
  | { type: "media" }
  | { type: "winamp" }
  | { type: "mspaint" }
  | { type: "mspaint-wisdom" }
  | { type: "tutorials" }
  | { type: "artifacts" }
  // Misc content windows
  | { type: "changelog" }
  | { type: "bundle"; bundleId: string }
  | { type: "about" }
  | { type: "search" }
  | { type: "mcp" }
  | { type: "agents" }
  | { type: "favorites" }
  | { type: "bundles" }
  | { type: "bait" }
  | { type: "browser"; url?: string }
  | { type: "settings" }
  | { type: "welcome" }
  | { type: "featured" }
  | { type: "startup" };

/** Saved geometry before maximize, so restore works across layout transitions */
export interface PreMaxGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  title: string;
  icon?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  /** True when this window was auto-collapsed to a title strip because
   *  another window was maximized. Renders differently from isMinimized. */
  autoMinimized?: boolean;
  /** Pre-maximize geometry stored in Zustand (survives unmount & layout transitions) */
  preMax?: PreMaxGeometry;
  zIndex: number;
  content: WindowContentType;
}

interface WindowManagerState {
  windows: WindowState[];
  activeWindowId: string | null;
  nextZIndex: number;
  /** ID of the currently maximized window (if any) */
  maximizedWindowId: string | null;
  /** Current responsive layout mode — synced from useViewport */
  layoutMode: LayoutMode;

  // Actions
  setLayoutMode: (mode: LayoutMode) => void;
  openWindow: (window: Omit<WindowState, "zIndex">) => void;
  closeWindow: (id: string) => void;
  closeAllWindows: () => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMinimize: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;
  /** Save pre-maximize geometry for a window */
  setPreMax: (id: string, geo: PreMaxGeometry) => void;
  /** Move all windows back on-screen after orientation/resize */
  reclampAllWindows: () => void;
}

// Cascade offset for new windows
let cascadeOffset = 0;
const CASCADE_STEP = 30;
const CASCADE_MAX = 180;

export const useWindowManager = create<WindowManagerState>((set, get) => ({
  windows: [],
  activeWindowId: null,
  nextZIndex: 200,
  maximizedWindowId: null,
  layoutMode: "desktop" as LayoutMode,

  setLayoutMode: (mode) =>
    set((state) => {
      const isMobile = mode === "pocket" || mode === "pda";
      if (isMobile) {
        // Force all windows fullscreen on mobile
        return {
          layoutMode: mode,
          windows: state.windows.map((w) => ({
            ...w,
            isMaximized: true,
            // Save current geometry as preMax if not already saved
            preMax: w.preMax || { x: w.x, y: w.y, width: w.width, height: w.height },
          })),
        };
      }
      // Transitioning to desktop/tablet: restore preMax geometry
      const wasOldMobile =
        state.layoutMode === "pocket" || state.layoutMode === "pda";
      if (wasOldMobile) {
        return {
          layoutMode: mode,
          windows: state.windows.map((w) =>
            w.preMax
              ? {
                  ...w,
                  isMaximized: false,
                  x: w.preMax.x,
                  y: w.preMax.y,
                  width: w.preMax.width,
                  height: w.preMax.height,
                  preMax: undefined,
                }
              : { ...w, isMaximized: false }
          ),
          maximizedWindowId: null,
        };
      }
      return { layoutMode: mode };
    }),

  openWindow: (win) =>
    set((state) => {
      // If window with same ID already exists, just focus it
      const existing = state.windows.find((w) => w.id === win.id);
      if (existing) {
        return {
          windows: state.windows.map((w) =>
            w.id === win.id
              ? { ...w, isMinimized: false, zIndex: state.nextZIndex }
              : w
          ),
          activeWindowId: win.id,
          nextZIndex: state.nextZIndex + 1,
        };
      }

      const isMobile =
        state.layoutMode === "pocket" || state.layoutMode === "pda";

      // Apply cascade offset for new windows (skip on mobile)
      if (!isMobile) {
        cascadeOffset = (cascadeOffset + CASCADE_STEP) % CASCADE_MAX;
      }

      const cascadedWin: WindowState = {
        ...win,
        x: isMobile ? 0 : win.x + cascadeOffset,
        y: isMobile ? 0 : win.y + cascadeOffset,
        isMaximized: isMobile ? true : win.isMaximized,
        preMax: isMobile
          ? { x: win.x, y: win.y, width: win.width, height: win.height }
          : win.preMax,
        zIndex: state.nextZIndex,
      };

      return {
        windows: [...state.windows, cascadedWin],
        activeWindowId: win.id,
        nextZIndex: state.nextZIndex + 1,
      };
    }),

  closeWindow: (id) =>
    set((state) => {
      const wasMaximized = state.maximizedWindowId === id;
      const remaining = state.windows
        .filter((w) => w.id !== id)
        // If the maximized window was closed, restore all auto-minimized windows
        .map((w) =>
          wasMaximized && w.autoMinimized ? { ...w, autoMinimized: false } : w
        );

      let newActive = state.activeWindowId;
      if (state.activeWindowId === id) {
        const topWindow = remaining
          .filter((w) => !w.isMinimized && !w.autoMinimized)
          .sort((a, b) => b.zIndex - a.zIndex)[0];
        newActive = topWindow?.id || null;
      }
      return {
        windows: remaining,
        activeWindowId: newActive,
        maximizedWindowId: wasMaximized ? null : state.maximizedWindowId,
      };
    }),

  closeAllWindows: () =>
    set({ windows: [], activeWindowId: null, maximizedWindowId: null }),

  focusWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: state.nextZIndex } : w
      ),
      activeWindowId: id,
      nextZIndex: state.nextZIndex + 1,
    })),

  minimizeWindow: (id) =>
    set((state) => {
      const remaining = state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w
      );
      let newActive = state.activeWindowId;
      if (state.activeWindowId === id) {
        const topWindow = remaining
          .filter((w) => !w.isMinimized && !w.autoMinimized)
          .sort((a, b) => b.zIndex - a.zIndex)[0];
        newActive = topWindow?.id || null;
      }
      return { windows: remaining, activeWindowId: newActive };
    }),

  maximizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id === id) return { ...w, isMaximized: true, zIndex: state.nextZIndex };
        // Collapse all visible (non-minimized, non-already-autoMinimized) windows to strips
        if (!w.isMinimized && !w.autoMinimized) return { ...w, autoMinimized: true };
        return w;
      }),
      activeWindowId: id,
      maximizedWindowId: id,
      nextZIndex: state.nextZIndex + 1,
    })),

  restoreWindow: (id) =>
    set((state) => {
      const wasMaximized = state.maximizedWindowId === id;
      return {
        windows: state.windows.map((w) => {
          if (w.id === id)
            return {
              ...w,
              isMinimized: false,
              isMaximized: false,
              autoMinimized: false,
              zIndex: state.nextZIndex,
            };
          // If restoring the maximized window, bring back all auto-minimized windows
          if (wasMaximized && w.autoMinimized)
            return { ...w, autoMinimized: false };
          return w;
        }),
        activeWindowId: id,
        maximizedWindowId: wasMaximized ? null : state.maximizedWindowId,
        nextZIndex: state.nextZIndex + 1,
      };
    }),

  toggleMinimize: (id) => {
    const state = get();
    const win = state.windows.find((w) => w.id === id);
    if (!win) return;
    if (win.isMinimized) {
      state.restoreWindow(id);
    } else {
      state.minimizeWindow(id);
    }
  },

  moveWindow: (id, x, y) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, x, y } : w
      ),
    })),

  resizeWindow: (id, width, height) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, width, height } : w
      ),
    })),

  setPreMax: (id, geo) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, preMax: geo } : w
      ),
    })),

  reclampAllWindows: () =>
    set((state) => {
      if (typeof window === "undefined") return state;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      return {
        windows: state.windows.map((w) => {
          if (w.isMaximized || w.isMinimized) return w;
          const x = Math.max(0, Math.min(w.x, vw - 100));
          const y = Math.max(0, Math.min(w.y, vh - 50));
          const width = Math.min(w.width, vw);
          const height = Math.min(w.height, vh);
          return { ...w, x, y, width, height };
        }),
      };
    }),
}));

// Selector hooks for common patterns
export const useActiveWindow = () =>
  useWindowManager(useShallow((s) => s.windows.find((w) => w.id === s.activeWindowId)));

export const useVisibleWindows = () =>
  useWindowManager(useShallow((s) => s.windows.filter((w) => !w.isMinimized && !w.autoMinimized)));

export const useMinimizedWindows = () =>
  useWindowManager(useShallow((s) => s.windows.filter((w) => w.isMinimized && !w.autoMinimized)));

export const useAutoMinimizedWindows = () =>
  useWindowManager(useShallow((s) => s.windows.filter((w) => w.autoMinimized)));

export const useIsWindowOpen = (id: string) =>
  useWindowManager((s) => s.windows.some((w) => w.id === id));

export const useLayoutMode = () =>
  useWindowManager((s) => s.layoutMode);
