import React, { useState, useMemo } from 'react';
import Layout from '@theme/Layout';
import DraggableWin31Window from '../components/DraggableWin31Window';
import Win31SkillIcon from '../components/Win31SkillIcon';
import Win31Taskbar from '../components/Win31Taskbar';
import '../css/win31.css';

const allSkills = [
  // Design & Development
  {
    id: 'web-design-expert',
    title: 'Web Design',
    category: 'Design & Dev',
    description: 'Creates unique web apps with strong brand identity beyond generic templates.',
    path: '/docs/skills/web_design_expert',
    tags: ['Design', 'Branding', 'UI/UX'],
    icon: '🎨',
  },
  {
    id: 'design-system-creator',
    title: 'Design System',
    category: 'Design & Dev',
    description: 'Builds comprehensive design systems and design bibles with production CSS.',
    path: '/docs/skills/design_system_creator',
    tags: ['Design Systems', 'CSS'],
    icon: '📚',
  },
  {
    id: 'native-app-designer',
    title: 'Native App',
    category: 'Design & Dev',
    description: 'Breathtaking iOS/Mac and web apps with organic, non-AI aesthetic.',
    path: '/docs/skills/native_app_designer',
    tags: ['SwiftUI', 'iOS', 'Animation'],
    icon: '📱',
  },
  {
    id: 'vaporwave-ui',
    title: 'Vaporwave UI',
    category: 'Design & Dev',
    description: 'Modern aesthetic UI blending vaporwave nostalgia with glassomorphic elegance.',
    path: '/docs/skills/vaporwave_glassomorphic_ui_designer',
    tags: ['UI', 'SwiftUI', 'Material'],
    icon: '💎',
  },
  {
    id: 'typography-expert',
    title: 'Typography',
    category: 'Design & Dev',
    description: 'Master typographer: font pairing, OpenType features, variable fonts, performance optimization.',
    path: '/docs/skills/typography_expert',
    tags: ['Typography', 'Fonts', 'Performance'],
    icon: '🔤',
  },
  // Specialized Technical
  {
    id: 'metal-shader-expert',
    title: 'Metal Shader',
    category: 'Technical',
    description: '20 years Weta/Pixar experience in real-time graphics and shaders.',
    path: '/docs/skills/metal_shader_expert',
    tags: ['Metal', 'Shaders', 'Graphics'],
    icon: '✨',
  },
  {
    id: 'physics-rendering-expert',
    title: 'Physics Eng',
    category: 'Technical',
    description: 'Computational physics and real-time rope/cable dynamics.',
    path: '/docs/skills/physics_rendering_expert',
    tags: ['Physics', 'Simulation'],
    icon: '⚙️',
  },
  {
    id: 'drone-cv-expert',
    title: 'Drone CV',
    category: 'Technical',
    description: 'Expert in drone systems, computer vision, and autonomous navigation.',
    path: '/docs/skills/drone_cv_expert',
    tags: ['CV', 'Drones', 'AI'],
    icon: '🚁',
  },
  {
    id: 'drone-inspection-specialist',
    title: 'Inspection',
    category: 'Technical',
    description: 'Advanced CV for infrastructure inspection with thermal analysis.',
    path: '/docs/skills/drone_inspection_specialist',
    tags: ['Inspection', '3D', 'Thermal'],
    icon: '🔍',
  },
  // Visual Intelligence
  {
    id: 'collage-layout-expert',
    title: 'Collage Layout',
    category: 'Visual AI',
    description: 'Computational collage composition inspired by David Hockney joiners.',
    path: '/docs/skills/collage_layout_expert',
    tags: ['Collage', 'Vision', 'Art'],
    icon: '🖼️',
  },
  {
    id: 'photo-content',
    title: 'Photo Intel',
    category: 'Visual AI',
    description: 'Advanced photo content recognition and intelligent curation.',
    path: '/docs/skills/photo_content_recognition_curation_expert',
    tags: ['Vision', 'ML', 'Curation'],
    icon: '📸',
  },
  {
    id: 'event-detection',
    title: 'Event Detect',
    category: 'Visual AI',
    description: 'Event detection and temporal intelligence for photo analysis.',
    path: '/docs/skills/event_detection_temporal_intelligence_expert',
    tags: ['Events', 'Time', 'ML'],
    icon: '⏰',
  },
  {
    id: 'color-theory',
    title: 'Color Theory',
    category: 'Visual AI',
    description: 'Color palette harmony and theory expert.',
    path: '/docs/skills/color_theory_palette_harmony_expert',
    tags: ['Color', 'Design', 'Theory'],
    icon: '🎨',
  },
  // Specialized Skills
  {
    id: 'sound-engineer',
    title: 'Sound Eng',
    category: 'Specialized',
    description: 'Expert audio engineering with spatial audio and procedural sound design.',
    path: '/docs/skills/sound_engineer',
    tags: ['Audio', 'DSP', 'Spatial'],
    icon: '🎵',
  },
  {
    id: 'speech-pathology',
    title: 'Speech Path',
    category: 'Specialized',
    description: 'AI-powered speech therapy and phoneme analysis.',
    path: '/docs/skills/speech_pathology_ai',
    tags: ['Speech', 'Therapy', 'AI'],
    icon: '🗣️',
  },
  {
    id: 'vr-avatar',
    title: 'VR Avatar Eng',
    category: 'Specialized',
    description: 'Photorealistic VR avatars with face tracking, voice, and cross-platform support.',
    path: '/docs/skills/vr_avatar_engineer',
    tags: ['Avatar', 'VR', 'Vision Pro', 'Quest'],
    icon: '👤',
  },
  // Research & Strategy
  {
    id: 'research-analyst',
    title: 'Research',
    category: 'Research',
    description: 'Thorough landscape research and evidence-based insights.',
    path: '/docs/skills/research_analyst',
    tags: ['Research', 'Analysis'],
    icon: '🔬',
  },
  {
    id: 'team-builder',
    title: 'Team Builder',
    category: 'Research',
    description: 'Designs high-performing teams using org psychology.',
    path: '/docs/skills/team_builder',
    tags: ['Team', 'Psychology'],
    icon: '👥',
  },
  // Personal Growth
  {
    id: 'adhd-design-expert',
    title: 'ADHD Design',
    category: 'Growth',
    description: 'Neuroscience-backed UX design for ADHD brains.',
    path: '/docs/skills/adhd_design_expert',
    tags: ['ADHD', 'Neuroscience'],
    icon: '🧠',
  },
  {
    id: 'hrv-alexithymia',
    title: 'HRV Expert',
    category: 'Growth',
    description: 'Heart rate variability biometrics and emotional awareness.',
    path: '/docs/skills/hrv_alexithymia_expert',
    tags: ['Health', 'Biometrics'],
    icon: '❤️',
  },
  {
    id: 'wisdom-coach',
    title: 'Wisdom Coach',
    category: 'Growth',
    description: 'Longitudinal memory tracking and personal accountability.',
    path: '/docs/skills/wisdom_accountability_coach',
    tags: ['Coaching', 'Philosophy'],
    icon: '🦉',
  },
  {
    id: 'tech-entrepreneur',
    title: 'Tech Coach',
    category: 'Growth',
    description: 'Big tech ML engineer to indie founder transition.',
    path: '/docs/skills/tech_entrepreneur_coach_adhd',
    tags: ['Business', 'ADHD'],
    icon: '🚀',
  },
  {
    id: 'project-mgmt',
    title: 'Project Mgmt',
    category: 'Growth',
    description: 'Expert project manager for ADHD engineers.',
    path: '/docs/skills/project_management_guru_adhd',
    tags: ['PM', 'ADHD'],
    icon: '📋',
  },
  // Meta Skills
  {
    id: 'orchestrator',
    title: 'Orchestrator',
    category: 'Meta',
    description: 'Master coordinator that delegates to specialist skills.',
    path: '/docs/skills/orchestrator',
    tags: ['Meta', 'Coordination'],
    icon: '🎭',
  },
  {
    id: 'agent-creator',
    title: 'Agent Creator',
    category: 'Meta',
    description: 'Meta-agent for creating new custom agents and skills.',
    path: '/docs/skills/agent_creator',
    tags: ['Meta', 'Agent Design'],
    icon: '🛠️',
  },
];

