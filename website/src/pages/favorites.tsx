import React, { useState, useMemo } from 'react';
import Layout from '@theme/Layout';
import SkillQuickView from '../components/SkillQuickView';
import SkillGalleryCard from '../components/SkillGalleryCard';
import type { Skill } from '../types/skill';
import { ALL_SKILLS } from '../data/skills';
import { useStarredSkills } from '../hooks/useStarredSkills';
import '../css/win31.css';
import '../css/skills-gallery.css';
import '../css/backsplash.css';

export default function FavoritesPage(): JSX.Element {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const { toggleStar, isStarred, getStarredCount, getStarredIds } = useStarredSkills();

  const starredSkills = useMemo(() => {
    const starredIds = getStarredIds();
    return ALL_SKILLS.filter(skill => starredIds.includes(skill.id));
  }, [getStarredIds]);

  return (
    <Layout
      title="Favorites"
      description="Your starred Claude Skills"
    >
      <div className="skills-page-bg page-backsplash page-backsplash--favorites page-backsplash--medium">
        <div className="skills-container">
          {/* Header */}
          <div className="win31-panel-box">
            <div className="section-header">
              <h1 className="win31-font hero-title" style={{ fontSize: '32px' }}>
                Your Favorites
              </h1>
              <p className="win31-font" style={{ fontSize: '16px', textAlign: 'center', color: "var(--theme-text)", marginBottom: '20px' }}>
                {getStarredCount() > 0
                  ? `You have ${getStarredCount()} starred skill${getStarredCount() === 1 ? '' : 's'}`
                  : 'Star skills to save them here for quick access'}
              </p>
            </div>
          </div>

          {/* Starred Skills Grid */}
          {starredSkills.length > 0 ? (
            <div className="skills-grid">
              {starredSkills.map((skill) => (
                <SkillGalleryCard
                  key={skill.id}
                  skill={skill}
                  onClick={setSelectedSkill}
                  isStarred={isStarred(skill.id)}
                  onToggleStar={toggleStar}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="no-results">
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>☆</div>
              <h3 className="win31-font no-results__title">No favorites yet</h3>
              <p className="win31-font no-results__description">
                Browse the Skills Gallery and click the star icon on any skill to add it here.
              </p>
              <a href="/skills" style={{ textDecoration: 'none' }}>
                <button
                  className="win31-push-button"
                  style={{ padding: '12px 24px', fontSize: '14px' }}
                >
                  Browse Skills Gallery
                </button>
              </a>
            </div>
          )}

          {/* Footer */}
          <div className="win31-panel-box win31-panel-box--small-shadow" style={{ marginBottom: 0 }}>
            <div className="win31-statusbar footer-bar" style={{ justifyContent: 'center', gap: '20px', padding: '20px' }}>
              <div className="win31-statusbar-panel">
                {starredSkills.length} of {ALL_SKILLS.length} skills starred
              </div>
              <div className="win31-statusbar-panel">
                <a href="/skills" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Browse All Skills
                </a>
              </div>
              <div className="win31-statusbar-panel">
                <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedSkill && (
        <SkillQuickView
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          isStarred={isStarred(selectedSkill.id)}
          onToggleStar={toggleStar}
        />
      )}
    </Layout>
  );
}
