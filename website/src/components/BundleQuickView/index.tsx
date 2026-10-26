import React, { useEffect, useState, useCallback } from 'react';
import type { Bundle } from '../../types/bundle';
import { TagList } from '../TagBadge';

interface BundleQuickViewProps {
  bundle: Bundle;
  onClose: () => void;
  onViewSkill?: (skillId: string) => void;
}

/**
 * Difficulty badge configuration
 */
const DIFFICULTY_CONFIG = {
  beginner: { label: 'Beginner', color: 'var(--theme-success)', bg: 'var(--theme-success-surface)' },
  intermediate: { label: 'Intermediate', color: 'var(--theme-info)', bg: 'var(--theme-info-surface)' },
  advanced: { label: 'Advanced', color: 'var(--theme-danger)', bg: 'var(--theme-danger-surface)' },
};

/**
 * Audience labels for display
 */
const AUDIENCE_LABELS: Record<string, string> = {
  developers: 'Developers',
  entrepreneurs: 'Entrepreneurs',
  teams: 'Teams',
  'technical-writers': 'Technical Writers',
  'ml-engineers': 'ML Engineers',
  newcomers: 'Newcomers',
  everyone: 'Everyone',
};

/**
 * BundleQuickView - Modal overlay for viewing bundle details
 *
 * Follows Win31 aesthetic with navy gradient title bar,
 * 3D beveled borders, and system fonts.
 */
