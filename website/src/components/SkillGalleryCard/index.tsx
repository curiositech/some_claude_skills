import React, { useState } from 'react';
import type { Skill } from '../../types/skill';
import { useHoverLift, HOVER_CONFIGS } from '../../hooks/useHoverLift';
import { shareSkill } from '../../hooks/useStarredSkills';
import { TagList } from '../TagBadge';
import '../../css/skills-gallery.css';

interface SkillGalleryCardProps {
  skill: Skill;
  onClick?: (skill: Skill) => void;
  variant?: 'default' | 'featured';
  basePath?: string;
  isStarred?: boolean;
  onToggleStar?: (skillId: string) => void;
}

/**
 * Reusable skill card component for gallery displays
 * Replaces duplicate card implementations in index.tsx and skills.tsx
 */
export default function SkillGalleryCard({
  skill,
  onClick,
  variant = 'default',
  basePath = '',
  isStarred = false,
  onToggleStar,
}: SkillGalleryCardProps): JSX.Element {
  const [shareToast, setShareToast] = useState(false);
  const hoverConfig = variant === 'featured' ? HOVER_CONFIGS.featuredCard : HOVER_CONFIGS.card;
  const hoverHandlers = useHoverLift(hoverConfig);

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStar?.(skill.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await shareSkill(skill.id, skill.title);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  const cardClass = variant === 'featured'
    ? 'skill-gallery-card skill-gallery-card--featured'
    : 'skill-gallery-card';

  const imageContainerClass = variant === 'featured'
    ? 'skill-card__image-container skill-card__image-container--compact'
    : 'skill-card__image-container';

  const contentClass = variant === 'featured'
    ? 'skill-card__content skill-card__content--compact'
    : 'skill-card__content';

  const titleClass = variant === 'featured'
    ? 'win31-font skill-card__title skill-card__title--compact'
    : 'win31-font skill-card__title';

  const descriptionClass = variant === 'featured'
    ? 'win31-font skill-card__description skill-card__description--compact'
    : 'win31-font skill-card__description';

  return (
    <div
      className={cardClass}
      onClick={() => onClick?.(skill)}
      {...hoverHandlers}
    >
      <div className={imageContainerClass}>
        <img
          src={`${basePath}/img/skills/${skill.id}-hero.png`}
          alt={skill.title}
          className="skill-card__image"
        />
        {/* Badge indicator */}
        {skill.badge === 'NEW' && (
          <span className="new-skill-badge">NEW!</span>
        )}
        {skill.badge === 'UPDATED' && (
          <span className="updated-skill-badge">UPDATED</span>
        )}
        <div className="skill-card__install-hint">
          Click for quick install
        </div>
        {/* Star/Share Actions */}
        <div className="skill-card__actions">
          <button
            className={`skill-card__action-btn ${isStarred ? 'skill-card__action-btn--starred' : ''}`}
            onClick={handleStar}
            title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isStarred ? '★' : '☆'}
          </button>
          <button
            className="skill-card__action-btn"
            onClick={handleShare}
            title="Share skill"
          >
            ⤴
          </button>
        </div>
        {shareToast && (
          <div className="skill-card__toast">Link copied!</div>
        )}
      </div>
      <div className={contentClass}>
        <h3 className={titleClass}>{skill.title}</h3>
        <p className={descriptionClass}>{skill.description}</p>
        {/* Tags */}
        {skill.tags && skill.tags.length > 0 && (
          <div className="skill-card__tags">
            <TagList tags={skill.tags} maxTags={4} size="sm" />
          </div>
        )}
        {variant === 'default' && (
          <div className="win31-font skill-card__category">
            {skill.category}
          </div>
        )}
      </div>
    </div>
  );
}
