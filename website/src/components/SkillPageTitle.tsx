import React from 'react';

interface SkillPageTitleProps {
  title: string;
}

export default function SkillPageTitle({ title }: SkillPageTitleProps): JSX.Element {
  return (
    <h1
      style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '24px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        marginBottom: '24px',
        color: "var(--theme-text)",
      }}
    >
      {title}
    </h1>
  );
}
