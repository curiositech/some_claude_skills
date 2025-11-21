import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export interface Skill {
  id: string;
  title: string;
  category: string;
  description: string;
  path: string;
  tags?: string[];
  icon?: string;
}

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps): JSX.Element {
  return (
    <div className={styles.skillCard}>
      <div className={styles.skillHeader}>
        {skill.icon && <div className={styles.skillIcon}>{skill.icon}</div>}
        <h3 className={styles.skillTitle}>
          <Link to={skill.path} className={styles.skillLink}>
            {skill.title}
          </Link>
        </h3>
      </div>

      <div className={styles.skillCategory}>{skill.category}</div>

      <p className={styles.skillDescription}>{skill.description}</p>

      {skill.tags && skill.tags.length > 0 && (
        <div className={styles.skillTags}>
          {skill.tags.map((tag, index) => (
            <span key={index} className={styles.skillTag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <Link to={skill.path} className={styles.skillButton}>
        Learn More →
      </Link>
    </div>
  );
}
