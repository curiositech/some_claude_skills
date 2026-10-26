import { useState, useEffect, useCallback } from 'react';

// Palette names are stable storage identifiers. Colors live in theme-tokens.css.
export const COLOR_SCHEMES = {
  'Windows Default': {},
  'Hot Dog Stand': {},
  'Fluorescent': {},
  'Ocean': {},
  'Plasma Power Saver': {},
  'Pumpkin (Large)': {},
  'Rugby': {},
} as const;
export type ThemeName = keyof typeof COLOR_SCHEMES;
export const PALETTE_STORAGE_KEY = 'win31-theme';
const PALETTE_EVENT = 'win31-palette-change';
export function parsePalette(value: string | null): ThemeName {
  return value && Object.prototype.hasOwnProperty.call(COLOR_SCHEMES, value)
    ? value as ThemeName : 'Windows Default';
}

export function useWin31Theme() {
  const [colorScheme, setColorScheme] = useState<ThemeName>('Windows Default');
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const apply = (palette: ThemeName) => {
      document.documentElement.dataset.win31Palette = palette;
      setColorScheme(palette);
    };
    try { apply(parsePalette(localStorage.getItem(PALETTE_STORAGE_KEY))); }
    catch { apply('Windows Default'); }
    setIsLoaded(true);
    const local = (event: Event) => apply(parsePalette((event as CustomEvent<string>).detail));
    const storage = (event: StorageEvent) => {
      if (event.key === PALETTE_STORAGE_KEY || event.key === null) apply(parsePalette(event.newValue));
    };
    window.addEventListener(PALETTE_EVENT, local);
    window.addEventListener('storage', storage);
    return () => {
      window.removeEventListener(PALETTE_EVENT, local);
      window.removeEventListener('storage', storage);
    };
  }, []);
  const setTheme = useCallback((theme: ThemeName) => {
    const palette = parsePalette(theme);
    try { localStorage.setItem(PALETTE_STORAGE_KEY, palette); } catch { /* Storage may be unavailable. */ }
    window.dispatchEvent(new CustomEvent(PALETTE_EVENT, { detail: palette }));
  }, []);
  return { colorScheme, setTheme, themes: Object.keys(COLOR_SCHEMES) as ThemeName[], isLoaded };
}
