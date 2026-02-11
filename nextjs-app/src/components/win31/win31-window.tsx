'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WIN31 WINDOW COMPONENT
 * 
 * Authentic Windows 3.1 window with:
 * - Single control button (system menu, not three buttons)
 * - Drag by title bar
 * - 8-direction resize
 * - Menu bar with dropdowns
 * - Always-visible scrollbars
 * - Keyboard shortcuts
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWindowManager, appRegistry } from '@/stores/window-manager';
import styles from './win31-window.module.css';

interface Win31WindowProps {
  instanceId: string;
  children: React.ReactNode;
  onMenuAction?: (action: string) => void;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

export function Win31Window({ instanceId, children, onMenuAction }: Win31WindowProps) {
  const { 
    windows, 
    focusWindow, 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow, 
    restoreWindow,
    moveWindow, 
    resizeWindow,
    isMobile,
  } = useWindowManager();
  
  const windowData = windows.find(w => w.instanceId === instanceId);
  const app = windowData ? appRegistry[windowData.appId] : null;
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);
  const [showControlMenu, setShowControlMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  const dragStart = useRef({ x: 0, y: 0, windowX: 0, windowY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0, windowX: 0, windowY: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Handle drag
  useEffect(() => {
    if (!isDragging || !windowData) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      moveWindow(instanceId, dragStart.current.windowX + dx, dragStart.current.windowY + dy);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, instanceId, moveWindow, windowData]);

  // Handle resize
  useEffect(() => {
    if (!isResizing || !windowData || !resizeDirection) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      
      let newWidth = resizeStart.current.width;
      let newHeight = resizeStart.current.height;
      let newX = resizeStart.current.windowX;
      let newY = resizeStart.current.windowY;

      // Handle each direction
      if (resizeDirection.includes('e')) {
        newWidth = resizeStart.current.width + dx;
      }
      if (resizeDirection.includes('w')) {
        newWidth = resizeStart.current.width - dx;
        newX = resizeStart.current.windowX + dx;
      }
      if (resizeDirection.includes('s')) {
        newHeight = resizeStart.current.height + dy;
      }
      if (resizeDirection.includes('n')) {
        newHeight = resizeStart.current.height - dy;
        newY = resizeStart.current.windowY + dy;
      }

      // Apply minimum constraints
      const minWidth = app?.minSize.width || 100;
      const minHeight = app?.minSize.height || 100;
      
      if (newWidth >= minWidth) {
        resizeWindow(instanceId, newWidth, newHeight);
        if (resizeDirection.includes('w')) {
          moveWindow(instanceId, newX, windowData.position.y);
        }
      }
      if (newHeight >= minHeight) {
        resizeWindow(instanceId, windowData.size.width, newHeight);
        if (resizeDirection.includes('n')) {
          moveWindow(instanceId, windowData.position.x, newY);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, instanceId, moveWindow, resizeWindow, windowData, app]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!windowData?.isActive) return;

      // Alt+F4 = Close
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        closeWindow(instanceId);
      }
      // Alt+Space = Control menu
      if (e.altKey && e.key === ' ') {
        e.preventDefault();
        setShowControlMenu(true);
      }
      // Escape = Close menu
      if (e.key === 'Escape') {
        setShowControlMenu(false);
        setActiveMenu(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [windowData?.isActive, instanceId, closeWindow]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!windowRef.current?.contains(e.target as Node)) {
        setShowControlMenu(false);
        setActiveMenu(null);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleTitleBarMouseDown = useCallback((e: React.MouseEvent) => {
    if (windowData?.state === 'maximized') return;
    
    e.preventDefault();
    focusWindow(instanceId);
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      windowX: windowData?.position.x || 0,
      windowY: windowData?.position.y || 0,
    };
  }, [focusWindow, instanceId, windowData]);

  const handleResizeMouseDown = useCallback((direction: ResizeDirection) => (e: React.MouseEvent) => {
    if (!app?.isResizable || windowData?.state === 'maximized') return;
    
    e.preventDefault();
    e.stopPropagation();
    focusWindow(instanceId);
    setIsResizing(true);
    setResizeDirection(direction);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: windowData?.size.width || 0,
      height: windowData?.size.height || 0,
      windowX: windowData?.position.x || 0,
      windowY: windowData?.position.y || 0,
    };
  }, [app?.isResizable, focusWindow, instanceId, windowData]);

  const handleControlMenuAction = useCallback((action: string) => {
    setShowControlMenu(false);
    switch (action) {
      case 'restore':
        restoreWindow(instanceId);
        break;
      case 'minimize':
        minimizeWindow(instanceId);
        break;
      case 'maximize':
        maximizeWindow(instanceId);
        break;
      case 'close':
        closeWindow(instanceId);
        break;
    }
  }, [instanceId, restoreWindow, minimizeWindow, maximizeWindow, closeWindow]);

  const handleMenuClick = useCallback((menuLabel: string) => {
    setActiveMenu(activeMenu === menuLabel ? null : menuLabel);
    setShowControlMenu(false);
  }, [activeMenu]);

  const handleMenuItemClick = useCallback((action: string | undefined) => {
    setActiveMenu(null);
    if (action === 'close') {
      closeWindow(instanceId);
    } else if (action && onMenuAction) {
      onMenuAction(action);
    }
  }, [closeWindow, instanceId, onMenuAction]);

  if (!windowData || !app || windowData.state === 'minimized') {
    return null;
  }

  const isMaximized = windowData.state === 'maximized';
  const isActive = windowData.isActive;

  // Mobile: full screen
  const windowStyle: React.CSSProperties = isMobile ? {
    position: 'fixed',
    inset: 0,
    zIndex: windowData.zIndex,
  } : {
    position: 'absolute',
    left: isMaximized ? 0 : windowData.position.x,
    top: isMaximized ? 0 : windowData.position.y,
    width: isMaximized ? '100%' : windowData.size.width,
    height: isMaximized ? '100%' : windowData.size.height,
    zIndex: windowData.zIndex,
  };

  return (
    <div
      ref={windowRef}
      className={`${styles.window} ${isActive ? styles.active : styles.inactive}`}
      style={windowStyle}
      onMouseDown={() => focusWindow(instanceId)}
    >
      {/* Title Bar */}
      <div 
        className={`${styles.titleBar} ${isActive ? styles.titleBarActive : styles.titleBarInactive}`}
        onMouseDown={handleTitleBarMouseDown}
        onDoubleClick={() => isMaximized ? restoreWindow(instanceId) : maximizeWindow(instanceId)}
      >
        {/* Control Button (Single - Win31 style) */}
        <div className={styles.controlButtonWrapper}>
          <button 
            className={styles.controlButton}
            onClick={(e) => { e.stopPropagation(); setShowControlMenu(!showControlMenu); }}
            title="Control Menu (Alt+Space)"
          >
            <span className={styles.controlIcon}>▬</span>
          </button>
          
          {/* Control Menu Dropdown */}
          {showControlMenu && (
            <div className={styles.controlMenu}>
              <button 
                onClick={() => handleControlMenuAction('restore')}
                disabled={windowData.state === 'normal'}
              >
                Restore
              </button>
              <button onClick={() => handleControlMenuAction('minimize')}>
                Minimize
              </button>
              <button 
                onClick={() => handleControlMenuAction('maximize')}
                disabled={windowData.state === 'maximized'}
              >
                Maximize
              </button>
              <div className={styles.menuSeparator} />
              <button onClick={() => handleControlMenuAction('close')}>
                Close <span className={styles.shortcut}>Alt+F4</span>
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <span className={styles.title}>{windowData.title}</span>

        {/* Maximize/Restore indicator (small, not a full button) */}
        <div className={styles.titleRight}>
          <span className={styles.stateIndicator}>
            {isMaximized ? '▼' : '▲'}
          </span>
        </div>
      </div>

      {/* Menu Bar */}
      {app.hasMenuBar && app.menuItems && (
        <div className={styles.menuBar}>
          {app.menuItems.map((menu) => (
            <div key={menu.label} className={styles.menuWrapper}>
              <button
                className={`${styles.menuButton} ${activeMenu === menu.label ? styles.menuButtonActive : ''}`}
                onClick={() => handleMenuClick(menu.label)}
              >
                {menu.accelerator ? (
                  <>
                    <span className={styles.underline}>{menu.label[0]}</span>
                    {menu.label.slice(1)}
                  </>
                ) : menu.label}
              </button>
              
              {activeMenu === menu.label && (
                <div className={styles.menuDropdown}>
                  {menu.items.map((item, idx) => (
                    item.separator ? (
                      <div key={idx} className={styles.menuSeparator} />
                    ) : (
                      <button
                        key={idx}
                        className={styles.menuItem}
                        onClick={() => handleMenuItemClick(item.action)}
                        disabled={item.disabled}
                      >
                        <span>{item.label}</span>
                        {item.shortcut && <span className={styles.shortcut}>{item.shortcut}</span>}
                      </button>
                    )
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className={styles.content}>
        {children}
      </div>

      {/* Resize Handles (8 directions) */}
      {app.isResizable && !isMaximized && !isMobile && (
        <>
          <div className={`${styles.resizeHandle} ${styles.resizeN}`} onMouseDown={handleResizeMouseDown('n')} />
          <div className={`${styles.resizeHandle} ${styles.resizeS}`} onMouseDown={handleResizeMouseDown('s')} />
          <div className={`${styles.resizeHandle} ${styles.resizeE}`} onMouseDown={handleResizeMouseDown('e')} />
          <div className={`${styles.resizeHandle} ${styles.resizeW}`} onMouseDown={handleResizeMouseDown('w')} />
          <div className={`${styles.resizeHandle} ${styles.resizeNE}`} onMouseDown={handleResizeMouseDown('ne')} />
          <div className={`${styles.resizeHandle} ${styles.resizeNW}`} onMouseDown={handleResizeMouseDown('nw')} />
          <div className={`${styles.resizeHandle} ${styles.resizeSE}`} onMouseDown={handleResizeMouseDown('se')} />
          <div className={`${styles.resizeHandle} ${styles.resizeSW}`} onMouseDown={handleResizeMouseDown('sw')} />
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PARKED ICONS (Minimized Windows at Bottom)
// ═══════════════════════════════════════════════════════════════════════════

export function ParkedIcons() {
  const { windows, focusWindow } = useWindowManager();
  const minimized = windows.filter(w => w.state === 'minimized');

  if (minimized.length === 0) return null;

  return (
    <div className={styles.parkedIconsContainer}>
      {minimized.map((window, index) => {
        const app = appRegistry[window.appId];
        return (
          <button
            key={window.instanceId}
            className={styles.parkedIcon}
            style={{ left: 8 + index * 110 }}
            onClick={() => focusWindow(window.instanceId)}
            onDoubleClick={() => focusWindow(window.instanceId)}
          >
            <span className={styles.parkedIconEmoji}>{app?.icon || '📄'}</span>
            <span className={styles.parkedIconTitle}>{window.title}</span>
          </button>
        );
      })}
    </div>
  );
}
