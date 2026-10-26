/** Preferences are optional: restricted storage must not prevent rendering UI. */
export function getLocalPreference(key: string): string | null {
  try { return typeof window === 'undefined' ? null : window.localStorage.getItem(key); }
  catch { return null; }
}
export function setLocalPreference(key: string, value: string): void {
  try { if (typeof window !== 'undefined') window.localStorage.setItem(key, value); }
  catch { /* The in-memory preference remains usable. */ }
}
export function removeLocalPreference(key: string): void {
  try { if (typeof window !== 'undefined') window.localStorage.removeItem(key); }
  catch { /* The in-memory preference remains usable. */ }
}
