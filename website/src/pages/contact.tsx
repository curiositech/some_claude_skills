import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import '../css/win31.css';

export default function HireAuthor(): JSX.Element {
  return (
    <Layout
      title="How to Hire Author"
      description="Hire Erich Owens - Mathematical problem-solver, 12 years Meta, 12 patents, ML/CV/VR/AR expert"
    >
      <div className="skills-page-bg">
        <div className="skills-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>

          {/* Hero */}
          <div className="win31-window">
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">-</div>
              </div>
              <span className="win31-title-text">HIRE_AUTHOR.EXE</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">[]</div>
              </div>
            </div>
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <h1 style={{
                marginTop: 0,
                fontSize: '36px',
                marginBottom: '12px',
                color: '#FF7F50',
                textShadow: '2px 2px 0px #808080'
              }}>
                Erich Owens
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#333',
                marginBottom: '24px',
                fontStyle: 'italic'
              }}>
                Mathematical Problem-Solver Who Jumps Domains (NLP→CV→VR→Medical AI→Drones) and Ships Systems That Last Decades
              </p>
              <p style={{ fontSize: '15px', color: '#666', maxWidth: '700px', margin: '0 auto 24px', lineHeight: '1.6' }}>
                Where most engineers specialize, Erich generalizes through mathematics. Where most build features, Erich builds systems that last. Where most choose IC or management, Erich oscillates based on impact. The result: decade-lasting infrastructure across wildly different domains.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href="https://www.linkedin.com/in/erich-owens-01a38446/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="win31-btn-3d"
                  style={{ padding: '12px 24px', fontWeight: 'bold', background: '#000080', color: 'white' }}
                >
                  Contact via LinkedIn
                </a>
                <a
                  href="https://github.com/erichowens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="win31-btn-3d"
                  style={{ padding: '12px 24px', fontWeight: 'bold' }}
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>

          {/* What Sets Me Apart */}
          <div className="win31-window" style={{ marginTop: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">-</div>
              </div>
              <span className="win31-title-text">DIFFERENTIATORS.TXT</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">[]</div>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <h2 style={{ marginTop: 0, fontSize: '22px', marginBottom: '16px', color: '#000080' }}>What Sets Me Apart</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  "Domain agility: Uses mathematical foundations to master new fields rapidly—from NLP to computer vision to VR/AR to medical AI to drone systems to psychology AI",
                  "Enduring systems: Built comment ranking algorithms and tools still running 10+ years later at Meta scale",
                  "Oscillating roles: Moves fluidly between deep IC work (Staff Engineer, Tech Lead) and leadership (managing 40 engineers) based on what the problem needs",
                  "Speed without shortcuts: 2-month avatar system MVP that became company's best-reviewed product; peltier-cooled VR controllers from hackathon to Building 8 research",
                  "12 patents spanning domains: Comment ranking, VR avatars, thermal haptics, content quality, viral propagation, CV-based personalization",
                  "Technical depth + creative taste: Hired ex-Pixar talent, curated avant-garde AR effects, mixed utility with aesthetics"
                ].map((item, i) => (
                  <li key={i} style={{
                    padding: '8px 0 8px 24px',
                    position: 'relative',
                    lineHeight: '1.6'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      color: '#FF7F50',
                      fontWeight: 'bold'
                    }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* What I'm Working On Now */}
          <div className="win31-window" style={{ marginTop: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">-</div>
              </div>
              <span className="win31-title-text">CURRENT_WORK.TXT</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">[]</div>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <h2 style={{ marginTop: 0, fontSize: '22px', marginBottom: '16px', color: '#000080' }}>What I'm Working On Now</h2>
              <p style={{ lineHeight: '1.7', marginBottom: '12px' }}>
                After leaving Meta in August 2025, I've been building AI agents, automation tools,
                and open source projects full-time. I created this collection of {' '}
                <Link to="/">39+ production-ready Claude Skills</Link> to help indie hackers and
                engineers ship faster with AI, especially in fields near and dear to me.
              </p>
              <p style={{ lineHeight: '1.7', marginBottom: '12px' }}>
                My current work spans: <strong>speech pathology AI</strong> (phoneme analysis, articulation visualization),{' '}
                <strong>HRV biometrics and alexithymia training</strong> (emotional awareness through physiological signals),{' '}
                <strong>computer vision and photo understanding</strong> (CLIP embeddings, event detection, composition analysis),{' '}
                <strong>Jungian psychology chatbots</strong> (shadow work, dream analysis, individuation),
                and <strong>AI tooling for developers</strong> (ADHD-optimized coding assistant, Claude Skills framework, agent orchestration).
              </p>
              <p style={{ lineHeight: '1.7', marginBottom: 0 }}>
                Currently CTO at <strong>Dolphin AI</strong> (drone/AI startup) building AI/CV systems for geospatial intelligence,
                roof damage assessment, and property analytics. Open to <strong>Senior IC or Leadership roles</strong> building
                transformative AI products at startups or big tech.
              </p>
            </div>
          </div>

          {/* Career Highlights */}
          <div className="win31-window" style={{ marginTop: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">-</div>
              </div>
              <span className="win31-title-text">CAREER_HIGHLIGHTS.DAT</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">[]</div>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <h2 style={{ marginTop: 0, fontSize: '22px', marginBottom: '20px', color: '#000080' }}>Career Highlights</h2>

              <div style={{ display: 'grid', gap: '16px' }}>
                {[
                  {
                    role: "Engineering Manager / Tech Lead Manager - Facebook AI Editing",
                    company: "Meta",
                    period: "2023-2024",
                    highlight: "Integrated cutting-edge CV/LLMs into Facebook's content creation pipeline, shipped AI-powered editing to billions"
                  },
                  {
                    role: "Engineering Manager - Avatars Craft",
                    company: "Meta",
                    period: "2022-2023",
                    highlight: "Managed 40 engineers, pioneered GPT-3/Stable Diffusion for avatar customization"
                  },
                  {
                    role: "Engineering Manager / TLM - XR Tech",
                    company: "Meta",
                    period: "2021-2022",
                    highlight: "Built mobile face tracker for all Meta AR platforms, FACS expression tracking, audio lipsync"
                  },
                  {
                    role: "Staff Engineer - Instagram AR Platform",
                    company: "Meta",
                    period: "2019-2021",
                    highlight: "Effect curation, hired art curators, built search/exploration tools for Spark creators"
                  },
                  {
                    role: "Research Engineering Manager - FAIR",
                    company: "Meta",
                    period: "2018-2019",
                    highlight: "Led fastMRI project with NYU Langone, open-sourced ELF OpenGo (AlphaZero implementation)"
                  },
                  {
                    role: "Founding Engineer - Facebook Spaces",
                    company: "Meta",
                    period: "2016-2018",
                    highlight: "Built 'avatar from photo' in 2 months, hired ex-Pixar talent, best-reviewed avatars (FastCompany)"
                  },
                  {
                    role: "Tech Lead - Comment Ranking",
                    company: "Meta",
                    period: "2014-2015",
                    highlight: "Built Commentology tool still used decade later, Thompson sampling, PNLambda config language"
                  }
                ].map((job, i) => (
                  <div key={i} style={{
                    padding: '16px',
                    background: '#FAF7F0',
                    border: '2px solid #e0e0e0'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#000080', fontSize: '15px' }}>{job.role}</div>
                    <div style={{ color: '#FF7F50', fontWeight: 'bold', fontSize: '14px' }}>{job.company}</div>
                    <div style={{ color: '#808080', fontStyle: 'italic', fontSize: '13px', marginBottom: '8px' }}>{job.period}</div>
                    <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{job.highlight}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How to Contact */}
          <div className="win31-window" style={{ marginTop: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">-</div>
              </div>
              <span className="win31-title-text">CONTACT.INI</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">[]</div>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <h2 style={{ marginTop: 0, fontSize: '22px', marginBottom: '16px', color: '#000080' }}>How to Contact</h2>
              <div style={{
                display: 'grid',
                gap: '12px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
              }}>
                <a
                  href="https://www.linkedin.com/in/erich-owens-01a38446/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="win31-btn-3d"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 16px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  LinkedIn (Fastest)
                </a>
                <a
                  href="https://github.com/erichowens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="win31-btn-3d"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 16px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  GitHub
                </a>
                <a
                  href="https://github.com/erichowens/some_claude_skills/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="win31-btn-3d"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 16px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Skills Issues
                </a>
              </div>
            </div>
          </div>

          {/* Good Fits for Consulting */}
          <div className="win31-window" style={{ marginTop: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">-</div>
              </div>
              <span className="win31-title-text">CONSULTING.TXT</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">[]</div>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <h2 style={{ marginTop: 0, fontSize: '22px', marginBottom: '16px', color: '#000080' }}>Good Fits for Consulting</h2>
              <ul style={{ marginBottom: 0, paddingLeft: '20px', lineHeight: '1.9' }}>
                <li><strong>VR/AR applications:</strong> avatar systems, haptic feedback, spatial computing, embodied experiences</li>
                <li><strong>Computer vision systems:</strong> CLIP embeddings, face tracking, photo understanding, event detection</li>
                <li><strong>ML ranking and recommendation systems:</strong> content quality, personalization, engagement optimization</li>
                <li><strong>Building AI agents or automation workflows</strong> with Claude/LLMs</li>
                <li><strong>Health tech AI:</strong> speech pathology tools, HRV analysis, medical imaging (experience with fastMRI)</li>
                <li><strong>Psychology-focused AI:</strong> Jungian chatbots, shadow work tools, therapeutic applications</li>
                <li><strong>Developer tooling</strong> and CLI applications</li>
                <li><strong>Architecture review and technical leadership</strong> for AI-powered applications</li>
              </ul>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="win31-window" style={{ marginTop: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">-</div>
              </div>
              <span className="win31-title-text">STATS.INI</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">[]</div>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '16px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#000080' }}>12</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Years at Meta</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#000080' }}>12</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Patents</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#000080' }}>39+</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Claude Skills</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#000080' }}>4</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Hackathon Wins</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#000080' }}>MS</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Applied Math</div>
                </div>
              </div>
            </div>
          </div>

          {/* Attribution */}
          <div className="win31-window" style={{ marginTop: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">-</div>
              </div>
              <span className="win31-title-text">CREDITS.TXT</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">[]</div>
              </div>
            </div>
            <div style={{ padding: '20px', fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
              <p style={{ marginTop: 0, marginBottom: '8px' }}>
                <strong>This page was built using Claude Skills:</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li><Link to="/docs/skills/cv_creator">cv-creator</Link> - Career narrative extraction and portfolio generation</li>
                <li><Link to="/docs/skills/career_biographer">career-biographer</Link> - Professional story structuring</li>
                <li><Link to="/docs/skills/competitive_cartographer">competitive-cartographer</Link> - Market positioning and differentiation</li>
                <li><Link to="/docs/skills/vibe_matcher">vibe-matcher</Link> - Visual DNA and aesthetic direction</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
