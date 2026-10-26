import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parsePalette, PALETTE_STORAGE_KEY, useWin31Theme } from './useWin31Theme';

beforeEach(() => { localStorage.clear(); document.documentElement.dataset.theme = 'dark'; });
describe('palette preference is independent of appearance', () => {
  it('restores a stored palette without changing dark appearance', () => {
    localStorage.setItem(PALETTE_STORAGE_KEY, 'Fluorescent');
    const { result } = renderHook(() => useWin31Theme());
    expect(result.current.colorScheme).toBe('Fluorescent');
    expect(document.documentElement.dataset.win31Palette).toBe('Fluorescent');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
  it('updates every mounted palette consumer in the current tab', () => {
    const first = renderHook(() => useWin31Theme());
    const second = renderHook(() => useWin31Theme());
    act(() => first.result.current.setTheme('Rugby'));
    expect(second.result.current.colorScheme).toBe('Rugby');
    expect(localStorage.getItem(PALETTE_STORAGE_KEY)).toBe('Rugby');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
  it('responds to cross-tab changes and clears', () => {
    const { result } = renderHook(() => useWin31Theme());
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: PALETTE_STORAGE_KEY, newValue: 'Ocean' })));
    expect(result.current.colorScheme).toBe('Ocean');
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: null, newValue: null })));
    expect(result.current.colorScheme).toBe('Windows Default');
  });
  it('works when browser storage is unavailable', () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    const { result } = renderHook(() => useWin31Theme());
    act(() => result.current.setTheme('Plasma Power Saver'));
    expect(result.current.colorScheme).toBe('Plasma Power Saver');
    expect(document.documentElement.dataset.theme).toBe('dark');
    get.mockRestore(); set.mockRestore();
  });
  it('rejects invalid stored values and object prototype keys', () => {
    expect(parsePalette('__proto__')).toBe('Windows Default');
    expect(parsePalette('missing')).toBe('Windows Default');
  });
});
