/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WINDOWS 3.1 WINDOW MANAGER - Zustand Store
 * 
 * Authentic Win31 behavior:
 * - Single control menu button (not three like Win95)
 * - Minimized windows become "parked icons" at bottom
 * - No taskbar - Program Manager is navigation
 * - MDI (Multiple Document Interface) support
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface Win31App {
  id: string;
  title: string;
  icon: string;
  exeName: string; // e.g., "NOTEPAD.EXE"
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  isResizable: boolean;
  hasMenuBar: boolean;
  menuItems?: MenuDefinition[];
}

export interface MenuDefinition {
  label: string;
  accelerator?: string; // e.g., "F" for &File
  items: MenuItemDefinition[];
}

export type MenuItemDefinition = {
  label: string;
  accelerator?: string;
  shortcut?: string; // e.g., "Ctrl+O"
  action?: string;
  disabled?: boolean;
  separator?: false;
} | {
  separator: true;
  label?: never;
  accelerator?: never;
  shortcut?: never;
  action?: never;
  disabled?: never;
};

export type WindowState = 'normal' | 'minimized' | 'maximized';

export interface WindowInstance {
  instanceId: string;
  appId: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  state: WindowState;
  zIndex: number;
  isActive: boolean;
  // For restore after maximize
  previousPosition?: { x: number; y: number };
  previousSize?: { width: number; height: number };
}

export interface DesktopState {
  windows: WindowInstance[];
  activeWindowId: string | null;
  nextZIndex: number;
  isMobile: boolean;
  
  // Actions
  launchApp: (appId: string, initialProps?: Partial<WindowInstance>) => string;
  closeWindow: (instanceId: string) => void;
  minimizeWindow: (instanceId: string) => void;
  maximizeWindow: (instanceId: string) => void;
  restoreWindow: (instanceId: string) => void;
  focusWindow: (instanceId: string) => void;
  moveWindow: (instanceId: string, x: number, y: number) => void;
  resizeWindow: (instanceId: string, width: number, height: number) => void;
  setWindowTitle: (instanceId: string, title: string) => void;
  setMobile: (isMobile: boolean) => void;
  cascadeWindows: () => void;
  tileWindows: () => void;
  closeAllWindows: () => void;
  getWindow: (instanceId: string) => WindowInstance | undefined;
}

// ═══════════════════════════════════════════════════════════════════════════
// APP REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

