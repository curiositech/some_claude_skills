import React, { useState, useCallback } from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import SkillQuickView from '../components/SkillQuickView';
import KonamiEasterEgg from '../components/KonamiEasterEgg';
import ChangelogPreview from '../components/ChangelogPreview';
import type { Skill } from '../types/skill';
import { ALL_SKILLS } from '../data/skills';
import { useStarredSkills } from '../hooks/useStarredSkills';
import { useKonamiCode } from '../hooks/useKonamiCode';
import { usePlausibleTracking, useTimeTracking, useScrollTracking, useSkillNavigationTracking } from '../hooks/usePlausibleTracking';
import '../css/win31.css';
import '../css/skills-gallery.css';
import '../css/backsplash.css';

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
      track('Install Command Copied', { method: 'git-clone' });
    } else if (id === 'marketplace') {
      track('Install Command Copied', { method: 'marketplace' });
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

  const installCommand = `git clone https://github.com/curiositech/some_claude_skills.git
cp -r some_claude_skills/.claude/skills/* ~/.claude/skills/`;

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: "Erich's Best Claude Skills",
    description: `${ALL_SKILLS.length}+ production-ready AI skills for Claude Code. Expert agents that encode real domain expertise for ML, computer vision, audio, psychology, and developer tools.`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Cross-platform',
    url: 'https://someclaudeskills.com',
    author: {
      '@type': 'Person',
      name: 'Erich Owens',
      url: 'https://linkedin.com/in/erich-owens-01a38446/',
      jobTitle: 'ML Engineer',
      worksFor: {
        '@type': 'Organization',
        name: 'Independent',
      },
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    license: 'https://opensource.org/licenses/MIT',
    codeRepository: 'https://github.com/curiositech/some_claude_skills',
    programmingLanguage: ['TypeScript', 'Markdown'],
    keywords: [
      'Claude Code',
      'AI skills',
      'Claude skills',
      'AI agents',
      'prompt engineering',
      'machine learning',
      'computer vision',
      'developer tools',
    ],
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "Erich's Best Claude Skills",
    url: 'https://someclaudeskills.com',
    logo: 'https://someclaudeskills.com/img/logo.svg',
    sameAs: [
      'https://github.com/curiositech/some_claude_skills',
      'https://linkedin.com/in/erich-owens-01a38446/',
    ],
  };

  return (
    <Layout
      title={siteConfig.title}
      description={`${ALL_SKILLS.length}+ production-ready AI skills for Claude Code. Expert agents for ML, computer vision, audio, psychology, and developer tools.`}
    >
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(organizationJsonLd)}
        </script>
        <meta name="keywords" content="Claude Code, AI skills, Claude skills, AI agents, prompt engineering, machine learning, computer vision, developer tools, Anthropic Claude" />
        <link rel="canonical" href="https://someclaudeskills.com/" />
      </Head>
      <div className="skills-page-bg page-backsplash page-backsplash--homepage page-backsplash--medium">
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
                <h1 className="install-hero__main-title">Make Claude an Expert at Anything</h1>
                <p className="install-hero__subtitle" style={{
                  fontSize: '16px',
                  color: '#666',
                  marginTop: '-8px',
                  marginBottom: '16px',
                  fontStyle: 'italic'
                }}>
                  {ALL_SKILLS.length} free, open-source skills for Claude Code
                </p>

                {/* Two-column layout: explainer left, install right */}
                <div style={{
                  display: 'flex',
                  gap: '24px',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}>
                  {/* Left column: explainer text */}
                  <div style={{ flex: '1 1 300px', minWidth: '280px' }}>
                    <p className="install-hero__exposition" style={{ position: 'relative', marginTop: 0 }}>
                      Claude Code is an AI assistant made by Anthropic. It can read your files, run commands, and write code directly on your computer. Skills are instruction files that give Claude deep expertise in specific areas. Think of it as having a senior developer on retainer who can now selectively go get a master's degree in some new topic.
                    </p>

                    <p className="install-hero__exposition" style={{ position: 'relative' }}>
                      This collection includes skills for <strong>ML engineers</strong> (computer vision, drone systems), <strong>designers</strong> (typography, color theory, UI), <strong>founders</strong> (career storytelling, competitive analysis), and <strong>personal growth</strong> (ADHD coaching, Jungian psychology). Each one was built for real projects I've worked on.
                    </p>

                    <div className="install-hero__badges">
                      <span className="install-hero__badge install-hero__badge--yellow">{ALL_SKILLS.length} Skills</span>
                      <span className="install-hero__badge install-hero__badge--lime">Open Source</span>
                      <span className="install-hero__badge install-hero__badge--teal">MIT License</span>
                    </div>
                  </div>

                  {/* Right column: install box */}
                  <div style={{ flex: '1 1 340px', minWidth: '300px' }}>
                    {/* PRIMARY: Marketplace Install */}
                    <div style={{
                      background: 'linear-gradient(135deg, #0a2a0a 0%, #001a00 100%)',
                      border: '3px solid var(--win31-lime)',
                      padding: '16px',
                      marginBottom: '12px',
                      position: 'relative',
                    }}>
                      {/* "Recommended" ribbon */}
                      <div style={{
                        position: 'absolute',
                        top: '-1px',
                        right: '16px',
                        background: 'var(--win31-lime)',
                        color: '#000',
                        padding: '3px 10px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        fontFamily: 'var(--font-code)',
                      }}>
                        RECOMMENDED
                      </div>

                      <div style={{
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: 'var(--win31-lime)',
                        marginBottom: '10px',
                        fontFamily: 'var(--font-code)',
                      }}>
                        {'>'}_ Claude Code Marketplace
                      </div>

                      {/* Step 1 */}
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '4px',
                        }}>
                          <span style={{
                            background: 'var(--win31-lime)',
                            color: '#000',
                            padding: '2px 6px',
                            fontSize: '9px',
                            fontWeight: 'bold',
                            fontFamily: 'var(--font-code)',
                          }}>
                            STEP 1
                          </span>
                          <span style={{ color: 'var(--win31-lime)', fontSize: '11px', fontFamily: 'var(--font-code)' }}>
                            Add the marketplace (one time)
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <code style={{
                            flex: 1,
                            background: '#000',
                            padding: '8px 10px',
                            border: '2px solid var(--win31-lime)',
                            color: 'var(--win31-lime)',
                            fontSize: '11px',
                            fontFamily: 'var(--font-code)',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            /plugin marketplace add curiositech/some_claude_skills
                          </code>
                          <button
                            className="win31-btn-3d"
                            style={{
                              background: copied === 'marketplace' ? 'var(--win31-lime)' : 'var(--win31-gray)',
                              color: copied === 'marketplace' ? '#000' : 'inherit',
                              fontWeight: 'bold',
                              fontSize: '11px',
                              padding: '6px 10px',
                            }}
                            onClick={() => copyToClipboard('/plugin marketplace add curiositech/some_claude_skills', 'marketplace')}
                          >
                            {copied === 'marketplace' ? '✓' : 'COPY'}
                          </button>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '4px',
                        }}>
                          <span style={{
                            background: 'var(--win31-bright-yellow)',
                            color: '#000',
                            padding: '2px 6px',
                            fontSize: '9px',
                            fontWeight: 'bold',
                            fontFamily: 'var(--font-code)',
                          }}>
                            STEP 2
                          </span>
                          <span style={{ color: 'var(--win31-bright-yellow)', fontSize: '11px', fontFamily: 'var(--font-code)' }}>
                            Install any skill
                          </span>
                        </div>
                        <code style={{
                          background: '#000',
                          padding: '8px 10px',
                          border: '2px solid var(--win31-bright-yellow)',
                          color: 'var(--win31-bright-yellow)',
                          fontSize: '11px',
                          fontFamily: 'var(--font-code)',
                          display: 'block',
                        }}>
                          /plugin install skill-name@some-claude-skills
                        </code>
                      </div>

                      <div style={{
                        marginTop: '10px',
                        fontSize: '10px',
                        color: '#888',
                        fontFamily: 'var(--font-code)',
                      }}>
                        Browse skills below and click "Get" for exact install commands
                      </div>
                    </div>

                    {/* SECONDARY: Git Clone (collapsed toggle) */}
                    <details style={{
                      background: 'var(--win31-gray)',
                      border: '2px solid #808080',
                    }}>
                      <summary style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontFamily: 'var(--font-code)',
                        fontWeight: 'bold',
                        color: '#333',
                        listStyle: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        <span style={{ fontSize: '9px' }}>▶</span>
                        Alternative: Clone all {ALL_SKILLS.length} skills (git)
                      </summary>
                      <div style={{ padding: '10px 12px', paddingTop: 0 }}>
                        <div className="install-hero__code-block" style={{ position: 'relative', marginTop: '6px' }}>
                          <pre className="install-hero__code" style={{ fontSize: '10px', padding: '8px' }}>{installCommand}</pre>
                          <button
                            className={`win31-btn-3d install-hero__copy-btn ${copied === 'install' ? 'install-hero__copy-btn--copied' : ''}`}
                            style={{ fontSize: '10px', padding: '4px 8px' }}
                            onClick={() => copyToClipboard(installCommand, 'install')}
                          >
                            {copied === 'install' ? '✓ COPIED!' : 'COPY'}
                          </button>
                        </div>
                      </div>
                    </details>
                  </div>
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
                <strong>The problem:</strong> Every time you ask Claude for help with something specialized, you have to explain the context from scratch. "I'm building a photo app, and I need help with color theory..." Then you get generic advice that misses the nuances.
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>The solution:</strong> Skills pre-load Claude with deep expertise. When you activate the <em>Color Theory Expert</em> skill, Claude already knows about LAB color spaces, earth-mover distance for palette matching, warm/cool alternation—stuff that would take pages to explain.
              </p>
              <p style={{ marginBottom: '12px' }}>
                Built by <a href="https://erichowens.com">Erich Owens</a>. These skills are what I actually use—not toy examples, but production-grade prompts for speech pathology AI, computer vision, psychology chatbots, and developer tooling.
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>Who is this for?</strong> Developers who use Claude Code. Founders building AI features. Anyone who's ever thought "I wish Claude just <em>knew</em> this stuff already."
                MIT licensed. <a href="https://github.com/curiositech/some_claude_skills">Fork it, extend it, make it yours.</a>
              </p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              RECENT UPDATES
              ═══════════════════════════════════════════════════════════════════ */}
          <ChangelogPreview />

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
                href="https://github.com/curiositech/some_claude_skills"
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
