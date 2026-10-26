import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLocalPreference, setLocalPreference, removeLocalPreference } from './browserPreferences';
beforeEach(() => localStorage.clear());
describe('optional browser preference storage', () => {
  it('persists and removes preferences when storage is available', () => {
    setLocalPreference('example-preference', 'dark');
    expect(getLocalPreference('example-preference')).toBe('dark');
    removeLocalPreference('example-preference');
    expect(getLocalPreference('example-preference')).toBeNull();
  });
  it('keeps UI render paths available when storage is blocked', () => {
    const get=vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error('blocked')});
    const set=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('blocked')});
    const remove=vi.spyOn(Storage.prototype,'removeItem').mockImplementation(()=>{throw new Error('blocked')});
    expect(getLocalPreference('example-preference')).toBeNull();
    expect(()=>setLocalPreference('example-preference','dark')).not.toThrow();
    expect(()=>removeLocalPreference('example-preference')).not.toThrow();
    get.mockRestore();set.mockRestore();remove.mockRestore();
  });
});
