import { getLocalPreference, setLocalPreference } from '../utils/browserPreferences';
import { useState, useEffect } from 'react';
import { WinampSkin, WINAMP_SKINS, DEFAULT_SKIN } from '../types/skins';

const SKIN_STORAGE_KEY = 'winamp-skin-preference';

export function useWinampSkin() {
  const [currentSkinId, setCurrentSkinId] = useState<string>(DEFAULT_SKIN);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load skin preference from localStorage on mount
  useEffect(() => {
    const savedSkin = getLocalPreference(SKIN_STORAGE_KEY);
    if (savedSkin && WINAMP_SKINS[savedSkin]) {
      setCurrentSkinId(savedSkin);
    }
    setIsLoaded(true);
  }, []);

  // Apply CSS variables when skin changes
  useEffect(() => {
    if (!isLoaded) return;

    const skin = WINAMP_SKINS[currentSkinId];
    if (!skin) return;

    // Apply all skin colors as CSS variables
    const root = document.documentElement;
    Object.entries(skin.colors).forEach(([key, value]) => {
      root.style.setProperty(`--winamp-${key}`, value);
    });

    // Save preference
    setLocalPreference(SKIN_STORAGE_KEY, currentSkinId);
  }, [currentSkinId, isLoaded]);

  const setSkin = (skinId: string) => {
    if (WINAMP_SKINS[skinId]) {
      setCurrentSkinId(skinId);
    }
  };

  const currentSkin = WINAMP_SKINS[currentSkinId];

  return {
    currentSkin,
    currentSkinId,
    setSkin,
    allSkins: Object.values(WINAMP_SKINS),
    isLoaded,
  };
}
