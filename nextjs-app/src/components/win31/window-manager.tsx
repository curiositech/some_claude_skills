'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WINDOWS 3.1 WINDOW MANAGER
 * Real draggable, resizable, minimizable windows with tile/cascade support
 * ═══════════════════════════════════════════════════════════════════════════
 */

import * as React from 'react';
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface WindowState {
  id: string;
  title: string;
  icon?: React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  content: React.ReactNode;
  onClose?: () => void;
}

interface WindowManagerContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  openWindow: (window: Omit<WindowState, 'zIndex' | 'isMinimized' | 'isMaximized'>) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  bringToFront: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowState>) => void;
  tileWindows: () => void;
  cascadeWindows: () => void;
  minimizedWindows: WindowState[];
}

const WindowManagerContext = createContext<WindowManagerContextType | null>(null);

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error('useWindowManager must be used within WindowManagerProvider');
  return ctx;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

export function WindowManagerProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const nextZIndex = useRef(100);

  const openWindow = useCallback((window: Omit<WindowState, 'zIndex' | 'isMinimized' | 'isMaximized'>) => {
    // Check if window already exists
    setWindows(prev => {
      const existing = prev.find(w => w.id === window.id);
      if (existing) {
        // Restore and bring to front
        return prev.map(w => 
          w.id === window.id 
            ? { ...w, isMinimized: false, zIndex: nextZIndex.current++ }
            : w
        );
      }
      return [...prev, { 
        ...window, 
        zIndex: nextZIndex.current++,
        isMinimized: false,
        isMaximized: false,
      }];
    });
    setActiveWindowId(window.id);
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const window = prev.find(w => w.id === id);
      if (window?.onClose) window.onClose();
      return prev.filter(w => w.id !== id);
    });
    setActiveWindowId(prev => prev === id ? null : prev);
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    ));
    setActiveWindowId(prev => prev === id ? null : prev);
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMaximized: !w.isMaximized, zIndex: nextZIndex.current++ } : w
    ));
    setActiveWindowId(id);
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: false, zIndex: nextZIndex.current++ } : w
    ));
    setActiveWindowId(id);
  }, []);

  const bringToFront = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, zIndex: nextZIndex.current++ } : w
    ));
    setActiveWindowId(id);
  }, []);

  const updateWindow = useCallback((id: string, updates: Partial<WindowState>) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, ...updates } : w
    ));
  }, []);

  const tileWindows = useCallback(() => {
    const visible = windows.filter(w => !w.isMinimized);
    if (visible.length === 0) return;
    
    // Calculate grid
    const cols = Math.ceil(Math.sqrt(visible.length));
    const rows = Math.ceil(visible.length / cols);
    const width = Math.floor((window.innerWidth - 20) / cols);
    const height = Math.floor((window.innerHeight - 60) / rows);
    
    setWindows(prev => prev.map(w => {
      if (w.isMinimized) return w;
      const idx = visible.findIndex(v => v.id === w.id);
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      return {
        ...w,
        x: col * width + 10,
        y: row * height + 10,
        width: width - 10,
        height: height - 10,
        isMaximized: false,
      };
    }));
  }, [windows]);

  const cascadeWindows = useCallback(() => {
    const visible = windows.filter(w => !w.isMinimized);
    const OFFSET = 30;
    
    setWindows(prev => prev.map(w => {
      if (w.isMinimized) return w;
      const idx = visible.findIndex(v => v.id === w.id);
      return {
        ...w,
        x: 50 + (idx * OFFSET),
        y: 50 + (idx * OFFSET),
        width: 600,
        height: 400,
        isMaximized: false,
        zIndex: 100 + idx,
      };
    }));
  }, [windows]);

  const minimizedWindows = windows.filter(w => w.isMinimized);

  return (
    <WindowManagerContext.Provider value={{
      windows,
      activeWindowId,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      bringToFront,
      updateWindow,
      tileWindows,
      cascadeWindows,
      minimizedWindows,
    }}>
      {children}
    </WindowManagerContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAGGABLE RESIZABLE WINDOW
// ═══════════════════════════════════════════════════════════════════════════

interface DraggableWindowProps {
  window: WindowState;
  isActive: boolean;
}

export function DraggableWindow({ window: win, isActive }: DraggableWindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, bringToFront, updateWindow } = useWindowManager();
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const windowStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      updateWindow(win.id, {
        x: windowStart.current.x + dx,
        y: Math.max(0, windowStart.current.y + dy), // Don't drag above top
      });
    };
    
    const handleMouseUp = () => setIsDragging(false);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, win.id, updateWindow]);

  // Handle resizing
  useEffect(() => {
    if (!isResizing || !resizeDir) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const updates: Partial<WindowState> = {};
      const minW = win.minWidth || 200;
      const minH = win.minHeight || 150;
      
      if (resizeDir.includes('e')) {
        updates.width = Math.max(minW, windowStart.current.width + dx);
      }
      if (resizeDir.includes('w')) {
        const newWidth = Math.max(minW, windowStart.current.width - dx);
        updates.width = newWidth;
        updates.x = windowStart.current.x + (windowStart.current.width - newWidth);
      }
      if (resizeDir.includes('s')) {
        updates.height = Math.max(minH, windowStart.current.height + dy);
      }
      if (resizeDir.includes('n')) {
        const newHeight = Math.max(minH, windowStart.current.height - dy);
        updates.height = newHeight;
        updates.y = windowStart.current.y + (windowStart.current.height - newHeight);
      }
      
      updateWindow(win.id, updates);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDir(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDir, win.id, win.minWidth, win.minHeight, updateWindow]);

  const startDrag = (e: React.MouseEvent) => {
    if (win.isMaximized) return;
    e.preventDefault();
    bringToFront(win.id);
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    windowStart.current = { x: win.x, y: win.y, width: win.width, height: win.height };
  };

  const startResize = (e: React.MouseEvent, dir: string) => {
    if (win.isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    bringToFront(win.id);
    setIsResizing(true);
    setResizeDir(dir);
    dragStart.current = { x: e.clientX, y: e.clientY };
    windowStart.current = { x: win.x, y: win.y, width: win.width, height: win.height };
  };

  if (win.isMinimized) return null;

  const style: React.CSSProperties = win.isMaximized 
    ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 40, width: '100%', height: 'calc(100vh - 40px)', zIndex: win.zIndex }
    : { position: 'fixed', top: win.y, left: win.x, width: win.width, height: win.height, zIndex: win.zIndex };

  return (
    <div 
      className={`win31-window ${isActive ? 'win31-window-active' : ''}`}
      style={style}
      onMouseDown={() => bringToFront(win.id)}
    >
      {/* Title bar */}
      <div 
        className={`win31-titlebar ${isActive ? '' : 'win31-titlebar-inactive'}`}
        onMouseDown={startDrag}
        onDoubleClick={() => maximizeWindow(win.id)}
        style={{ cursor: win.isMaximized ? 'default' : 'move' }}
      >
        {win.icon && <span className="win31-titlebar-icon">{win.icon}</span>}
        <span className="win31-title-text">{win.title}</span>
        <div className="win31-titlebar-buttons">
          <button 
            className="win31-button" 
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
            aria-label="Minimize"
          >
            <span className="win31-minimize-icon" />
          </button>
          <button 
            className="win31-button" 
            onClick={(e) => { e.stopPropagation(); maximizeWindow(win.id); }}
            aria-label="Maximize"
          >
            <span className="win31-maximize-icon" />
          </button>
          <button 
            className="win31-button" 
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
            aria-label="Close"
          >
            <span className="win31-close-icon" />
          </button>
        </div>
      </div>
      
      {/* Window content */}
      <div className="win31-window-content">
        {win.content}
      </div>
      
      {/* Resize handles (only when not maximized) */}
      {!win.isMaximized && (
        <>
          <div className="win31-resize-handle win31-resize-n" onMouseDown={e => startResize(e, 'n')} />
          <div className="win31-resize-handle win31-resize-s" onMouseDown={e => startResize(e, 's')} />
          <div className="win31-resize-handle win31-resize-e" onMouseDown={e => startResize(e, 'e')} />
          <div className="win31-resize-handle win31-resize-w" onMouseDown={e => startResize(e, 'w')} />
          <div className="win31-resize-handle win31-resize-ne" onMouseDown={e => startResize(e, 'ne')} />
          <div className="win31-resize-handle win31-resize-nw" onMouseDown={e => startResize(e, 'nw')} />
          <div className="win31-resize-handle win31-resize-se" onMouseDown={e => startResize(e, 'se')} />
          <div className="win31-resize-handle win31-resize-sw" onMouseDown={e => startResize(e, 'sw')} />
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TASKBAR
// ═══════════════════════════════════════════════════════════════════════════

export function Win31Taskbar() {
  const { minimizedWindows, restoreWindow, tileWindows, cascadeWindows } = useWindowManager();
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="win31-taskbar">
      <div className="win31-taskbar-left">
        {minimizedWindows.map(win => (
          <button 
            key={win.id}
            className="win31-taskbar-button"
            onClick={() => restoreWindow(win.id)}
            title={win.title}
          >
            {win.icon && <span className="win31-taskbar-icon">{win.icon}</span>}
            <span className="win31-taskbar-label">{win.title}</span>
          </button>
        ))}
      </div>
      <div className="win31-taskbar-right">
        <button className="win31-button win31-taskbar-action" onClick={cascadeWindows} title="Cascade">
          ≣
        </button>
        <button className="win31-button win31-taskbar-action" onClick={tileWindows} title="Tile">
          ⊞
        </button>
        <div className="win31-taskbar-clock">{time}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER ALL WINDOWS
// ═══════════════════════════════════════════════════════════════════════════

export function WindowRenderer() {
  const { windows, activeWindowId } = useWindowManager();
  
  return (
    <>
      {windows.map(win => (
        <DraggableWindow 
          key={win.id} 
          window={win}
          isActive={win.id === activeWindowId}
        />
      ))}
    </>
  );
}
