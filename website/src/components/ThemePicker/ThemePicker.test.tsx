import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ThemePicker from './index';
vi.mock('../../hooks/usePlausibleTracking', () => ({ usePlausibleTracking: () => ({ track: vi.fn() }) }));
beforeEach(() => { localStorage.clear(); document.documentElement.dataset.theme = 'dark'; });
describe('palette control', () => {
  it('uses named native radio choices without changing appearance', () => {
    const { container } = render(<ThemePicker />);
    const disclosure = container.querySelector('details')!;
    disclosure.open = true;
    fireEvent.click(screen.getByRole('radio', { name: 'Ocean' }));
    expect(screen.getByRole('radio', { name: 'Ocean' })).toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.dataset.win31Palette).toBe('Ocean');
  });
  it('closes on Escape and restores focus to its summary', () => {
    const { container } = render(<ThemePicker />);
    const disclosure = container.querySelector('details')!;
    disclosure.open = true;
    fireEvent.keyDown(disclosure, { key: 'Escape' });
    expect(disclosure.open).toBe(false);
    expect(container.querySelector('summary')).toHaveFocus();
  });
  it('gives desktop/sidebar copies independent radio groups', () => {
    const { container } = render(<><ThemePicker /><ThemePicker /></>);
    const groups = Array.from(container.querySelectorAll('fieldset')).map(group => group.querySelector('input')!.name);
    expect(groups[0]).not.toBe(groups[1]);
  });
});
