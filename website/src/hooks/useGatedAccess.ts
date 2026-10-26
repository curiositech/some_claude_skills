import { getLocalPreference, setLocalPreference, removeLocalPreference } from '../utils/browserPreferences';
/**
 * useGatedAccess - Client-side skill gating via URL param + localStorage
 *
 * Visit any page with ?unlock=<SECRET> to store access in localStorage.
 * Gated skills appear in gallery/marquee only when unlocked.
 *
 * NOT truly secure — skills remain in the JS bundle. This gates casual
 * visitors, not determined scrapers.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Skill } from '../types/skill';

const STORAGE_KEY = 'scs_gated_access';
const UNLOCK_PARAM = 'unlock';
// TODO(human): Define your unlock secret
const UNLOCK_SECRET = 'erich2026';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function useGatedAccess() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (!isBrowser()) return false;
    return getLocalPreference(STORAGE_KEY) === 'true';
  });

  // Check URL param on mount, store in localStorage, strip from URL
  useEffect(() => {
    if (!isBrowser()) return;

    const params = new URLSearchParams(window.location.search);
    const unlockValue = params.get(UNLOCK_PARAM);

    if (unlockValue === UNLOCK_SECRET) {
      setLocalPreference(STORAGE_KEY, 'true');
      setIsUnlocked(true);

      // Strip the unlock param from URL without reload
      params.delete(UNLOCK_PARAM);
      const newSearch = params.toString();
      const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const lockAccess = useCallback(() => {
    if (!isBrowser()) return;
    removeLocalPreference(STORAGE_KEY);
    setIsUnlocked(false);
  }, []);

  const filterSkills = useCallback(
    (skills: Skill[]): Skill[] => {
      if (isUnlocked) return skills;
      return skills.filter((skill) => !skill.gated);
    },
    [isUnlocked]
  );

  return { isUnlocked, filterSkills, lockAccess };
}