export const appRegistry: Record<string, Win31App> = {
  'program-manager': {
    id: 'program-manager',
    title: 'Program Manager',
    icon: '📁',
    exeName: 'PROGMAN.EXE',
    defaultSize: { width: 700, height: 500 },
    minSize: { width: 300, height: 200 },
    isResizable: true,
    hasMenuBar: true,
    menuItems: [
      {
        label: 'File',
        accelerator: 'F',
        items: [
          { label: 'New...', shortcut: 'Ctrl+N', action: 'new' },
          { label: 'Open', shortcut: 'Enter', action: 'open' },
          { separator: true },
          { label: 'Exit Windows...', action: 'exit' },
        ],
      },
      {
        label: 'Options',
        accelerator: 'O',
        items: [
          { label: 'Auto Arrange', action: 'auto-arrange' },
          { label: 'Minimize on Use', action: 'minimize-on-use' },
          { separator: true },
          { label: 'Save Settings on Exit', action: 'save-settings' },
        ],
      },
      {
        label: 'Window',
        accelerator: 'W',
        items: [
          { label: 'Cascade', shortcut: 'Shift+F5', action: 'cascade' },
          { label: 'Tile', shortcut: 'Shift+F4', action: 'tile' },
          { label: 'Arrange Icons', action: 'arrange-icons' },
        ],
      },
      {
        label: 'Help',
        accelerator: 'H',
        items: [
          { label: 'Contents', shortcut: 'F1', action: 'help-contents' },
          { separator: true },
          { label: 'About Program Manager...', action: 'about' },
        ],
      },
    ],
  },
  'dageeves': {
    id: 'dageeves',
    title: 'File Manager',
    icon: '🗄️',
    exeName: 'DAGEEVES.EXE',
    defaultSize: { width: 650, height: 450 },
    minSize: { width: 400, height: 300 },
    isResizable: true,
    hasMenuBar: true,
    menuItems: [
      {
        label: 'File',
        accelerator: 'F',
        items: [
          { label: 'New Query...', shortcut: 'Ctrl+N', action: 'new-query' },
          { label: 'Open...', shortcut: 'Ctrl+O', action: 'open' },
          { separator: true },
          { label: 'Execute', shortcut: 'F5', action: 'execute' },
          { separator: true },
          { label: 'Exit', action: 'close' },
        ],
      },
      {
        label: 'View',
        accelerator: 'V',
        items: [
          { label: 'Tree Only', action: 'view-tree' },
          { label: 'Directory Only', action: 'view-dir' },
          { label: 'Tree and Directory', action: 'view-both' },
          { separator: true },
          { label: 'Refresh', shortcut: 'F5', action: 'refresh' },
        ],
      },
      {
        label: 'Help',
        accelerator: 'H',
        items: [
          { label: 'Contents', shortcut: 'F1', action: 'help' },
          { label: 'About...', action: 'about' },
        ],
      },
    ],
  },
  'terminal': {
    id: 'terminal',
    title: 'MS-DOS Prompt',
    icon: '💻',
    exeName: 'TERMINAL.EXE',
    defaultSize: { width: 600, height: 400 },
    minSize: { width: 400, height: 200 },
    isResizable: true,
    hasMenuBar: true,
    menuItems: [
      {
        label: 'Edit',
        accelerator: 'E',
        items: [
          { label: 'Copy', shortcut: 'Ctrl+C', action: 'copy' },
          { label: 'Paste', shortcut: 'Ctrl+V', action: 'paste' },
          { separator: true },
          { label: 'Select All', shortcut: 'Ctrl+A', action: 'select-all' },
        ],
      },
      {
        label: 'Settings',
        accelerator: 'S',
        items: [
          { label: 'Font...', action: 'font' },
          { label: 'Colors...', action: 'colors' },
        ],
      },
    ],
  },
  'notepad': {
    id: 'notepad',
    title: 'Notepad',
    icon: '📝',
    exeName: 'NOTEPAD.EXE',
    defaultSize: { width: 500, height: 400 },
    minSize: { width: 300, height: 200 },
    isResizable: true,
    hasMenuBar: true,
    menuItems: [
      {
        label: 'File',
        accelerator: 'F',
        items: [
          { label: 'New', shortcut: 'Ctrl+N', action: 'new' },
          { label: 'Open...', shortcut: 'Ctrl+O', action: 'open' },
          { label: 'Save', shortcut: 'Ctrl+S', action: 'save' },
          { label: 'Save As...', action: 'save-as' },
          { separator: true },
          { label: 'Exit', action: 'close' },
        ],
      },
      {
        label: 'Edit',
        accelerator: 'E',
        items: [
          { label: 'Undo', shortcut: 'Ctrl+Z', action: 'undo' },
          { separator: true },
          { label: 'Cut', shortcut: 'Ctrl+X', action: 'cut' },
          { label: 'Copy', shortcut: 'Ctrl+C', action: 'copy' },
          { label: 'Paste', shortcut: 'Ctrl+V', action: 'paste' },
          { separator: true },
          { label: 'Find...', shortcut: 'Ctrl+F', action: 'find' },
        ],
      },
      {
        label: 'Help',
        accelerator: 'H',
        items: [
          { label: 'Contents', shortcut: 'F1', action: 'help' },
          { label: 'About Notepad...', action: 'about' },
        ],
      },
    ],
  },
  'clock': {
    id: 'clock',
    title: 'Clock',
    icon: '🕐',
    exeName: 'CLOCK.EXE',
    defaultSize: { width: 200, height: 200 },
    minSize: { width: 100, height: 100 },
    isResizable: true,
    hasMenuBar: true,
    menuItems: [
      {
        label: 'Settings',
        accelerator: 'S',
        items: [
          { label: 'Analog', action: 'analog' },
          { label: 'Digital', action: 'digital' },
          { separator: true },
          { label: 'Set Date/Time...', action: 'set-time' },
        ],
      },
    ],
  },
  'winamp': {
    id: 'winamp',
    title: 'Winamp',
    icon: '🎵',
    exeName: 'WINAMP.EXE',
    defaultSize: { width: 275, height: 116 },
    minSize: { width: 275, height: 116 },
    isResizable: false,
    hasMenuBar: false,
  },
  'skill-viewer': {
    id: 'skill-viewer',
    title: 'Skill Viewer',
    icon: '📄',
    exeName: 'SKILLVW.EXE',
    defaultSize: { width: 520, height: 450 },
    minSize: { width: 400, height: 300 },
    isResizable: true,
    hasMenuBar: true,
    menuItems: [
      {
        label: 'File',
        accelerator: 'F',
        items: [
          { label: 'Install Skill', shortcut: 'Ctrl+I', action: 'install' },
          { label: 'Copy Install Command', shortcut: 'Ctrl+C', action: 'copy' },
          { separator: true },
          { label: 'Close', action: 'close' },
        ],
      },
      {
        label: 'Help',
        accelerator: 'H',
        items: [
          { label: 'About This Skill...', action: 'about' },
        ],
      },
    ],
  },
  'solitaire': {
    id: 'solitaire',
    title: 'Solitaire',
    icon: '🃏',
    exeName: 'SOL.EXE',
    defaultSize: { width: 640, height: 480 },
    minSize: { width: 500, height: 400 },
    isResizable: true,
    hasMenuBar: true,
    menuItems: [
      {
        label: 'Game',
        accelerator: 'G',
        items: [
          { label: 'Deal', shortcut: 'F2', action: 'deal' },
          { separator: true },
          { label: 'Undo', shortcut: 'Ctrl+Z', action: 'undo' },
          { separator: true },
          { label: 'Exit', action: 'close' },
        ],
      },
      {
        label: 'Options',
        accelerator: 'O',
        items: [
          { label: 'Deck...', action: 'deck' },
          { label: 'Scoring...', action: 'scoring' },
        ],
      },
      {
        label: 'Help',
        accelerator: 'H',
        items: [
          { label: 'Contents', shortcut: 'F1', action: 'help' },
          { label: 'About Solitaire...', action: 'about' },
        ],
      },
    ],
  },
  'control-panel': {
    id: 'control-panel',
    title: 'Control Panel',
    icon: '⚙️',
    exeName: 'CONTROL.EXE',
    defaultSize: { width: 400, height: 350 },
    minSize: { width: 300, height: 250 },
    isResizable: true,
    hasMenuBar: true,
    menuItems: [
      {
        label: 'Settings',
        accelerator: 'S',
        items: [
          { label: 'Colors...', action: 'colors' },
          { label: 'Desktop...', action: 'desktop' },
          { separator: true },
          { label: 'Exit', action: 'close' },
        ],
      },
      {
        label: 'Help',
        accelerator: 'H',
        items: [
          { label: 'Contents', shortcut: 'F1', action: 'help' },
          { label: 'About Control Panel...', action: 'about' },
        ],
      },
    ],
  },
  'calculator': {
    id: 'calculator',
    title: 'Calculator',
    icon: '🔢',
    exeName: 'CALC.EXE',
    defaultSize: { width: 260, height: 320 },
    minSize: { width: 200, height: 260 },
    isResizable: false,
    hasMenuBar: true,
    menuItems: [
      {
        label: 'Edit',
        accelerator: 'E',
        items: [
          { label: 'Copy', shortcut: 'Ctrl+C', action: 'copy' },
          { label: 'Paste', shortcut: 'Ctrl+V', action: 'paste' },
        ],
      },
      {
        label: 'View',
        accelerator: 'V',
        items: [
          { label: 'Standard', action: 'standard' },
          { label: 'Scientific', action: 'scientific' },
        ],
      },
      {
        label: 'Help',
        accelerator: 'H',
        items: [
          { label: 'Contents', shortcut: 'F1', action: 'help' },
          { label: 'About Calculator...', action: 'about' },
        ],
      },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════════════

let instanceCounter = 0;

export const useWindowManager = create<DesktopState>((set, get) => ({
  windows: [],
  activeWindowId: null,
  nextZIndex: 1,
  isMobile: false,

  launchApp: (appId: string, initialProps?: Partial<WindowInstance>) => {
    const app = appRegistry[appId];
    if (!app) {
      console.error(`App not found: ${appId}`);
      return '';
    }

    const instanceId = `${appId}-${++instanceCounter}`;
    const state = get();
    
    // Calculate cascade position
    const openCount = state.windows.filter(w => w.state !== 'minimized').length;
    const cascadeOffset = (openCount % 10) * 30;
    
    const newWindow: WindowInstance = {
      instanceId,
      appId,
      title: app.title,
      position: initialProps?.position || { x: 50 + cascadeOffset, y: 30 + cascadeOffset },
      size: initialProps?.size || { ...app.defaultSize },
      state: 'normal',
      zIndex: state.nextZIndex,
      isActive: true,
      ...initialProps,
    };

    set(s => ({
      windows: [...s.windows.map(w => ({ ...w, isActive: false })), newWindow],
      activeWindowId: instanceId,
      nextZIndex: s.nextZIndex + 1,
    }));

    return instanceId;
  },

  closeWindow: (instanceId: string) => {
    set(s => {
      const windows = s.windows.filter(w => w.instanceId !== instanceId);
      const newActive = windows.length > 0 
        ? windows.reduce((a, b) => a.zIndex > b.zIndex ? a : b).instanceId 
        : null;
      return {
        windows: windows.map(w => ({ ...w, isActive: w.instanceId === newActive })),
        activeWindowId: newActive,
      };
    });
  },

  minimizeWindow: (instanceId: string) => {
    set(s => ({
      windows: s.windows.map(w => 
        w.instanceId === instanceId 
          ? { ...w, state: 'minimized' as WindowState, isActive: false }
          : w
      ),
      activeWindowId: s.activeWindowId === instanceId ? null : s.activeWindowId,
    }));
  },

  maximizeWindow: (instanceId: string) => {
    set(s => ({
      windows: s.windows.map(w => 
        w.instanceId === instanceId 
          ? { 
              ...w, 
              state: 'maximized' as WindowState,
              previousPosition: w.position,
              previousSize: w.size,
              position: { x: 0, y: 0 },
              // Size will be handled by the component based on container
            }
          : w
      ),
    }));
  },

  restoreWindow: (instanceId: string) => {
    set(s => ({
      windows: s.windows.map(w => {
        if (w.instanceId !== instanceId) return w;
        return {
          ...w,
          state: 'normal' as WindowState,
          position: w.previousPosition || w.position,
          size: w.previousSize || w.size,
          isActive: true,
        };
      }),
      activeWindowId: instanceId,
    }));
    get().focusWindow(instanceId);
  },

  focusWindow: (instanceId: string) => {
    const state = get();
    const window = state.windows.find(w => w.instanceId === instanceId);
    if (!window) return;

    // If minimized, restore first
    if (window.state === 'minimized') {
      get().restoreWindow(instanceId);
      return;
    }

    set(s => ({
      windows: s.windows.map(w => ({
        ...w,
        isActive: w.instanceId === instanceId,
        zIndex: w.instanceId === instanceId ? s.nextZIndex : w.zIndex,
      })),
      activeWindowId: instanceId,
      nextZIndex: s.nextZIndex + 1,
    }));
  },

  moveWindow: (instanceId: string, x: number, y: number) => {
    set(s => ({
      windows: s.windows.map(w =>
        w.instanceId === instanceId ? { ...w, position: { x, y } } : w
      ),
    }));
  },

  resizeWindow: (instanceId: string, width: number, height: number) => {
    const app = appRegistry[get().windows.find(w => w.instanceId === instanceId)?.appId || ''];
    if (!app) return;

    // Enforce minimum size
    const finalWidth = Math.max(width, app.minSize.width);
    const finalHeight = Math.max(height, app.minSize.height);

    set(s => ({
      windows: s.windows.map(w =>
        w.instanceId === instanceId 
          ? { ...w, size: { width: finalWidth, height: finalHeight } } 
          : w
      ),
    }));
  },

  setWindowTitle: (instanceId: string, title: string) => {
    set(s => ({
      windows: s.windows.map(w =>
        w.instanceId === instanceId ? { ...w, title } : w
      ),
    }));
  },

  setMobile: (isMobile: boolean) => {
    set({ isMobile });
  },

  cascadeWindows: () => {
    set(s => ({
      windows: s.windows
        .filter(w => w.state !== 'minimized')
        .map((w, i) => ({
          ...w,
          position: { x: 20 + i * 30, y: 20 + i * 30 },
          state: 'normal' as WindowState,
          zIndex: i + 1,
        })),
      nextZIndex: s.windows.filter(w => w.state !== 'minimized').length + 1,
    }));
  },

  tileWindows: () => {
    const state = get();
    const visibleWindows = state.windows.filter(w => w.state !== 'minimized');
    if (visibleWindows.length === 0) return;

    const cols = Math.ceil(Math.sqrt(visibleWindows.length));
    const rows = Math.ceil(visibleWindows.length / cols);
    const windowWidth = Math.floor(window.innerWidth / cols);
    const windowHeight = Math.floor((window.innerHeight - 60) / rows); // Leave room for parked icons

    set(s => ({
      windows: s.windows.map((w, _i) => {
        if (w.state === 'minimized') return w;
        const visibleIndex = visibleWindows.findIndex(vw => vw.instanceId === w.instanceId);
        if (visibleIndex === -1) return w;
        
        const col = visibleIndex % cols;
        const row = Math.floor(visibleIndex / cols);
        return {
          ...w,
          position: { x: col * windowWidth, y: row * windowHeight },
          size: { width: windowWidth - 4, height: windowHeight - 4 },
          state: 'normal' as WindowState,
        };
      }),
    }));
  },

  closeAllWindows: () => {
    set({ windows: [], activeWindowId: null, nextZIndex: 1 });
  },

  getWindow: (instanceId: string) => {
    return get().windows.find(w => w.instanceId === instanceId);
  },
}));

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useWindow(instanceId: string) {
  return useWindowManager(state => state.windows.find(w => w.instanceId === instanceId));
}

export function useActiveWindow() {
  return useWindowManager(state => 
    state.windows.find(w => w.instanceId === state.activeWindowId)
  );
}

export function useMinimizedWindows() {
  return useWindowManager(state => 
    state.windows.filter(w => w.state === 'minimized')
  );
}
