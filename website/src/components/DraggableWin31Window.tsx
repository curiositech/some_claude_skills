import React, { useState, useRef, useEffect, ReactNode } from 'react';
import '../css/win31.css';

interface DraggableWin31WindowProps {
  title: string;
  children: ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  isMaximized?: boolean;
  zIndex?: number;
  onBringToFront?: () => void;
  className?: string;
}

export default function DraggableWin31Window({
  title,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 600, height: 400 },
  onMinimize,
  onMaximize,
  onClose,
  isMaximized = false,
  zIndex = 1,
  onBringToFront,
  className = '',
}: DraggableWin31WindowProps): JSX.Element {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        setPosition({ x: position.x + dx, y: position.y + dy });
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, position, isMaximized]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (onBringToFront) onBringToFront();
    if (!isMaximized && e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const windowStyle: React.CSSProperties = isMaximized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: '40px',
        width: '100%',
        height: 'calc(100vh - 40px)',
        zIndex,
      }
    : {
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${initialSize.width}px`,
        height: `${initialSize.height}px`,
        zIndex,
      };

  return (
    <div
      ref={windowRef}
      className={`win31-window ${className}`}
      style={windowStyle}
      onMouseDown={() => onBringToFront && onBringToFront()}
    >
      <div
        className="win31-titlebar"
        onMouseDown={handleMouseDown}
        style={{ cursor: isMaximized ? 'default' : 'move' }}
      >
        <span className="win31-title-text">{title}</span>
        <div style={{ display: 'flex' }}>
          {onMinimize && (
            <button
              className="win31-button"
              onClick={(e) => {
                e.stopPropagation();
                onMinimize();
              }}
              aria-label="Minimize"
            >
              <span className="win31-minimize-icon" />
            </button>
          )}
          {onMaximize && (
            <button
              className="win31-button"
              onClick={(e) => {
                e.stopPropagation();
                onMaximize();
              }}
              aria-label="Maximize"
            >
              <span className="win31-maximize-icon" />
            </button>
          )}
          {onClose && (
            <button
              className="win31-button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close"
            >
              <span className="win31-close-icon" />
            </button>
          )}
        </div>
      </div>
      <div
        className="win31-window-inner"
        style={{
          padding: '0',
          height: 'calc(100% - 20px)',
          overflow: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}
