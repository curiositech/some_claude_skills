import React, { useState } from 'react';
import type { Skill } from '../types/skill';
import InstallTabs from './InstallTabs';
import { shareSkill } from '../hooks/useStarredSkills';
import { downloadSkillZip } from '@site/src/utils/downloadSkillZip';
import { useSkillStats } from '../hooks/usePlausibleStats';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { TagList } from './TagBadge';
import { skills as allSkills } from '../data/skills';

interface SkillQuickViewProps {
  skill: Skill;
  onClose: () => void;
  isStarred?: boolean;
  onToggleStar?: (skillId: string) => void;
}

export default function SkillQuickView({ skill, onClose, isStarred = false, onToggleStar }: SkillQuickViewProps): JSX.Element {
  const [shareToast, setShareToast] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { views, loading: statsLoading } = useSkillStats(skill.id);

  const handleShare = async () => {
    await shareSkill(skill.id, skill.title);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await downloadSkillZip(skill.id, skill.title);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--win31-gray)',
          border: '4px solid var(--win31-black)',
          boxShadow: '12px 12px 0 rgba(0,0,0,0.5)',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div
          style={{
            background: 'linear-gradient(90deg, var(--win31-navy), var(--win31-blue))',
            padding: '8px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: 'white', fontWeight: 'bold', fontFamily: 'var(--font-code)' }}>
            {skill.title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'var(--win31-gray)',
              border: '2px outset var(--win31-gray)',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            X
          </button>
        </div>

        {/* Hero Image */}
        <div style={{ position: 'relative', paddingBottom: '45%', background: '#000' }}>
          <img
            src={useBaseUrl(`/img/skills/${skill.id}-hero.png`)}
            alt={skill.title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {/* Quick Stats */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}>
            <div style={{
              background: 'var(--win31-yellow)',
              border: '1px solid var(--win31-black)',
              padding: '4px 12px',
              fontSize: '12px',
              fontFamily: 'var(--font-code)',
              color: '#000',
              fontWeight: 600,
            }}>
              {skill.category}
            </div>
            <div style={{
              background: '#e8ffe8',
              border: '1px solid #4a4',
              padding: '4px 12px',
              fontSize: '12px',
              fontFamily: 'var(--font-code)',
              color: '#060',
            }}>
              30 sec install
            </div>
            {!statsLoading && (
              <div style={{
                background: '#e8f4ff',
                border: '1px solid #48a',
                padding: '4px 12px',
                fontSize: '12px',
                fontFamily: 'var(--font-code)',
                color: '#036',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span>👁️</span>
                <span>{views.toLocaleString()} views</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {skill.tags && skill.tags.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <TagList tags={skill.tags} size="md" />
            </div>
          )}

          {/* Pairs Great With */}
          {skill.pairsWith && skill.pairsWith.length > 0 && (
            <div style={{
              marginBottom: '16px',
              background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f3ff 100%)',
              border: '2px solid var(--win31-navy)',
              padding: '12px',
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: 'var(--win31-navy)',
                marginBottom: '10px',
                fontFamily: 'var(--font-code)',
              }}>
                🤝 Pairs Great With
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {skill.pairsWith.map((pairing, idx) => {
                  const pairedSkill = allSkills.find(s => s.id === pairing.skill);
                  if (!pairedSkill) return null;
                  return (
                    <a
                      key={idx}
                      href={useBaseUrl(pairedSkill.path)}
                      style={{
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '8px',
                        background: 'white',
                        border: '1px solid #ccc',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fff8dc';
                        e.currentTarget.style.borderColor = 'var(--win31-navy)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.borderColor = '#ccc';
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>→</span>
                      <div>
                        <div style={{
                          fontWeight: 'bold',
                          fontSize: '13px',
                          color: 'var(--win31-navy)',
                          fontFamily: 'var(--font-code)',
                        }}>
                          {pairedSkill.title}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#555',
                          marginTop: '2px',
                        }}>
                          {pairing.reason}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <p style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#333',
            marginBottom: '20px',
          }}>
            {skill.description}
          </p>

          {/* Install Tabs */}
          <div style={{ marginBottom: '20px' }}>
            <InstallTabs
              skillId={skill.id}
              skillName={skill.title}
              compact={true}
            />
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            {/* Star Button */}
            <button
              className="win31-push-button"
              style={{
                fontSize: '14px',
                padding: '12px 24px',
                background: isStarred ? 'var(--win31-yellow)' : 'var(--win31-gray)',
              }}
              onClick={() => onToggleStar?.(skill.id)}
            >
              {isStarred ? '★ Starred' : '☆ Add Star'}
            </button>

            {/* Share Button */}
            <button
              className="win31-push-button"
              style={{
                fontSize: '14px',
                padding: '12px 24px',
              }}
              onClick={handleShare}
            >
              {shareToast ? '✓ Link Copied!' : '⤴ Share'}
            </button>

            {/* Download Zip Button */}
            <button
              className="win31-push-button"
              style={{
                fontSize: '14px',
                padding: '12px 24px',
                cursor: isDownloading ? 'wait' : 'pointer',
                opacity: isDownloading ? 0.7 : 1,
              }}
              onClick={handleDownloadZip}
              disabled={isDownloading}
            >
              {isDownloading ? '⏳ Downloading...' : '📦 Download Zip'}
            </button>

            <a
              href={useBaseUrl(skill.path)}
              style={{ textDecoration: 'none' }}
            >
              <button
                className="win31-push-button win31-push-button-default"
                style={{
                  fontSize: '14px',
                  padding: '12px 24px',
                }}
              >
                View Full Documentation
              </button>
            </a>
            <a
              href="https://github.com/curiositech/some_claude_skills"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <button
                className="win31-push-button"
                style={{
                  fontSize: '14px',
                  padding: '12px 24px',
                }}
              >
                View on GitHub
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
