import React, { useState, useCallback } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import SkillQuickView from '../components/SkillQuickView';
import KonamiEasterEgg from '../components/KonamiEasterEgg';
import type { Skill } from '../types/skill';
import { ALL_SKILLS } from '../data/skills';
import { useStarredSkills } from '../hooks/useStarredSkills';
import { useKonamiCode } from '../hooks/useKonamiCode';
import { usePlausibleTracking, useTimeTracking, useScrollTracking, useSkillNavigationTracking } from '../hooks/usePlausibleTracking';
import '../css/win31.css';
import '../css/skills-gallery.css';

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [skillClicked, setSkillClicked] = useState(false);
  const { toggleStar, isStarred, getStarredCount } = useStarredSkills();
  const { triggered, easterEgg } = useKonamiCode();

  // Analytics tracking
  const { track } = usePlausibleTracking();
  const { trackSkillView } = useSkillNavigationTracking();
  useTimeTracking('homepage');
  useScrollTracking('homepage');

  // Last 10 newly added skills
  const newSkills = new Set([
    'bot-developer',
    'career-biographer',
    'clip-aware-embeddings',
    'competitive-cartographer',
    'design-archivist',
    'interior-design-expert',
    'jungian-psychologist',
    'personal-finance-coach',
    'photo-composition-critic',
    'skill-coach',
  ]);

  const handleSkillClick = (skill: Skill, source: 'marquee' | 'gallery' = 'marquee') => {
    setSkillClicked(true);
    setSelectedSkill(skill);
    trackSkillView(skill.id, source);
    track('Skill Clicked', {
      skill: skill.id,
      source: source,
    });
  };

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);

    // Track copy events
    if (id === 'install') {
      track('Install Command Copied');
    }
  }, [track]);

  const shareToDesktop = useCallback(async () => {
    const url = window.location.href;

    // Try Web Share API first (mobile native)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Some Neat Claude Skills',
          text: 'Check out this collection of Claude Code skills!',
          url: url,
        });
        track('Share to Desktop', { method: 'native' });
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to copy
      }
    }

    // Fallback to copy
    copyToClipboard(url, 'share');
    track('Share to Desktop', { method: 'copy' });
  }, [copyToClipboard, track]);

  const installCommand = `git clone https://github.com/erichowens/some_claude_skills.git
cp -r some_claude_skills/.claude/skills/* ~/.claude/skills/`;

  return (
    <Layout
      title={siteConfig.title}
      description="Some neat Claude skills for specialized domains"
    >
      <div className="skills-page-bg">
        <div className="skills-container skills-container--wide">
          {/* ═══════════════════════════════════════════════════════════════════
              INSTALL HERO
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="win31-window install-hero install-hero--full">
              <div className="win31-titlebar">
                <div className="win31-titlebar__left">
                  <div className="win31-btn-3d win31-btn-3d--small">─</div>
                </div>
                <span className="win31-title-text">README.TXT</span>
                <div className="win31-titlebar__right">
                  <div className="win31-btn-3d win31-btn-3d--small">▲</div>
                  <div className="win31-btn-3d win31-btn-3d--small">▼</div>
                </div>
              </div>
              <div className="install-hero__content">
                <h1 className="install-hero__main-title">{ALL_SKILLS.length} Production-Ready Claude Skills</h1>
                <p className="install-hero__subtitle" style={{
                  fontSize: '16px',
                  color: '#666',
                  marginTop: '-8px',
                  marginBottom: '16px',
                  fontStyle: 'italic'
                }}>
                  Built by Erich Owens | Ex-Meta 12 years, 12 patents | MS Applied Math
                </p>

                <p className="install-hero__exposition" style={{ position: 'relative' }}>
                  A collection of modular prompt extensions for Claude Code. Includes a <a href="/docs/guides/claude-skills-guide">guide for crafting great skills</a>, meta-skills like <strong>Career Biographer</strong> and <strong>Skill Coach</strong>, plus domain experts that have helped me on my own projects.
                </p>

                <div className="install-hero__code-block" style={{ position: 'relative' }}>
                  {/* Oval sticker - positioned to right of code block */}
                  <div className="install-hero__sticker">
                    <span>GET ALL {ALL_SKILLS.length}!</span>
                  </div>
                  <pre className="install-hero__code">{installCommand}</pre>
                  <button
                    className={`win31-btn-3d install-hero__copy-btn ${copied === 'install' ? 'install-hero__copy-btn--copied' : ''}`}
                    onClick={() => copyToClipboard(installCommand, 'install')}
                  >
                    {copied === 'install' ? '✓ COPIED!' : 'COPY'}
                  </button>
                </div>

                <div className="install-hero__badges">
                  <span className="install-hero__badge install-hero__badge--yellow">{ALL_SKILLS.length} Skills</span>
                  <span className="install-hero__badge install-hero__badge--lime">Open Source</span>
                  <span className="install-hero__badge install-hero__badge--teal">MIT License</span>
                </div>
              </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              HORIZONTAL SKILLS MARQUEE
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="win31-window marquee-window-horizontal" style={{ position: 'relative' }}>
            <div className="win31-titlebar" style={{ position: 'relative' }}>
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">─</div>
              </div>
              <span className="win31-title-text">SKILLS.DLL - Click any skill to install</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">◄</div>
                <div className="win31-btn-3d win31-btn-3d--small">►</div>
              </div>
            </div>
            <div className="skills-marquee-horizontal">
              <div className="skills-marquee-horizontal__track">
                {[...ALL_SKILLS, ...ALL_SKILLS].map((skill, idx) => (
                  <div
                    key={`${skill.id}-${idx}`}
                    className="skills-marquee-horizontal__item"
                    style={{ position: 'relative' }}
                  >
                    {newSkills.has(skill.id) && (
                      <div className="new-skill-badge">
                        <span>NEW</span>
                      </div>
                    )}
                    <img
                      src={`/img/skills/${skill.id}-hero.png`}
                      alt={skill.title}
                      className="skills-marquee-horizontal__img"
                      onClick={() => handleSkillClick(skill)}
                    />
                    <div className="skills-marquee-horizontal__label-row">
                      <a
                        href={`/docs/skills/${skill.id.replace(/-/g, '_')}`}
                        className="skills-marquee-horizontal__btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Doc
                      </a>
                      <span className="skills-marquee-horizontal__label">{skill.title}</span>
                      <button
                        className="skills-marquee-horizontal__btn"
                        onClick={(e) => { e.stopPropagation(); handleSkillClick(skill); }}
                      >
                        Get
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              VAPORWAVE PLAYER
              ═══════════════════════════════════════════════════════════════════ */}
          {/* ═══════════════════════════════════════════════════════════════════
              NAVIGATION: Three Windows
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="nav-windows">
            {/* Gallery Window */}
            <a
              href="/skills"
              className="win31-window nav-window nav-window--yellow"
              onClick={() => track('Navigation Click', { destination: 'gallery' })}
            >
              <div className="win31-titlebar">
                <div className="win31-titlebar__left">
                  <div className="win31-btn-3d win31-btn-3d--small">─</div>
                </div>
                <span className="win31-title-text">GALLERY.EXE</span>
                <div className="win31-titlebar__right">
                  <div className="win31-btn-3d win31-btn-3d--small">□</div>
                </div>
              </div>
              <div className="nav-window__content">
                <div className="nav-window__icon">📁</div>
                <h3 className="nav-window__title">Browse All Skills</h3>
                <p className="nav-window__desc">Explore all {ALL_SKILLS.length} skills with search and filtering</p>
                <div className="win31-btn-3d nav-window__btn">Open Gallery</div>
              </div>
            </a>

            {/* Guide Window - FEATURED */}
            <a
              href="/docs/guides/claude-skills-guide"
              className="win31-window nav-window nav-window--lime nav-window--featured"
              style={{ position: 'relative' }}
              onClick={() => track('Navigation Click', { destination: 'guide' })}
            >
              <div className="nav-window__recommended">★ RECOMMENDED ★</div>
              <div className="win31-titlebar">
                <div className="win31-titlebar__left">
                  <div className="win31-btn-3d win31-btn-3d--small">─</div>
                </div>
                <span className="win31-title-text">GUIDE.HLP</span>
                <div className="win31-titlebar__right">
                  <div className="win31-btn-3d win31-btn-3d--small">□</div>
                </div>
              </div>
              <div className="nav-window__content">
                <div className="nav-window__icon">📖</div>
                <h3 className="nav-window__title">Read the Guide</h3>
                <p className="nav-window__desc">Learn how skills work and create your own</p>
                <div className="win31-btn-3d nav-window__btn">Open Guide</div>
              </div>
            </a>

            {/* Docs Window */}
            <a
              href="/docs/intro"
              className="win31-window nav-window nav-window--teal"
              onClick={() => track('Navigation Click', { destination: 'docs' })}
            >
              <div className="win31-titlebar">
                <div className="win31-titlebar__left">
                  <div className="win31-btn-3d win31-btn-3d--small">─</div>
                </div>
                <span className="win31-title-text">DOCS.TXT</span>
                <div className="win31-titlebar__right">
                  <div className="win31-btn-3d win31-btn-3d--small">□</div>
                </div>
              </div>
              <div className="nav-window__content">
                <div className="nav-window__icon">📄</div>
                <h3 className="nav-window__title">Full Documentation</h3>
                <p className="nav-window__desc">API reference and installation options</p>
                <div className="win31-btn-3d nav-window__btn">Open Docs</div>
              </div>
            </a>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              WHY THIS EXISTS
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="win31-window" style={{ marginBottom: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">─</div>
              </div>
              <span className="win31-title-text">ABOUT.TXT</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">▲</div>
                <div className="win31-btn-3d win31-btn-3d--small">▼</div>
              </div>
            </div>
            <div style={{
              padding: '24px',
              fontSize: '15px',
              lineHeight: '1.7',
              color: '#333'
            }}>
              <h2 style={{ marginTop: 0, fontSize: '20px', marginBottom: '16px' }}>Why This Exists</h2>
              <p style={{ marginBottom: '12px' }}>
                After leaving Meta in August 2025, I've been building AI agents and automation tools full-time.
                These skills are what I actually use—not toy examples, but production-grade prompts that have helped me
                ship real projects across speech pathology AI, computer vision, Jungian psychology chatbots, HRV biometrics,
                and developer tooling.
              </p>
              <p style={{ marginBottom: '12px' }}>
                Most AI agent libraries are either too abstract or too simplified. This collection sits in the sweet spot:
                <strong> high technical depth with personality</strong>. Each skill has domain expertise, knows when to
                refuse bad ideas, and produces working code on the first try.
              </p>
              <p style={{ marginBottom: 0 }}>
                If you're an indie hacker, founder, or engineer building with Claude, you'll find something useful here.
                MIT licensed. <a href="https://github.com/erichowens/some_claude_skills">Fork it, extend it, make it yours.</a>
              </p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              FOOTER: Status Bar
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="win31-statusbar footer-bar" style={{ position: 'relative' }}>
            <div className="win31-statusbar-panel">{ALL_SKILLS.length} Skills Loaded</div>
            <div className="win31-statusbar-panel">6 Categories</div>
            <button
              className="win31-statusbar-panel share-to-desktop"
              onClick={shareToDesktop}
              title="Share or save for desktop"
            >
              {copied === 'share' ? '✓ Copied!' : '📧 Save for Desktop'}
            </button>
            <div className="win31-statusbar-panel" style={{ position: 'relative' }}>
              <a
                href="https://github.com/erichowens/some_claude_skills"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('GitHub Link Clicked')}
              >
                GitHub →
              </a>
              {/* GitHub sticker - positioned at bottom right of link */}
              <div className="footer-sticker">
                <span>FORK ME!</span>
              </div>
            </div>
            <div className="win31-statusbar-panel konami-hint" title="Try: ↑↑↓↓←→←→BA">
              <span className="konami-hint__icon">🎮</span>
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

      {/* Konami Code Easter Egg */}
      {triggered && track('Konami Code Activated', { effect: easterEgg })}
      <KonamiEasterEgg type={easterEgg} visible={triggered} />
    </Layout>
  );
}
