import React from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type { WrapperProps } from '@docusaurus/types';
import { useLocation } from '@docusaurus/router';
import Head from '@docusaurus/Head';
import SkillHeader from '../../../components/SkillHeader';
import { ALL_SKILLS } from '../../../data/skills';

type Props = WrapperProps<typeof ContentType>;

/**
 * Extracts the skill folder name from a URL path like /docs/skills/agent_creator
 * Returns null if not a skill page or is a subpage (e.g., /docs/skills/agent_creator/references/...)
 */
function getSkillFolderName(pathname: string): string | null {
  const match = pathname.match(/^\/docs\/skills\/([^/]+)\/?$/);
  return match ? match[1] : null;
}

/**
 * DocItem/Content wrapper that automatically injects SkillHeader component
 * and per-skill OG meta tags for all skill documentation pages.
 *
 * This replaces the need to manually add <SkillHeader> to each skill's markdown.
 */
export default function ContentWrapper(props: Props): JSX.Element {
  const location = useLocation();
  const skillFolderName = getSkillFolderName(location.pathname);

  if (!skillFolderName) {
    return <Content {...props} />;
  }

  // Look up skill data by matching the URL path
  const skillPath = `/docs/skills/${skillFolderName}`;
  const skill = ALL_SKILLS.find((s) => s.path === skillPath);

  if (!skill) {
    return <Content {...props} />;
  }

  const skillId = skill.id;
  const heroImageUrl = skill.heroImage || `/img/skills/${skillId}-hero.png`;
  const absoluteHeroUrl = `https://someclaudeskills.com${heroImageUrl}`;

  return (
    <>
      {/* Per-skill OG meta tags for social sharing */}
      <Head>
        <meta property="og:image" content={absoluteHeroUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={absoluteHeroUrl} />
        <meta property="og:title" content={`${skill.title} - Some Claude Skills`} />
        <meta property="og:description" content={skill.description.slice(0, 200)} />
      </Head>

      {/* Auto-injected SkillHeader with hero image, install instructions, file browser */}
      <SkillHeader
        skillName={skill.title}
        fileName={skillFolderName}
        description={skill.description}
        tags={skill.tags}
      />

      {/* Original page content */}
      <Content {...props} />
    </>
  );
}
