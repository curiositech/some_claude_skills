import React from 'react';
import { useWin31Theme } from '../hooks/useWin31Theme';
import { MusicPlayerProvider } from '../contexts/MusicPlayerContext';
import { UISoundsProvider } from '../contexts/UISoundsContext';
import WinampModal from '../components/WinampModal';
import FullScreenVisualizer from '../components/FullScreenVisualizer';
import SiteBanner from '../components/SiteBanner';

// Root component to apply Win31 theme globally across all pages
function ThemeApplicator({ children }: { children: React.ReactNode }) {
  // This hook applies the theme CSS variables on mount
  useWin31Theme();
  return <>{children}</>;
}

export default function Root({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <UISoundsProvider>
      <MusicPlayerProvider>
        <SiteBanner />
        <ThemeApplicator>{children}</ThemeApplicator>
        <WinampModal />
        <FullScreenVisualizer />
      </MusicPlayerProvider>
    </UISoundsProvider>
  );
}