const categories = [
  'All',
  'Design & Dev',
  'Technical',
  'Visual AI',
  'Specialized',
  'Research',
  'Growth',
  'Meta',
];

export default function SkillsPage(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showDialup, setShowDialup] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [dialupStage, setDialupStage] = useState(0);

  const filteredSkills = useMemo(() => {
    return allSkills.filter((skill) => {
      const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
      const matchesSearch =
        skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Easter egg: Triple-click title to trigger dialup
  const handleTitleClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount === 2) {
      setShowDialup(true);
      setDialupStage(0);
      setClickCount(0);
    }
    setTimeout(() => setClickCount(0), 1000);
  };

  // Progress through dialup stages
  React.useEffect(() => {
    if (showDialup && dialupStage < 6) {
      const timer = setTimeout(() => {
        setDialupStage(prev => prev + 1);
      }, dialupStage === 0 ? 500 : dialupStage === 5 ? 2000 : 1500);
      return () => clearTimeout(timer);
    }
  }, [showDialup, dialupStage]);

  return (
    <Layout
      title="Skills Gallery"
      description="Explore all Claude Skills - Windows 3.1 style"
    >
      <div className="win31-desktop" style={{ minHeight: '100vh', paddingBottom: '50px' }}>
        {!isMinimized && (
          <DraggableWin31Window
            title={
              <span onClick={handleTitleClick} style={{ cursor: 'pointer' }}>
                ◄◄ SKILLS GALLERY ►► File Manager
              </span>
            }
            initialPosition={{ x: 50, y: 50 }}
            initialSize={{ width: Math.min(1000, typeof window !== 'undefined' ? window.innerWidth - 100 : 1000), height: Math.min(700, typeof window !== 'undefined' ? window.innerHeight - 150 : 700) }}
            onMinimize={() => setIsMinimized(true)}
            onMaximize={() => setIsMaximized(!isMaximized)}
            isMaximized={isMaximized}
            zIndex={1}
          >
            <div className="win31-menubar">
              <div className="win31-menu-item">▓ File</div>
              <div className="win31-menu-item">▓ View</div>
              <div className="win31-menu-item">▓ Help</div>
            </div>

            <div
              className="win31-panel win31-panel-inset"
              style={{ marginTop: '8px', marginBottom: '8px', padding: '12px', background: '#000', border: '3px solid var(--win31-yellow)' }}
            >
              <div style={{
                fontFamily: 'var(--font-code)',
                color: 'var(--win31-yellow)',
                fontSize: '11px',
                marginBottom: '8px',
                textAlign: 'center',
                letterSpacing: '2px'
              }}>
                ╔══════════════════════════════════════════╗<br/>
                ║  ░░░ SEARCH & FILTER CONSOLE ░░░        ║<br/>
                ╚══════════════════════════════════════════╝
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span style={{ color: 'var(--win31-lime)', fontFamily: 'var(--font-code)', fontSize: '14px' }}>▸</span>
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="win31-font"
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    border: '2px solid var(--win31-lime)',
                    background: '#000',
                    color: 'var(--win31-lime)',
                    fontFamily: 'var(--font-code)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {categories.map((category, idx) => {
                  const colors = ['var(--win31-yellow)', 'var(--win31-red)', 'var(--win31-magenta)', 'var(--win31-lime)', 'var(--win31-teal)', 'var(--win31-bright-yellow)', 'var(--win31-bright-red)', 'var(--win31-navy)'];
                  const bgColor = colors[idx % colors.length];
                  return (
                    <button
                      key={category}
                      className={
                        selectedCategory === category
                          ? 'win31-push-button win31-push-button-default'
                          : 'win31-push-button'
                      }
                      onClick={() => setSelectedCategory(category)}
                      style={{
                        minWidth: '80px',
                        background: selectedCategory === category ? bgColor : 'var(--win31-gray)',
                        color: selectedCategory === category ? '#000' : 'var(--win31-black)',
                        fontWeight: selectedCategory === category ? 'bold' : 'normal',
                        border: selectedCategory === category ? `3px solid ${bgColor}` : '2px outset var(--win31-gray)'
                      }}
                    >
                      ▓ {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="win31-panel win31-panel-inset"
              style={{
                background: '#1a1a1a',
                minHeight: '400px',
                padding: '16px',
                overflow: 'auto',
                border: '3px solid var(--win31-red)',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-code)',
                color: 'var(--win31-red)',
                fontSize: '10px',
                marginBottom: '12px',
                textAlign: 'center',
                background: '#000',
                padding: '8px',
                border: '2px solid var(--win31-red)',
              }}>
                ┌─────────────────────────────────────────┐<br/>
                │ ▒▒▒ DISPLAYING {filteredSkills.length} OF {allSkills.length} SKILLS ▒▒▒ │<br/>
                └─────────────────────────────────────────┘
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                  gap: '24px',
                }}
              >
                {filteredSkills.map((skill) => (
                  <div
                    key={skill.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Win31SkillIcon
                      id={skill.id}
                      title={skill.title}
                      icon={skill.icon}
                      path={skill.path}
                    />
                    <p
                      className="win31-font"
                      style={{
                        fontSize: '9px',
                        textAlign: 'center',
                        marginTop: '4px',
                        color: 'var(--win31-lime)',
                        maxWidth: '90px',
                        fontFamily: 'var(--font-code)',
                      }}
                    >
                      {skill.description.substring(0, 50)}
                      {skill.description.length > 50 ? '...' : ''}
                    </p>
                  </div>
                ))}
              </div>

              {filteredSkills.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{
                    fontFamily: 'var(--font-code)',
                    fontSize: '11px',
                    marginBottom: '20px',
                    background: '#000',
                    color: 'var(--win31-red)',
                    padding: '16px',
                    border: '3px solid var(--win31-red)',
                  }}>
                    ╔════════════════════════════╗<br/>
                    ║  ⚠ ERROR 404 ⚠           ║<br/>
                    ║  NO SKILLS FOUND!         ║<br/>
                    ╚════════════════════════════╝
                  </div>
                  <button
                    className="win31-push-button"
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }}
                    style={{
                      background: 'var(--win31-bright-yellow)',
                      border: '3px solid var(--win31-red)',
                      fontWeight: 'bold',
                    }}
                  >
                    ▓ RESET FILTERS
                  </button>
                </div>
              )}
            </div>

            <div className="win31-statusbar" style={{
              marginTop: '8px',
              background: '#000',
              border: '2px solid var(--win31-yellow)',
              color: 'var(--win31-yellow)',
              fontFamily: 'var(--font-code)',
            }}>
              <div style={{
                border: '1px solid var(--win31-yellow)',
                padding: '2px 6px',
                marginRight: '4px'
              }}>
                ▸ {filteredSkills.length} item{filteredSkills.length !== 1 ? 's' : ''}
              </div>
              <div style={{
                border: '1px solid var(--win31-lime)',
                padding: '2px 6px',
                marginLeft: 'auto',
                color: 'var(--win31-lime)',
              }}>
                ░ Double-click to open
              </div>
            </div>
          </DraggableWin31Window>
        )}

        <Win31Taskbar
          windows={[
            {
              id: 'skills',
              title: 'Skills Gallery - File Manager',
              isMinimized,
            },
          ]}
          onWindowClick={() => {
            setIsMinimized(false);
            setIsMaximized(false);
          }}
        />

        {/* DIAL-UP MODEM EASTER EGG */}
        {showDialup && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            fontFamily: 'var(--font-code)',
          }}>
            <div style={{
              background: '#000',
              border: '5px solid var(--win31-yellow)',
              padding: '40px',
              maxWidth: '800px',
              width: '90%',
            }}>
              <div style={{
                color: 'var(--win31-yellow)',
                fontSize: '14px',
                marginBottom: '20px',
                textAlign: 'center',
              }}>
                ╔══════════════════════════════════════════════════════════╗<br/>
                ║  TRUMPET WINSOCK v2.1 - CONNECTION MANAGER             ║<br/>
                ╚══════════════════════════════════════════════════════════╝
              </div>

              <div style={{ color: 'var(--win31-lime)', fontSize: '12px', lineHeight: '1.8', marginBottom: '20px' }}>
                {dialupStage >= 0 && '> Initializing modem...\n'}
                {dialupStage >= 1 && '> ATZ OK\n'}
                {dialupStage >= 1 && '> ATDT 1-800-CLAUDE\n'}
                {dialupStage >= 2 && '> ♪♫ SCREEEEE... KRRRRssshhh... PING PING ♪♫\n'}
                {dialupStage >= 3 && '> CONNECT 56000/ARQ/V90/LAPM/V42BIS\n'}
                {dialupStage >= 4 && '> PPP Session established...\n'}
                {dialupStage >= 4 && '> Requesting IP address from ISP...\n'}
                {dialupStage >= 5 && '> IP: 192.168.90.210 ASSIGNED\n'}
                {dialupStage >= 5 && '> Gateway: 192.168.90.1\n'}
                {dialupStage >= 5 && '> DNS: 4.2.2.1, 4.2.2.2\n'}
                {dialupStage >= 6 && <span style={{ color: 'var(--win31-bright-yellow)', fontWeight: 'bold' }}>
                  {'> ★ CONNECTION SUCCESSFUL! Welcome to the Information Superhighway! ★\n'}
                </span>}
              </div>

              {dialupStage >= 2 && (
                <div style={{
                  background: '#000',
                  border: '2px solid var(--win31-red)',
                  padding: '15px',
                  marginBottom: '20px',
                  color: 'var(--win31-red)',
                  fontSize: '10px',
                  textAlign: 'center',
                }}>
                  <pre style={{ margin: 0, fontFamily: 'var(--font-code)' }}>{`
    _______________
   |  ___________  |
   | |           | |
   | |  MODEM    | |    ◄ RX [█████░░░]
   | |  56K      | |    ► TX [███░░░░░]
   | |___________|_|
   |_______________|    ⚡ CARRIER DETECT
       ||     ||
       ||     ||
`}</pre>
                </div>
              )}

              {dialupStage >= 6 && (
                <div style={{
                  textAlign: 'center',
                  marginTop: '30px',
                }}>
                  <button
                    className="win31-push-button"
                    onClick={() => {
                      setShowDialup(false);
                      setDialupStage(0);
                    }}
                    style={{
                      background: 'var(--win31-bright-yellow)',
                      color: '#000',
                      border: '3px solid var(--win31-yellow)',
                      padding: '10px 30px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    ▓ CONTINUE TO SKILLS GALLERY
                  </button>
                  <div style={{
                    marginTop: '20px',
                    color: 'var(--win31-dark-gray)',
                    fontSize: '10px',
                  }}>
                    Remember: Don't pick up the phone!
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
