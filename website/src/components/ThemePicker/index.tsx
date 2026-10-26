import React, { useEffect, useId, useRef } from 'react';
import { useWin31Theme, ThemeName } from '../../hooks/useWin31Theme';
import { usePlausibleTracking } from '../../hooks/usePlausibleTracking';
import './styles.css';

interface ThemePickerProps { className?: string; }

/** Independent color-palette disclosure. Appearance uses Docusaurus's native control. */
export default function ThemePicker({ className = '' }: ThemePickerProps): React.JSX.Element {
  const { colorScheme, setTheme, themes } = useWin31Theme();
  const { track } = usePlausibleTracking();
  const details = useRef<HTMLDetailsElement>(null);
  const groupName = useId();
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (details.current?.open && !details.current.contains(event.target as Node)) details.current.open = false;
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  const select = (name: ThemeName) => {
    setTheme(name);
    track('Theme Changed', { theme: name });
  };
  return (
    <details ref={details} className={`theme-picker ${className}`} onKeyDown={(event) => {
      if (event.key === 'Escape' && details.current?.open) {
        details.current.open = false;
        details.current.querySelector('summary')?.focus();
      }
    }}>
      <summary className="theme-picker__btn">Palette <span aria-hidden="true">▾</span></summary>
      <div className="theme-picker__dropdown">
        <div className="theme-picker__dropdown-titlebar">Color palette</div>
        <fieldset className="theme-picker__dropdown-content">
          <legend className="sr-only">Color palette</legend>
          {themes.map((name) => (
            <label key={name} className="theme-picker__item">
              <input type="radio" name={groupName} checked={colorScheme === name} onChange={() => select(name)} />
              {name}
            </label>
          ))}
        </fieldset>
      </div>
    </details>
  );
}
