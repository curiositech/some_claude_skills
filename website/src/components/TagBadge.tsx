import React from 'react';
import { useHistory } from '@docusaurus/router';
import { getTag, getTagColors } from '../types/tags';

interface TagBadgeProps {
  tagId: string;
  onClick?: (tagId: string) => void;
  size?: 'sm' | 'md';
  clickable?: boolean;
}

/**
 * TagBadge - Clickable tag that links to filtered skills page
 * Colors are determined by tag type (skill-type, domain, output, complexity, integration)
 */
export default function TagBadge({
  tagId,
  onClick,
  size = 'sm',
  clickable = true
}: TagBadgeProps): JSX.Element | null {
  const history = useHistory();
  const tag = getTag(tagId);
  const colors = getTagColors(tagId);

  if (!tag) {
    console.warn(`Unknown tag: ${tagId}`);
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onClick) {
      onClick(tagId);
    } else if (clickable) {
      // Navigate to skills page with tag filter
      history.push(`/skills?tags=${tagId}`);
    }
  };

  const sizeStyles = size === 'sm'
    ? { fontSize: '11px', padding: '2px 8px' }
    : { fontSize: '13px', padding: '4px 12px' };

  return (
    <span
      onClick={handleClick}
      title={tag.description}
      className="win31-font"
      style={{
        display: 'inline-block',
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        fontWeight: 500,
        cursor: clickable || onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        ...sizeStyles,
      }}
      onMouseEnter={(e) => {
        if (clickable || onClick) {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {tag.label}
    </span>
  );
}

interface TagListProps {
  tags: string[];
  onClick?: (tagId: string) => void;
  size?: 'sm' | 'md';
  maxTags?: number;
  clickable?: boolean;
}

/**
 * TagList - Renders multiple tags with optional limit
 */
export function TagList({
  tags,
  onClick,
  size = 'sm',
  maxTags,
  clickable = true
}: TagListProps): JSX.Element {
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const hiddenCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px',
      alignItems: 'center'
    }}>
      {displayTags.map((tagId) => (
        <TagBadge
          key={tagId}
          tagId={tagId}
          onClick={onClick}
          size={size}
          clickable={clickable}
        />
      ))}
      {hiddenCount > 0 && (
        <span style={{
          fontSize: size === 'sm' ? '11px' : '13px',
          color: "var(--theme-muted)",
          marginLeft: '2px'
        }}>
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}
