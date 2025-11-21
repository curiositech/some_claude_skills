import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Win31SkillIcon from '../components/Win31SkillIcon';
import '../css/win31.css';
import styles from './index.module.css';

const featuredSkills = [
  {
    id: 'orchestrator',
    title: 'Orchestrator',
    icon: '🎭',
    path: '/docs/skills/orchestrator',
  },
  {
    id: 'typography-expert',
    title: 'Typography',
    icon: '🔤',
    path: '/docs/skills/typography_expert',
  },
  {
    id: 'metal-shader-expert',
    title: 'Metal Shader',
    icon: '✨',
    path: '/docs/skills/metal_shader_expert',
  },
  {
    id: 'collage-layout-expert',
    title: 'Collage Layout',
    icon: '🎨',
    path: '/docs/skills/collage_layout_expert',
  },
  {
    id: 'vaporwave-ui',
    title: 'Vaporwave UI',
    icon: '💎',
    path: '/docs/skills/vaporwave_glassomorphic_ui_designer',
  },
  {
    id: 'native-app-designer',
    title: 'Native App',
    icon: '📱',
    path: '/docs/skills/native_app_designer',
  },
  {
    id: 'drone-cv-expert',
    title: 'Drone CV',
    icon: '🚁',
    path: '/docs/skills/drone_cv_expert',
  },
  {
    id: 'speech-pathology',
    title: 'Speech Path',
    icon: '🗣️',
    path: '/docs/skills/speech_pathology_ai',
  },
  {
    id: 'photo-intelligence',
    title: 'Photo Intel',
    icon: '📸',
    path: '/docs/skills/photo_content_recognition_curation_expert',
  },
  {
    id: 'event-detection',
    title: 'Event Detect',
    icon: '⏰',
    path: '/docs/skills/event_detection_temporal_intelligence_expert',
  },
  {
    id: 'physics-rendering',
    title: 'Physics',
    icon: '⚙️',
    path: '/docs/skills/physics_rendering_expert',
  },
  {
    id: 'sound-engineer',
    title: 'Sound Eng',
    icon: '🎵',
    path: '/docs/skills/sound_engineer',
  },
];

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={siteConfig.title}
      description="Expert AI agents for specialized tasks - Windows 3.1 style"
    >
      <div className="win31-desktop">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              marginBottom: '40px',
              background: 'var(--win31-gray)',
              border: '2px solid var(--win31-black)',
              padding: '20px',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
            }}
          >
            <h1
              className="win31-font"
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: 'var(--win31-navy)',
              }}
            >
              {siteConfig.title}
            </h1>
            <p className="win31-font" style={{ fontSize: '14px', marginBottom: '15px' }}>
              {siteConfig.tagline}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href="/some_claude_skills/docs/intro" style={{ textDecoration: 'none' }}>
                <button className="win31-push-button win31-push-button-default">
                  Get Started
                </button>
              </a>
              <a href="/some_claude_skills/skills" style={{ textDecoration: 'none' }}>
                <button className="win31-push-button">View All Skills</button>
              </a>
            </div>
          </div>

          <div className={styles.skillsDesktop}>
            <h2
              className="win31-font"
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '20px',
                color: 'white',
                textShadow: '2px 2px 0 rgba(0,0,0,0.8)',
              }}
            >
              Featured Expert Skills
            </h2>
            <div className="win31-icon-grid">
              {featuredSkills.map((skill) => (
                <Win31SkillIcon
                  key={skill.id}
                  id={skill.id}
                  title={skill.title}
                  icon={skill.icon}
                  path={skill.path}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: '40px',
              background: 'var(--win31-gray)',
              border: '2px solid var(--win31-black)',
              padding: '16px',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
            }}
          >
            <div className="win31-statusbar">
              <div className="win31-statusbar-panel">
                Ready - 25 skills available
              </div>
              <div className="win31-statusbar-panel" style={{ marginLeft: 'auto' }}>
                Double-click icons to explore
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
