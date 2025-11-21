import React, { useState, useCallback } from 'react';
import Link from '@docusaurus/Link';
import '../css/win31.css';

interface Win31SkillIconProps {
  id: string;
  title: string;
  icon: string;
  path: string;
  className?: string;
}

export default function Win31SkillIcon({
  id,
  title,
  icon,
  path,
  className = '',
}: Win31SkillIconProps): JSX.Element {
  const [isSelected, setIsSelected] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<number | null>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (clickTimer) {
      // Double click - let the link navigate
      clearTimeout(clickTimer);
      setClickTimer(null);
      setClickCount(0);
      // Don't prevent default - let Link handle navigation
    } else {
      // Single click - select only
      e.preventDefault();
      setIsSelected(true);
      setClickCount(1);
      const timer = window.setTimeout(() => {
        setClickCount(0);
        setClickTimer(null);
      }, 300);
      setClickTimer(timer);
    }
  }, [clickTimer]);

  const handleBlur = useCallback(() => {
    setIsSelected(false);
  }, []);

  return (
    <Link
      to={path}
      onClick={handleClick}
      onBlur={handleBlur}
      className={`win31-icon ${className}`}
      style={{
        background: isSelected ? 'var(--win31-navy)' : 'transparent',
        border: isSelected ? '1px dotted white' : '1px solid transparent',
        padding: '4px',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      tabIndex={0}
      aria-label={`Open ${title}`}
    >
      <div className="win31-icon-image" style={{ fontSize: '48px' }}>
        {icon}
      </div>
      <div className="win31-icon-label">
        {title}
      </div>
    </Link>
  );
}
