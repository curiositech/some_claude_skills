import React, { ReactNode } from 'react';
import '../css/win31.css';

interface Win31WindowProps {
  title: string;
  children: ReactNode;
  width?: number | string;
  height?: number | string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  active?: boolean;
  className?: string;
}

export default function Win31Window({
  title,
  children,
  width = '600px',
  height = 'auto',
  onClose,
  onMinimize,
  onMaximize,
  active = true,
  className = '',
}: Win31WindowProps): JSX.Element {
  return (
    <div
      className={`win31-window ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      <div className={`win31-titlebar ${active ? '' : 'win31-titlebar-inactive'}`}>
        <span className="win31-title-text">{title}</span>
        <div style={{ display: 'flex' }}>
          {onMinimize && (
            <button
              className="win31-button"
              onClick={onMinimize}
              aria-label="Minimize"
            >
              <span className="win31-minimize-icon" />
            </button>
          )}
          {onMaximize && (
            <button
              className="win31-button"
              onClick={onMaximize}
              aria-label="Maximize"
            >
              <span className="win31-maximize-icon" />
            </button>
          )}
          {onClose && (
            <button
              className="win31-button"
              onClick={onClose}
              aria-label="Close"
            >
              <span className="win31-close-icon" />
            </button>
          )}
        </div>
      </div>
      <div className="win31-window-inner" style={{ padding: '8px' }}>
        {children}
      </div>
    </div>
  );
}
