'use client';

/**
 * CONTROL.EXE - Windows 3.1 Control Panel
 * 
 * Settings for colors, sounds, and display
 */

import React, { useState } from 'react';
import { useWin31Theme, COLOR_SCHEMES, type ThemeName } from '@/hooks/useWin31Theme';
import styles from './control-panel.module.css';

type Panel = 'main' | 'colors' | 'fonts' | 'desktop' | 'sounds';

export function ControlPanel() {
  const { colorScheme, setTheme, themes } = useWin31Theme();
  const [activePanel, setActivePanel] = useState<Panel>('main');
  const [previewTheme, setPreviewTheme] = useState<ThemeName>(colorScheme);

  const handleThemeSelect = (theme: ThemeName) => {
    setPreviewTheme(theme);
  };

  const applyTheme = () => {
    setTheme(previewTheme);
  };

  if (activePanel === 'main') {
    return (
      <div className={styles.controlPanel}>
        <div className={styles.iconGrid}>
          <button className={styles.icon} onClick={() => setActivePanel('colors')}>
            <div className={styles.iconImage}>🎨</div>
            <span className={styles.iconLabel}>Colors</span>
          </button>
          <button className={styles.icon} onClick={() => setActivePanel('fonts')}>
            <div className={styles.iconImage}>🔤</div>
            <span className={styles.iconLabel}>Fonts</span>
          </button>
          <button className={styles.icon} onClick={() => setActivePanel('desktop')}>
            <div className={styles.iconImage}>🖥️</div>
            <span className={styles.iconLabel}>Desktop</span>
          </button>
          <button className={styles.icon} onClick={() => setActivePanel('sounds')}>
            <div className={styles.iconImage}>🔊</div>
            <span className={styles.iconLabel}>Sounds</span>
          </button>
          <button className={styles.icon} disabled>
            <div className={styles.iconImage}>⌨️</div>
            <span className={styles.iconLabel}>Keyboard</span>
          </button>
          <button className={styles.icon} disabled>
            <div className={styles.iconImage}>🖱️</div>
            <span className={styles.iconLabel}>Mouse</span>
          </button>
          <button className={styles.icon} disabled>
            <div className={styles.iconImage}>🖨️</div>
            <span className={styles.iconLabel}>Printers</span>
          </button>
          <button className={styles.icon} disabled>
            <div className={styles.iconImage}>📅</div>
            <span className={styles.iconLabel}>Date/Time</span>
          </button>
        </div>
        <div className={styles.statusBar}>
          <span>Double-click an icon to change settings</span>
        </div>
      </div>
    );
  }

  if (activePanel === 'colors') {
    const preview = COLOR_SCHEMES[previewTheme];

    return (
      <div className={styles.colorPanel}>
        <div className={styles.panelHeader}>
          <button className={styles.backButton} onClick={() => setActivePanel('main')}>
            ← Back
          </button>
          <span className={styles.panelTitle}>Color</span>
        </div>

        <div className={styles.colorContent}>
          {/* Color Schemes List */}
          <div className={styles.schemeSection}>
            <label className={styles.label}>Color Schemes:</label>
            <div className={styles.schemeList}>
              {themes.map((theme) => (
                <button
                  key={theme}
                  className={`${styles.schemeItem} ${previewTheme === theme ? styles.schemeItemActive : ''}`}
                  onClick={() => handleThemeSelect(theme)}
                >
                  {theme}
                  {colorScheme === theme && ' ✓'}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className={styles.previewSection}>
            <label className={styles.label}>Preview:</label>
            <div 
              className={styles.preview}
              style={{ backgroundColor: preview.desktop }}
            >
              <div 
                className={styles.previewWindow}
                style={{ backgroundColor: preview.gray }}
              >
                <div 
                  className={styles.previewTitlebar}
                  style={{ backgroundColor: preview.navy }}
                >
                  <span style={{ color: '#fff' }}>Active Window</span>
                </div>
                <div className={styles.previewContent}>
                  <div 
                    className={styles.previewInactiveWindow}
                    style={{ backgroundColor: preview.gray }}
                  >
                    <div className={styles.previewInactiveTitlebar}>
                      <span style={{ color: '#808080' }}>Inactive</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className={styles.buttonRow}>
            <button className={styles.button} onClick={applyTheme}>
              OK
            </button>
            <button className={styles.button} onClick={() => setActivePanel('main')}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Other panels - placeholder
  return (
    <div className={styles.controlPanel}>
      <div className={styles.panelHeader}>
        <button className={styles.backButton} onClick={() => setActivePanel('main')}>
          ← Back
        </button>
        <span className={styles.panelTitle}>{activePanel}</span>
      </div>
      <div className={styles.placeholder}>
        <p>This panel is under construction.</p>
      </div>
    </div>
  );
}