export default function BundleQuickView({
  bundle,
  onClose,
  onViewSkill,
}: BundleQuickViewProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const diffConfig = DIFFICULTY_CONFIG[bundle.difficulty];

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Copy install command to clipboard
  const copyInstallCommand = useCallback(() => {
    navigator.clipboard.writeText(bundle.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [bundle.installCommand]);

  const requiredSkills = bundle.skills.filter((s) => !s.optional);
  const optionalSkills = bundle.skills.filter((s) => s.optional);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--win31-gray, #c0c0c0)',
          border: "4px solid var(--win31-black, var(--theme-border))",
          boxShadow: '12px 12px 0 rgba(0, 0, 0, 0.5)',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div
          style={{
            background: 'linear-gradient(90deg, #000080, #1084d0)',
            padding: '6px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              color: "var(--theme-titlebar-text)",
              fontWeight: 'bold',
              fontFamily: 'var(--font-system)',
              fontSize: '14px',
            }}
          >
            📦 {bundle.title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'var(--win31-gray, #c0c0c0)',
              border: "2px outset var(--theme-border-light)",
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px',
              padding: 0,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '16px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {/* Meta badges */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '12px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-code)',
                padding: '3px 8px',
                background: diffConfig.bg,
                color: diffConfig.color,
                border: '1px solid currentColor',
                fontWeight: 600,
              }}
            >
              {diffConfig.label}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-code)',
                padding: '3px 8px',
                background: "var(--theme-elevated)",
                color: "var(--theme-text)",
                border: '1px solid #999',
              }}
            >
              For: {AUDIENCE_LABELS[bundle.audience] || bundle.audience}
            </span>
            {bundle.featured && (
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-code)',
                  padding: '3px 8px',
                  background: 'var(--theme-sticker-yellow)',
                  color: "var(--theme-accent-ink)",
                  border: "1px solid var(--theme-border)",
                  fontWeight: 600,
                }}
              >
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Description */}
          <p
            style={{
              margin: '0 0 16px 0',
              lineHeight: 1.6,
              color: "var(--theme-text)",
            }}
          >
            {bundle.description}
          </p>

          {/* Install Command */}
          <div
            style={{
              marginBottom: '16px',
              padding: '12px',
              background: "var(--theme-code-bg)",
              border: '2px inset #666',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  color: "var(--theme-code-muted)",
                  fontSize: '11px',
                  fontFamily: 'var(--font-code)',
                }}
              >
                Install Command
              </span>
              <button
                onClick={copyInstallCommand}
                style={{
                  background: copied ? 'var(--theme-success-surface)' : 'var(--theme-surface)',
                  border: "2px outset var(--theme-border-light)",
                  padding: '2px 8px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: 'var(--font-code)',
                  color: copied ? 'var(--theme-success)' : 'var(--theme-text)',
                }}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <code
              style={{
                color: 'var(--theme-code-blue)',
                fontFamily: 'var(--font-code)',
                fontSize: '13px',
                wordBreak: 'break-all',
              }}
            >
              {bundle.installCommand}
            </code>
          </div>

          {/* Estimated Cost */}
          <div
            style={{
              marginBottom: '16px',
              padding: '10px',
              background: "var(--theme-elevated)",
              border: "1px solid var(--theme-border)",
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '11px',
                  color: "var(--theme-muted)",
                  fontFamily: 'var(--font-code)',
                }}
              >
                Est. Cost:
              </span>{' '}
              <span
                style={{
                  fontSize: '14px',
                  color: "var(--theme-success)",
                  fontWeight: 600,
                  fontFamily: 'var(--font-code)',
                }}
              >
                ~${bundle.estimatedCost.usd.toFixed(2)}/run
              </span>
            </div>
            <div>
              <span
                style={{
                  fontSize: '11px',
                  color: "var(--theme-muted)",
                  fontFamily: 'var(--font-code)',
                }}
              >
                Tokens:
              </span>{' '}
              <span
                style={{
                  fontSize: '12px',
                  color: "var(--theme-text)",
                  fontFamily: 'var(--font-code)',
                }}
              >
                ~{bundle.estimatedCost.tokens.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Skills List */}
          <div style={{ marginBottom: '16px' }}>
            <h4
              style={{
                margin: '0 0 8px 0',
                fontSize: '13px',
                fontFamily: 'var(--font-system)',
                color: "var(--theme-link)",
              }}
            >
              🔧 Included Skills ({requiredSkills.length}
              {optionalSkills.length > 0 && ` + ${optionalSkills.length} optional`})
            </h4>

            {/* Required Skills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {requiredSkills.map((skill) => (
                <div
                  key={skill.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '6px 8px',
                    background: "var(--theme-elevated)",
                    border: "1px solid var(--theme-border)",
                  }}
                >
                  <span style={{ fontSize: '12px' }}>✓</span>
                  <div style={{ flex: 1 }}>
                    <button
                      onClick={() => onViewSkill?.(skill.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: onViewSkill ? 'pointer' : 'default',
                        color: "var(--theme-link)",
                        fontWeight: 600,
                        fontSize: '12px',
                        fontFamily: 'var(--font-code)',
                        textDecoration: onViewSkill ? 'underline' : 'none',
                        textAlign: 'left',
                      }}
                    >
                      {skill.id}
                    </button>
                    <p
                      style={{
                        margin: '2px 0 0 0',
                        fontSize: '11px',
                        color: "var(--theme-muted)",
                      }}
                    >
                      {skill.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Optional Skills */}
            {optionalSkills.length > 0 && (
              <>
                <h5
                  style={{
                    margin: '12px 0 6px 0',
                    fontSize: '11px',
                    fontFamily: 'var(--font-code)',
                    color: "var(--theme-muted)",
                  }}
                >
                  Optional:
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {optionalSkills.map((skill) => (
                    <div
                      key={skill.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '4px 8px',
                        background: "var(--theme-elevated)",
                        border: "1px dashed var(--theme-border)",
                      }}
                    >
                      <span style={{ fontSize: '11px', color: "var(--theme-muted)" }}>○</span>
                      <div style={{ flex: 1 }}>
                        <button
                          onClick={() => onViewSkill?.(skill.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: onViewSkill ? 'pointer' : 'default',
                            color: "var(--theme-muted)",
                            fontSize: '11px',
                            fontFamily: 'var(--font-code)',
                            textDecoration: onViewSkill ? 'underline' : 'none',
                            textAlign: 'left',
                          }}
                        >
                          {skill.id}
                        </button>
                        <span style={{ fontSize: '10px', color: "var(--theme-muted)", marginLeft: '8px' }}>
                          {skill.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Use Cases */}
          {bundle.useCases && bundle.useCases.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '13px',
                  fontFamily: 'var(--font-system)',
                  color: "var(--theme-link)",
                }}
              >
                💡 Use Cases
              </h4>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '12px',
                  lineHeight: 1.6,
                }}
              >
                {bundle.useCases.map((useCase, i) => (
                  <li key={i} style={{ color: "var(--theme-text)" }}>
                    {useCase}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {bundle.tags && bundle.tags.length > 0 && (
            <div>
              <TagList tags={bundle.tags.filter((t) => t !== 'featured')} size="sm" />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: "2px groove var(--theme-border-light)",
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            background: 'var(--win31-gray)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'var(--win31-gray)',
              border: "2px outset var(--theme-border-light)",
              padding: '6px 16px',
              cursor: 'pointer',
              fontFamily: 'var(--font-system)',
              fontSize: '12px',
            }}
          >
            Close
          </button>
          <button
            onClick={copyInstallCommand}
            style={{
              background: copied ? '#4a9' : '#000080',
              color: "var(--theme-titlebar-text)",
              border: '2px outset #4444aa',
              padding: '6px 16px',
              cursor: 'pointer',
              fontFamily: 'var(--font-system)',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy Install Command'}
          </button>
        </div>
      </div>
    </div>
  );
}
