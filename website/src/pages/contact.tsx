import React from 'react';
import Layout from '@theme/Layout';
import '../css/win31.css';

export default function Contact(): JSX.Element {
  return (
    <Layout
      title="Contact & Work With Me"
      description="Get in touch with Erich Owens about Agentic Learning, Claude Skills, AI consulting, or collaboration opportunities"
    >
      <div className="skills-page-bg">
        <div className="skills-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>

          {/* Main Contact Card */}
          <div className="win31-window">
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">─</div>
              </div>
              <span className="win31-title-text">CONTACT.EXE</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">▲</div>
                <div className="win31-btn-3d win31-btn-3d--small">▼</div>
              </div>
            </div>

            <div style={{ padding: '32px' }}>
              <h1 style={{ marginTop: 0, fontSize: '28px', marginBottom: '8px' }}>
                Let's Build Something
              </h1>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                Ex-Meta 12 Years | 12 Patents | ML/CV/AI/VR/AR | Applied Mathematician
              </p>

              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Background</h2>
                <p style={{ lineHeight: '1.7', marginBottom: '12px' }}>
                  I spent <strong>12 years at Meta</strong> (2013-2024) as an engineering leader 
                  (alternatingly Staff Engineer, Tech Lead Manager, and Engineering Manager)  across ML, computer vision,
                  VR/AR, and AI research departments (at <strong> Facebook, Oculus, Social VR, FAIR, and Instagram</strong>). 
                  I hold <strong>12 patents</strong> spanning comment ranking algorithms, VR avatar
                  generation, thermal haptics for VR controllers, and content quality classification.
                </p>
                <p style={{ lineHeight: '1.7', marginBottom: '12px' }}>
                  Key achievements: Led <strong>GPT-3/CLIP avatar customization</strong> (fourth Hackathon win), 
                  managed 40 avatar pipeline/craft/rendering/ML engineers,
                  shipped the <strong>"avatar from photo" system</strong> for Facebook Spaces in 2 months (founding engineer),
                  contributed to <strong>open-source medical AI research</strong> with NYU's fastMRI project (proven in human trials),
                  built <strong>peltier-cooled VR controllers</strong> for thermal haptics (Third Hackathon win: "fire and ice in VR"),
                  overhauled <strong>comment ranking for quality and civility</strong> (authored Commentology tool still used today),
                  and created <strong>first CV-based newsfeed personalization</strong> (hackathon win/patent: "hide babies on news feed").
                </p>
                <p style={{ lineHeight: '1.7', marginBottom: 0 }}>
                  Education: <strong>MS Applied Mathematics from Brown University</strong>, BS from Columbia.
                  Research background in probability theory, cryptography, nonlinear dynamics, and mathematical methods in neuroscience.
                </p>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>What I'm Working On Now</h2>
                <p style={{ lineHeight: '1.7', marginBottom: '12px' }}>
                  After leaving Meta in August 2025, I've been building AI agents, automation tools,
                  and open source projects full-time. I created this collection of {' '}
                  <a href="/">39 production-ready Claude Skills</a> to help indie hackers and
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
                  I'm advising a stealth drone/AI startup and exploring what's next—leadership roles (EM, Director, VP Eng),
                  technical advisory positions, or founding opportunities at the intersection of AI, spatial computing,
                  creative tools, or embodied intelligence.
                </p>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Get In Touch</h2>
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
                      padding: '12px 16px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    <span>💼</span> LinkedIn
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
                      padding: '12px 16px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    <span>🔧</span> GitHub
                  </a>

                  <a
                    href="https://github.com/erichowens/some_claude_skills"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="win31-btn-3d"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    <span>📦</span> Claude Skills Repo
                  </a>
                </div>
              </div>

              <div style={{
                background: '#f0f0f0',
                border: '2px solid #ccc',
                padding: '20px',
                marginTop: '32px'
              }}>
                <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '12px' }}>
                  💡 Good Fits for Consulting
                </h3>
                <ul style={{ marginBottom: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>VR/AR applications: avatar systems, haptic feedback, spatial computing, embodied experiences</li>
                  <li>Computer vision systems: CLIP embeddings, face tracking, photo understanding, event detection</li>
                  <li>ML ranking and recommendation systems: content quality, personalization, engagement optimization</li>
                  <li>Building AI agents or automation workflows with Claude/LLMs</li>
                  <li>Health tech AI: speech pathology tools, HRV analysis, medical imaging (experience with fastMRI)</li>
                  <li>Psychology-focused AI: Jungian chatbots, shadow work tools, therapeutic applications</li>
                  <li>Developer tooling and CLI applications</li>
                  <li>Integrating LLMs into existing products (creation tools, composers, editors)</li>
                  <li>Architecture review and technical leadership for AI-powered applications</li>
                </ul>
              </div>

              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: '#fffbea',
                border: '2px solid #f59e0b'
              }}>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                  <strong>📧 Email:</strong> Reach me via LinkedIn for fastest response.
                  For general feedback or questions about Claude Skills, feel free to{' '}
                  <a href="https://github.com/erichowens/some_claude_skills/issues">open a GitHub issue</a>.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="win31-window" style={{ marginTop: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">─</div>
              </div>
              <span className="win31-title-text">STATS.INI</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">□</div>
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
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0066cc' }}>12</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Years at Meta</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0066cc' }}>12</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Patents</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0066cc' }}>39</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Claude Skills</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0066cc' }}>4</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Hackathon Wins</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0066cc' }}>MS</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Applied Math</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
