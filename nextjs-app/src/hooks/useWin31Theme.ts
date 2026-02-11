/**
 * Windows 3.1 Theme Hook
 * 
 * Authentic Win3.1 color schemes from Control Panel
 */

import { useState, useEffect, useCallback } from 'react';

// Authentic Windows 3.1 Color Schemes from Control Panel
export const COLOR_SCHEMES = {
  'Windows Default': {
    desktop: '#008080',    // Teal
    gray: '#c0c0c0',       // Silver
    navy: '#000080',       // Navy Blue
    highlight: '#000080',  // Navy Blue
  },
  'Hot Dog Stand': {
    desktop: '#FF0000',    // Red
    gray: '#FFFF00',       // Yellow
    navy: '#FF0000',       // Red
    highlight: '#FF0000',  // Red
  },
  'Fluorescent': {
    desktop: '#FF00FF',    // Magenta
    gray: '#00FFFF',       // Cyan
    navy: '#FF00FF',       // Magenta
    highlight: '#00FF00',  // Green
  },
  'Ocean': {
    desktop: '#000080',    // Dark Blue
    gray: '#c0c0c0',       // Silver
    navy: '#000040',       // Darker Blue
    highlight: '#0000FF',  // Blue
  },
  'Plasma Power Saver': {
    desktop: '#000000',    // Black
    gray: '#404040',       // Dark Gray
    navy: '#800080',       // Purple
    highlight: '#FF00FF',  // Magenta
  },
  'Pumpkin (Large)': {
    desktop: '#804000',    // Brown
    gray: '#FF8000',       // Orange
    navy: '#804000',       // Brown
    highlight: '#FFFF00',  // Yellow
  },
  'Rugby': {
    desktop: '#004000',    // Dark Green
    gray: '#c0c0c0',       // Silver
    navy: '#004000',       // Dark Green
    highlight: '#008000',  // Green
  },
  'Arizona': {
    desktop: '#CC6600',    // Burnt Orange
    gray: '#FFE4B5',       // Moccasin
    navy: '#8B4513',       // Saddle Brown
    highlight: '#FF4500',  // Orange Red
  },
  'Bordeaux': {
    desktop: '#800020',    // Burgundy
    gray: '#DEB887',       // Burlywood
    navy: '#800020',       // Burgundy
    highlight: '#FFD700',  // Gold
  },
  'Designer': {
    desktop: '#2F4F4F',    // Dark Slate Gray
    gray: '#D3D3D3',       // Light Gray
    navy: '#000000',       // Black
    highlight: '#00CED1',  // Dark Turquoise
  },
  'Monochrome': {
    desktop: '#000000',    // Black
    gray: '#FFFFFF',       // White
    navy: '#000000',       // Black
    highlight: '#808080',  // Gray
  },
  'Valentine': {
    desktop: '#FF69B4',    // Hot Pink
    gray: '#FFB6C1',       // Light Pink
    navy: '#FF1493',       // Deep Pink
    highlight: '#FF0000',  // Red
  },
} as const;

export type ThemeName = keyof typeof COLOR_SCHEMES;

const STORAGE_KEY = 'win31-theme';

export function useWin31Theme() {
  const [colorScheme, setColorScheme] = useState<ThemeName>('Windows Default');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved in COLOR_SCHEMES) {
        setColorScheme(saved as ThemeName);
      }
      setIsLoaded(true);
    }
  }, []);

  // Apply theme to CSS variables
  useEffect(() => {
    if (!isLoaded) return;

    const scheme = COLOR_SCHEMES[colorScheme];
    if (scheme) {
      document.documentElement.style.setProperty('--win31-desktop', scheme.desktop);
      document.documentElement.style.setProperty('--win31-gray', scheme.gray);
      document.documentElement.style.setProperty('--win31-navy', scheme.navy);
      document.documentElement.style.setProperty('--win31-active-title', scheme.highlight);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, colorScheme);
    }
  }, [colorScheme, isLoaded]);

  const setTheme = useCallback((theme: ThemeName) => {
    setColorScheme(theme);
  }, []);

  const cycleTheme = useCallback(() => {
    const themes = Object.keys(COLOR_SCHEMES) as ThemeName[];
    const currentIndex = themes.indexOf(colorScheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setColorScheme(themes[nextIndex]);
  }, [colorScheme]);

  return {
    colorScheme,
    setTheme,
    cycleTheme,
    themes: Object.keys(COLOR_SCHEMES) as ThemeName[],
    colors: COLOR_SCHEMES[colorScheme],
    isLoaded,
  };
}
