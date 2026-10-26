import { getLocalPreference, setLocalPreference } from '../utils/browserPreferences';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface UISoundsContextType {
  isMuted: boolean;
  volume: number;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  playClick: () => void;
  playSuccess: () => void;
  playWhoosh: () => void;
  playHover: () => void;
  playError: () => void;
}

const UISoundsContext = createContext<UISoundsContextType | undefined>(undefined);

// Sound file paths
const SOUNDS = {
  click: '/audio/ui-sounds/click.mp3',
  success: '/audio/ui-sounds/success.mp3',
  whoosh: '/audio/ui-sounds/whoosh.mp3',
  hover: '/audio/ui-sounds/hover.mp3',
  error: '/audio/ui-sounds/error.mp3',
};

export function UISoundsProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    // Load mute state from localStorage
    if (typeof window !== 'undefined') {
      const stored = getLocalPreference('ui-sounds-muted');
      return stored === 'true';
    }
    return false;
  });

  const [volume, setVolumeState] = useState<number>(() => {
    // Load volume from localStorage (default 0.3)
    if (typeof window !== 'undefined') {
      const stored = getLocalPreference('ui-sounds-volume');
      return stored ? parseFloat(stored) : 0.3;
    }
    return 0.3;
  });

  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({});

  // Preload all sounds on mount
  useEffect(() => {
    const elements: Record<string, HTMLAudioElement> = {};

    Object.entries(SOUNDS).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.volume = volume; // Set volume from state
      elements[key] = audio;
    });

    setAudioElements(elements);

    // Cleanup
    return () => {
      Object.values(elements).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, [volume]);

  // Persist mute state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalPreference('ui-sounds-muted', String(isMuted));
    }
  }, [isMuted]);

  // Persist volume
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalPreference('ui-sounds-volume', String(volume));
    }
  }, [volume]);

  // Update audio element volumes when volume changes
  useEffect(() => {
    Object.values(audioElements).forEach(audio => {
      audio.volume = volume;
    });
  }, [volume, audioElements]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const setVolume = (newVolume: number) => {
    // Clamp volume between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
  };

  const playSound = (soundKey: keyof typeof SOUNDS) => {
    if (isMuted || !audioElements[soundKey]) return;

    const audio = audioElements[soundKey];
    audio.currentTime = 0; // Reset to start
    audio.play().catch(err => {
      // Silently fail if autoplay is blocked
      console.debug('Sound play blocked:', err);
    });
  };

  const contextValue: UISoundsContextType = {
    isMuted,
    volume,
    toggleMute,
    setVolume,
    playClick: () => playSound('click'),
    playSuccess: () => playSound('success'),
    playWhoosh: () => playSound('whoosh'),
    playHover: () => playSound('hover'),
    playError: () => playSound('error'),
  };

  return (
    <UISoundsContext.Provider value={contextValue}>
      {children}
    </UISoundsContext.Provider>
  );
}

export function useUISounds() {
  const context = useContext(UISoundsContext);
  if (!context) {
    throw new Error('useUISounds must be used within UISoundsProvider');
  }
  return context;
}
