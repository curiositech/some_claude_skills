import React, { useState, useEffect, useRef } from 'react';
import Link from '@docusaurus/Link';
import { createPortal } from 'react-dom';
import useIsBrowser from '@docusaurus/useIsBrowser';
import type { McpServer } from '../../types/mcp';
import { MCP_STATUS_CONFIG } from '../../types/mcp';
import styles from './styles.module.css';

interface McpDetailModalProps {
  mcp: McpServer;
  onClose: () => void;
}

export default function McpDetailModal({
  mcp,
  onClose,
}: McpDetailModalProps): JSX.Element {
  const isBrowser = useIsBrowser();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'examples'>('overview');
  const statusConfig = MCP_STATUS_CONFIG[mcp.status];

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLButtonElement>('[title="Close"]')?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !dialog) return;
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]'))
        .filter(control => control.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', trapFocus);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', trapFocus);
      previousFocus?.focus();
    };
  }, [isBrowser]);

  // Generate the JSON config for settings.json
  const generateSettingsJson = () => {
    const config: Record<string, unknown> = {
      command: mcp.installConfig.command,
    };
    if (mcp.installConfig.args) {
      config.args = mcp.installConfig.args;
    }
    if (mcp.installConfig.env) {
      config.env = mcp.installConfig.env;
    }
    return JSON.stringify({ [mcp.id]: config }, null, 2);
  };

  const handleCopyConfig = async () => {
    await navigator.clipboard.writeText(generateSettingsJson());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isBrowser) return null;

  // Escape the catalogue stacking context so the fixed header cannot cover Close.
  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div ref={dialogRef} className={styles.modal} role="dialog" aria-modal="true" aria-label={`${mcp.name} details`} onClick={(e) => e.stopPropagation()}>
        {/* Title Bar - Windows 3.1 Style */}
        <div className={styles.titleBar}>
          <div className={styles.titleLeft}>
            <span className={styles.icon}>{mcp.icon || '🔌'}</span>
            <span className={styles.titleText}>{mcp.name.toUpperCase()}.EXE</span>
          </div>
          <div className={styles.titleButtons}>
            <button className={styles.titleBtn} title="Minimize">_</button>
            <button className={styles.titleBtn} title="Maximize">□</button>
            <button className={styles.titleBtnClose} onClick={onClose} title="Close" aria-label="Close MCP details">✕</button>
          </div>
        </div>

        {/* Big Install CTA Section */}
        <div className={styles.installBanner}>
          <div className={styles.installLeft}>
            <h2 className={styles.installTitle}>🚀 Add to Claude Code</h2>
            <p className={styles.installSubtitle}>
              Copy this config to your <code>~/.claude/settings.json</code>
            </p>
            {mcp.installNotes && (
              <p className={styles.installNote}>⚠️ {mcp.installNotes}</p>
            )}
          </div>
          <div className={styles.installRight}>
            <div className={styles.installConfig}>
              <pre className={styles.configCode}>{generateSettingsJson()}</pre>
              <button
                className={styles.copyBtn}
                onClick={handleCopyConfig}
              >
                {copied ? '✓ Copied!' : '📋 Copy Config'}
              </button>
            </div>
            <div className={styles.installLinks}>
              <a
                href={mcp.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.installLink}
              >
                📦 View on GitHub
              </a>
              {mcp.docsUrl && (
                <Link to={mcp.docsUrl} className={styles.installLink}>
                  📖 Full Documentation
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className={styles.content}>
          {/* Left Column - Hero + Stickers */}
          <div className={styles.leftColumn}>
            {/* Hero Image */}
            {mcp.heroImage && (
              <div className={styles.heroContainer}>
                <img src={mcp.heroImage} alt={mcp.name} className={styles.heroImage} />
              </div>
            )}

            {/* Colorful Stickers */}
            <div className={styles.stickers}>
              {mcp.badge === 'FEATURED' && (
                <div className={`${styles.sticker} ${styles.stickerFeatured}`}>
                  <span>★</span> FEATURED
                </div>
              )}
              {mcp.badge === 'NEW' && (
                <div className={`${styles.sticker} ${styles.stickerNew}`}>
                  🆕 NEW!
                </div>
              )}
              <div
                className={`${styles.sticker} ${styles.stickerStatus}`}
                style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
              >
                {statusConfig.label}
              </div>
              <div className={`${styles.sticker} ${styles.stickerCategory}`}>
                📂 {mcp.category}
              </div>
              <div className={`${styles.sticker} ${styles.stickerTools}`}>
                🔧 {mcp.tools.length} Tools
              </div>
              {mcp.version && (
                <div className={`${styles.sticker} ${styles.stickerVersion}`}>
                  v{mcp.version}
                </div>
              )}
            </div>

            {/* Quick Facts */}
            <div className={styles.quickFacts}>
              <h3 className="win31-font">Quick Facts</h3>
              <ul>
                <li><strong>Author:</strong> {mcp.author}</li>
                {mcp.lastUpdated && <li><strong>Updated:</strong> {mcp.lastUpdated}</li>}
                {mcp.requirements && mcp.requirements.length > 0 && (
                  <li><strong>Requires:</strong> {mcp.requirements.join(', ')}</li>
                )}
              </ul>
            </div>
          </div>

          {/* Right Column - Tabs + Details */}
          <div className={styles.rightColumn}>
            {/* Tab Navigation */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'tools' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('tools')}
              >
                Tools ({mcp.tools.length})
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'examples' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('examples')}
              >
                Examples
              </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
              {activeTab === 'overview' && (
                <div className={styles.overview}>
                  <h3 className="win31-font">{mcp.name}</h3>
                  <p className={styles.description}>{mcp.description}</p>

                  {mcp.longDescription && (
                    <div className={styles.longDescription}>
                      {mcp.longDescription.split('\n\n').map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))}
                    </div>
                  )}

                  {/* Feature Highlights */}
                  {mcp.features && mcp.features.length > 0 && (
                    <div className={styles.features}>
                      <h4>✨ Key Features</h4>
                      <ul>
                        {mcp.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tools' && (
                <div className={styles.toolsList}>
                  {mcp.tools.map((tool, idx) => (
                    <div key={idx} className={styles.toolCard}>
                      <div className={styles.toolHeader}>
                        <code className={styles.toolName}>{tool.name}</code>
                      </div>
                      <p className={styles.toolDescription}>{tool.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'examples' && (
                <div className={styles.examples}>
                  {mcp.examples && mcp.examples.length > 0 ? (
                    mcp.examples.map((example, idx) => (
                      <div key={idx} className={styles.exampleCard}>
                        <h4 className={styles.exampleTitle}>{example.title}</h4>
                        <p className={styles.exampleDescription}>{example.description}</p>
                        {example.prompt && (
                          <div className={styles.examplePrompt}>
                            <span className={styles.promptLabel}>Try this prompt:</span>
                            <code>{example.prompt}</code>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className={styles.noExamples}>
                      <p>📝 Example usage coming soon!</p>
                      <p>Check the <Link to={mcp.docsUrl || mcp.githubUrl}>documentation</Link> for usage patterns.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className={styles.statusBar}>
          <div className={styles.statusPanel}>
            Ready
          </div>
          <div className={styles.statusPanel}>
            {mcp.tools.length} tools available
          </div>
          <div className={styles.statusPanel}>
            Press ESC to close
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
