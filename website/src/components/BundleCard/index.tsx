import React from 'react';
import type { Bundle } from '../../types/bundle';
import { useHoverLift, HOVER_CONFIGS } from '../../hooks/useHoverLift';
import { TagList } from '../TagBadge';
import './styles.css';

interface BundleCardProps {
  bundle: Bundle;
  onClick?: (bundle: Bundle) => void;
  variant?: 'default' | 'featured';
  basePath?: string;
}

/**
 * Difficulty badge colors and labels
 */
const DIFFICULTY_CONFIG = {
  beginner: { label: 'Beginner', color: 'var(--theme-success)', bg: 'var(--theme-success-surface)' },
  intermediate: { label: 'Intermediate', color: 'var(--theme-info)', bg: 'var(--theme-info-surface)' },
  advanced: { label: 'Advanced', color: 'var(--theme-danger)', bg: 'var(--theme-danger-surface)' },
};

/**
 * Audience icons
 */
const AUDIENCE_ICONS: Record<string, string> = {
  developers: '💻',
  entrepreneurs: '🚀',
  teams: '👥',
  'technical-writers': '📝',
  'ml-engineers': '🤖',
  newcomers: '🌱',
  everyone: '🌍',
};

/**
 * BundleCard - Displays a skill bundle in the gallery
 *
 * Similar to SkillGalleryCard but for curated skill bundles.
 * Shows bundle title, description, skill count, and estimated cost.
 */
export default function BundleCard({
  bundle,
  onClick,
  variant = 'default',
  basePath = '',
}: BundleCardProps): React.JSX.Element {
  const hoverConfig = variant === 'featured' ? HOVER_CONFIGS.featuredCard : HOVER_CONFIGS.card;
  const hoverHandlers = useHoverLift(hoverConfig);
  const diffConfig = DIFFICULTY_CONFIG[bundle.difficulty];
  const audienceIcon = AUDIENCE_ICONS[bundle.audience] || '📦';

  const requiredSkills = bundle.skills.filter(s => !s.optional);
  const optionalSkills = bundle.skills.filter(s => s.optional);

  const cardClass = variant === 'featured'
    ? 'bundle-card bundle-card--featured'
    : 'bundle-card';

  return (
    <div
      className={cardClass}
      onClick={() => onClick?.(bundle)}
      {...hoverHandlers}
    >
      {/* Header with audience icon */}
      <div className="bundle-card__header">
        <span className="bundle-card__audience-icon">{audienceIcon}</span>
        <div className="bundle-card__badges">
          {bundle.featured && (
            <span className="bundle-card__badge bundle-card__badge--featured">
              ⭐ Featured
            </span>
          )}
          <span
            className="bundle-card__badge"
            style={{ background: diffConfig.bg, color: diffConfig.color }}
          >
            {diffConfig.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="bundle-card__content">
        <h3 className="win31-font bundle-card__title">{bundle.title}</h3>
        <p className="win31-font bundle-card__description">{bundle.description}</p>

        {/* Skill count */}
        <div className="bundle-card__skill-count">
          <span className="bundle-card__skill-count-icon">🔧</span>
          <span>
            {requiredSkills.length} skills
            {optionalSkills.length > 0 && ` (+${optionalSkills.length} optional)`}
          </span>
        </div>

        {/* Estimated cost */}
        <div className="bundle-card__cost">
          <span className="bundle-card__cost-label">Est. cost:</span>
          <span className="bundle-card__cost-value">
            ~${bundle.estimatedCost.usd.toFixed(2)}/run
          </span>
        </div>

        {/* Tags */}
        {bundle.tags && bundle.tags.length > 0 && (
          <div className="bundle-card__tags">
            <TagList tags={bundle.tags.filter(t => t !== 'featured')} maxTags={4} size="sm" />
          </div>
        )}
      </div>

      {/* Install hint */}
      <div className="bundle-card__install-hint">
        Click to install bundle
      </div>
    </div>
  );
}
