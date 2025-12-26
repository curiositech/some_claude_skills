import React from 'react';
import Link from '@docusaurus/Link';
import { Artifact } from '@site/src/types/artifact';
import styles from './styles.module.css';

interface ArtifactCardProps {
  artifact: Artifact;
}

const difficultyConfig = {
  beginner: { label: '⭐', color: '#10b981' },
  intermediate: { label: '⭐⭐', color: '#f59e0b' },
  advanced: { label: '⭐⭐⭐', color: '#ef4444' }
};

const categoryConfig = {
  design: { icon: '🎨', label: 'Design' },
  development: { icon: '💻', label: 'Development' },
  'ai-ml': { icon: '🤖', label: 'AI/ML' },
  research: { icon: '🔬', label: 'Research' },
  writing: { icon: '✍️', label: 'Writing' },
  meta: { icon: '🔄', label: 'Meta' },
  frontend: { icon: '🖥️', label: 'Frontend' },
  lifestyle: { icon: '🏠', label: 'Lifestyle' },
  relationships: { icon: '💝', label: 'Relationships' },
  wellness: { icon: '🧘', label: 'Wellness' }
};

export default function ArtifactCard({ artifact }: ArtifactCardProps): JSX.Element {
  const category = categoryConfig[artifact.category];
  const difficulty = artifact.difficulty ? difficultyConfig[artifact.difficulty] : null;

  // Custom routes for specific artifacts with dedicated pages
  const customRoutes: Record<string, string> = {
    'multi-skill-site-reliability-engineer-integration': '/artifacts/site-reliability-engineer-integration',
  };

  // Construct the artifact URL - use custom route if available, otherwise query parameter
  const artifactPath = customRoutes[artifact.id] || `/artifact?id=${artifact.id}`;

  return (
    <div className={styles.artifactCard}>
      <div className={styles.header}>
        <div className={styles.category}>
          <span className={styles.categoryIcon}>{category.icon}</span>
          <span className={styles.categoryLabel}>{category.label}</span>
        </div>
        {difficulty && (
          <div className={styles.difficulty} style={{ color: difficulty.color }}>
            {difficulty.label}
          </div>
        )}
      </div>

      {artifact.heroImage && (
        <div className={styles.heroImage}>
          <img src={artifact.heroImage} alt={artifact.title} />
        </div>
      )}

      <h3 className={styles.title}>
        <Link to={artifactPath}>{artifact.title}</Link>
      </h3>

      <p className={styles.description}>{artifact.description}</p>

      <div className={styles.skills}>
        {artifact.skills.map((skill, index) => {
          // Use custom link if provided, otherwise generate skill doc path
          const skillLink = (skill as any).link || `/docs/skills/${skill.name.replace(/-/g, '_')}`;
          return (
            <span key={index} className={styles.skillTag}>
              <Link to={skillLink}>{skill.name}</Link>
            </span>
          );
        })}
      </div>

      {artifact.outcome.metrics && artifact.outcome.metrics.length > 0 && (
        <div className={styles.metrics}>
          {artifact.outcome.metrics.slice(0, 3).map((metric, index) => (
            <div key={index} className={styles.metric}>
              <span className={styles.metricValue}>{metric.value}</span>
              <span className={styles.metricLabel}>{metric.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <div className={styles.meta}>
          <span className={styles.type}>
            {artifact.type === 'single-skill' && '🎯 Solo'}
            {artifact.type === 'multi-skill' && '🎼 Orchestra'}
            {artifact.type === 'comparison' && '⚖️ Comparison'}
          </span>
          <span className={styles.date}>
            {new Date(artifact.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>

        <Link to={artifactPath} className={styles.viewButton}>
          View Artifact →
        </Link>
      </div>

      {artifact.featured && (
        <div className={styles.featuredBadge}>
          ⭐ Featured
        </div>
      )}
    </div>
  );
}
