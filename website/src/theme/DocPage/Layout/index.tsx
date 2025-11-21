import React, { useState, useEffect } from 'react';
import Layout from '@theme-original/DocPage/Layout';
import type LayoutType from '@theme/DocPage/Layout';
import type { WrapperProps } from '@docusaurus/types';
import DraggableWin31Window from '../../../components/DraggableWin31Window';
import Win31Taskbar from '../../../components/Win31Taskbar';
import '../../../css/win31.css';

type Props = WrapperProps<typeof LayoutType>;

interface WindowState {
  id: string;
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export default function LayoutWrapper(props: Props): JSX.Element {
  const [windows, setWindows] = useState<WindowState[]>([
    {
      id: 'doc',
      title: 'Documentation - Claude Skills',
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
    },
  ]);
  const [highestZIndex, setHighestZIndex] = useState(1);

  const bringToFront = (id: string) => {
    const newZIndex = highestZIndex + 1;
    setHighestZIndex(newZIndex);
    setWindows((prev) =>
      prev.map((win) => (win.id === id ? { ...win, zIndex: newZIndex } : win))
    );
  };

  const minimizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((win) => (win.id === id ? { ...win, isMinimized: true } : win))
    );
  };

  const restoreWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id
          ? { ...win, isMinimized: false, isMaximized: false }
          : win
      )
    );
    bringToFront(id);
  };

  const maximizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id ? { ...win, isMaximized: !win.isMaximized } : win
      )
    );
  };

  const docWindow = windows.find((w) => w.id === 'doc');

  return (
    <div className="win31-desktop" style={{ minHeight: '100vh', paddingBottom: '50px' }}>
      {docWindow && !docWindow.isMinimized && (
        <DraggableWin31Window
          title={docWindow.title}
          initialPosition={{ x: 50, y: 50 }}
          initialSize={{ width: Math.min(900, window.innerWidth - 100), height: Math.min(700, window.innerHeight - 150) }}
          onMinimize={() => minimizeWindow('doc')}
          onMaximize={() => maximizeWindow('doc')}
          isMaximized={docWindow.isMaximized}
          zIndex={docWindow.zIndex}
          onBringToFront={() => bringToFront('doc')}
        >
          <div style={{ background: '#F5F5DC', height: '100%', overflow: 'auto' }}>
            <Layout {...props} />
          </div>
        </DraggableWin31Window>
      )}

      <Win31Taskbar
        windows={windows}
        onWindowClick={restoreWindow}
      />
    </div>
  );
}
