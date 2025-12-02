"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HireAuthor;
var react_1 = require("react");
var Layout_1 = require("@theme/Layout");
var Link_1 = require("@docusaurus/Link");
require("../css/win31.css");
function HireAuthor() {
    return (<Layout_1.default title="How to Hire Author" description="Hire Erich Owens - Mathematical problem-solver, 12 years Meta, 12 patents, ML/CV/VR/AR expert">
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
                Architect & Tool Builder Who Makes Complex Systems Legible
              </p>
              <p style={{ fontSize: '15px', color: '#666', maxWidth: '700px', margin: '0 auto 24px', lineHeight: '1.6' }}>
                Mathematical and creative problem solver open to Senior IC or Leadership roles building transformative AI products at startups or big tech. I build systems that last and tools that explain them—so others can understand the problem and see how the solution works.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="https://www.linkedin.com/in/erich-owens-01a38446/" target="_blank" rel="noopener noreferrer" className="win31-btn-3d" style={{ padding: '12px 24px', fontWeight: 'bold', background: '#000080', color: 'white' }}>
                  Contact via LinkedIn
                </a>
                <a href="https://www.erichowens.com" target="_blank" rel="noopener noreferrer" className="win31-btn-3d" style={{ padding: '12px 24px', fontWeight: 'bold' }}>
                  erichowens.com
                </a>
                <a href="https://github.com/erichowens" target="_blank" rel="noopener noreferrer" className="win31-btn-3d" style={{ padding: '12px 24px', fontWeight: 'bold' }}>
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
        ].map(function (item, i) { return (<li key={i} style={{
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
                  </li>); })}
              </ul>
            </div>
          </div>

          {/* Work Experience */}
          <div className="win31-window" style={{ marginTop: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">-</div>
              </div>
              <span className="win31-title-text">EXPERIENCE.DAT</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">[]</div>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <h2 style={{ marginTop: 0, fontSize: '22px', marginBottom: '20px', color: '#000080' }}>Work Experience</h2>

              <div style={{ display: 'grid', gap: '16px' }}>
                {[
            {
                role: "CTO",
                company: "Dolphin AI",
                period: "Aug 2024 - Present",
                desc: "Modernizing drone vision software for customer and insurer property understanding and protection needs",
                achievements: ["Building AI/CV systems for geospatial intelligence, roof damage assessment, and property analytics"],
                tags: ["leadership", "drones", "computer-vision", "AI", "startup"]
            },
            {
                role: "Engineering Manager / Tech Lead Manager - Facebook AI Editing",
                company: "Meta",
                period: "Jan 2023 - Aug 2024",
                desc: "Managed a team of mobile and ML engineers putting the latest in ML/CV/LLMs into Facebook's composer and creation tools.",
                achievements: [
                    "Integrated cutting-edge computer vision and language models into Facebook's content creation pipeline",
                    "Shipped AI-powered editing features to billions of users across Facebook mobile apps",
                    "Built intelligent camera roll recommendation systems using state-of-the-art ML models"
                ],
                tags: ["engineering-management", "ML", "computer-vision", "LLMs", "mobile"]
            },
            {
                role: "Engineering Manager - Avatars Craft",
                company: "Meta",
                period: "Jun 2022 - Jan 2023",
                desc: "Responsible for Asset Pipeline Fashion and use of GPT-3/Stable Diffusion for Avatar Customization. Managed 40 software engineers.",
                achievements: [
                    "Pioneered use of GPT-3 and Stable Diffusion for AI-powered avatar customization at Meta scale",
                    "Built and scaled complete avatar asset pipeline supporting Meta's entire VR ecosystem",
                    "Led recursive management structure overseeing 40+ engineers across multiple specializations"
                ],
                tags: ["engineering-management", "3D-graphics", "ML", "VR", "GPT-3", "Stable-Diffusion"]
            },
            {
                role: "Engineering Manager / Tech Lead Manager - XR Tech",
                company: "Meta",
                period: "Jan 2021 - Jun 2022",
                desc: "Responsible for the CV/ML technology powering face technology at Facebook—mobile face tracker, FACS expression tracking, and audio-based lipsync.",
                achievements: [
                    "Built mobile face tracker deployed across all Meta AR platforms (Instagram, Facebook, Messenger)",
                    "Developed FACS-based expression tracking system for avatar puppeteering and emotion recognition",
                    "Shipped audio-based viseme prediction for realistic lipsync in AR experiences"
                ],
                tags: ["computer-vision", "ML", "AR", "face-tracking", "FACS", "mobile"]
            },
            {
                role: "Staff Engineer - Instagram AR Platform",
                company: "Meta",
                period: "Jun 2019 - Jan 2021",
                desc: "Responsible for effect curation and recommendations. Hired art curators and built search/exploration tools for Spark creators.",
                achievements: [
                    "Built galleries, allowlists, blocklists, and live personalized ranking for AR effects",
                    "Hired and empowered art curator specialists to identify cutting-edge creative work",
                    "Improved discovery of high-quality AR effects, increasing engagement and creator retention"
                ],
                tags: ["staff-engineer", "ranking", "AR", "curation", "Instagram"]
            },
            {
                role: "Research Engineering Manager - FAIR",
                company: "Meta",
                period: "Jan 2018 - Jun 2019",
                desc: "Managed AI research engineers responsible for embodied agents, compressed sensing on MRI images, and open-sourcing AlphaZero solution.",
                achievements: [
                    "Led fastMRI project (github.com/facebookresearch/fastMRI) in partnership with NYU Langone Radiology",
                    "Released open-source dataset, modeling competition, and technology proven in human trials",
                    "Open-sourced ELF OpenGo, Meta's AlphaZero implementation"
                ],
                tags: ["engineering-management", "AI-research", "medical-AI", "deep-learning", "open-source"]
            },
            {
                role: "Founding Engineer - Facebook Spaces",
                company: "Meta",
                period: "Jun 2016 - Jan 2018",
                desc: "Built end-to-end 'avatar from photo' system in two months, then hired ex-Pixar technical artists and engineers.",
                achievements: [
                    "Built complete avatar-from-photo system in just 2 months for Facebook's VR debut",
                    "Recruited ex-Pixar technical artists and engineers to create best-in-class parametric avatar system",
                    "Shipped company's best-reviewed avatars (FastCompany: \"Facebook's VR Avatars Just Got A More Realistic Upgrade\")"
                ],
                tags: ["founding-engineer", "VR", "3D-graphics", "avatars", "computer-vision"]
            },
            {
                role: "Engineer - Building 8 Skunkworks",
                company: "Meta",
                period: "Jun 2015 - Jun 2016",
                desc: "Developed LIDAR-powered Social VR room scans and peltier coolers on VR controllers for thermal haptics.",
                achievements: [
                    "Built LIDAR-based room scanning system for photorealistic Social VR environments",
                    "Invented thermal haptics using peltier coolers on VR controllers (\"fire and ice in VR\")"
                ],
                tags: ["VR", "LIDAR", "thermal-haptics", "research"]
            },
            {
                role: "Tech Lead - Comment Ranking",
                company: "Meta",
                period: "Jun 2014 - Jun 2015",
                desc: "Overhauled comment ranking for quality and civility using semantic similarity and Thompson sampling.",
                achievements: [
                    "Built Commentology tool for cross-team understanding—still used company-wide a decade later",
                    "Co-authored PNLambda, a Turing-complete config language for complex ranking mathematics",
                    "Significantly improved comment quality and civility across billions of daily comments"
                ],
                tags: ["tech-lead", "ML", "ranking", "NLP", "Thompson-sampling"]
            },
            {
                role: "Software Engineer - News Feed Ranking",
                company: "Meta",
                period: "Jun 2013 - Jun 2014",
                desc: "Responsible for ranking of public content based on quality using CV-based signals and ML classifiers.",
                achievements: [
                    "Built first CV-based News Feed personalization (hackathon win and patent: \"hide babies from News Feed\")",
                    "Demoted feed spam and promoted original high-quality articles using quality signals",
                    "Created JS-powered visualization tools plus Presto SQL for rapid counterfactual experimentation"
                ],
                tags: ["software-engineer", "ML", "ranking", "computer-vision", "patent"]
            },
            {
                role: "ML Engineer (First Hire)",
                company: "Newsle",
                period: "May 2012 - Jun 2013",
                desc: "Entity disambiguation, industry/subject prediction, news clustering, recommendation system",
                achievements: ["Linked 500k users by semantic content; enabled personalized news discovery"],
                tags: ["ML", "NLP", "recommendation", "startup"]
            },
            {
                role: "Engineer",
                company: "Quid",
                period: "Sep 2011 - May 2012",
                desc: "Network visualizations of company interrelationships, text mining, unsupervised learning",
                achievements: ["Built visualization tools for understanding company ecosystems"],
                tags: ["ML", "visualization", "NLP", "data-science"]
            },
            {
                role: "Space Grant Intern",
                company: "NASA JPL",
                period: "Jun 2008",
                desc: "Systems engineering on Project Constellation",
                achievements: ["Contributed to NASA's next-generation spacecraft program"],
                tags: ["aerospace", "systems-engineering", "NASA"]
            },
            {
                role: "Laboratory Intern",
                company: "SLAC National Accelerator Laboratory",
                period: "Jun 2006",
                desc: "X-ray crystallography, powder diffraction, superelastic materials for cardiovascular implants",
                achievements: ["Research on medical device materials"],
                tags: ["research", "materials-science", "medical"]
            }
        ].map(function (job, i) { return (<div key={i} style={{
                padding: '16px',
                background: '#FAF7F0',
                border: '2px solid #e0e0e0'
            }}>
                    <div style={{ fontWeight: 'bold', color: '#000080', fontSize: '15px' }}>{job.role}</div>
                    <div style={{ color: '#FF7F50', fontWeight: 'bold', fontSize: '14px' }}>{job.company}</div>
                    <div style={{ color: '#808080', fontStyle: 'italic', fontSize: '13px', marginBottom: '8px' }}>{job.period}</div>
                    <div style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '8px' }}>{job.desc}</div>
                    <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '13px' }}>
                      {job.achievements.map(function (a, j) { return (<li key={j} style={{ marginBottom: '4px' }}>{a}</li>); })}
                    </ul>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                      {job.tags.map(function (tag, k) { return (<span key={k} style={{
                    background: '#C0C0C0',
                    padding: '2px 6px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    border: '1px solid #808080'
                }}>{tag}</span>); })}
                    </div>
                  </div>); })}
              </div>
            </div>
          </div>

          {/* Featured Projects */}
          <div className="win31-window" style={{ marginTop: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">-</div>
              </div>
              <span className="win31-title-text">PROJECTS.EXE</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">[]</div>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <h2 style={{ marginTop: 0, fontSize: '22px', marginBottom: '20px', color: '#000080' }}>Featured Projects</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {[
            {
                title: "Claude Skills Collection",
                desc: "39 production-ready AI skills spanning ML, CV, audio, psychology, and developer tools",
                impact: "Open-sourced skill collection with interactive showcase website",
                tags: ["TypeScript", "LLMs", "Claude AI", "Open Source"],
                link: "https://someclaudeskills.com"
            },
            {
                title: "Comment Ranking System",
                desc: "Overhauled Facebook's comment ranking for quality and civility using ML and semantic similarity",
                impact: "Commentology tool still used company-wide a decade later",
                tags: ["Python", "ML", "NLP", "Thompson Sampling"]
            },
            {
                title: "Facebook Spaces Avatar System",
                desc: "Built 'avatar from photo' system in 2 months for Facebook's first social VR app",
                impact: "Best-reviewed avatars (FastCompany coverage); enabled Facebook's entry into social VR",
                tags: ["Computer Vision", "3D Graphics", "VR", "C++"]
            },
            {
                title: "fastMRI Dataset Release",
                desc: "Contributed to fastMRI website, dataset release, and competition kick-off with NYU Langone",
                impact: "Open dataset enabling medical AI research community",
                tags: ["Deep Learning", "Medical Imaging", "PyTorch", "Open Source"]
            },
            {
                title: "AR Face Tracking",
                desc: "Built CV/ML for Facebook's mobile AR face tracker with FACS expression tracking",
                impact: "Production face tracking to Instagram AR effects used by millions daily",
                tags: ["Computer Vision", "ML", "Mobile", "Face Tracking"]
            },
            {
                title: "Thermal Haptics for VR",
                desc: "Built peltier-cooled VR controllers providing hot/cold sensations",
                impact: "Hackathon win; filed patent on thermal haptics",
                tags: ["VR", "Haptics", "Hardware", "C++"]
            },
            {
                title: "CV-Based Newsfeed Personalization",
                desc: "Built 'hide babies on news feed' system using computer vision",
                impact: "Pioneered visual content understanding in newsfeed ranking; filed patent",
                tags: ["Computer Vision", "ML", "Ranking", "Python"]
            }
        ].map(function (project, i) { return (<div key={i} style={{
                background: '#C0C0C0',
                border: '2px outset #fff'
            }}>
                    <div style={{
                background: '#000080',
                color: 'white',
                padding: '4px 8px',
                fontWeight: 'bold',
                fontSize: '13px'
            }}>{project.title}</div>
                    <div style={{ padding: '12px', background: 'white', margin: '4px', border: '2px inset #ccc' }}>
                      <p style={{ fontSize: '13px', marginBottom: '8px' }}>{project.desc}</p>
                      <p style={{ fontSize: '13px', color: '#FF7F50', fontWeight: 'bold', marginBottom: '8px' }}>{project.impact}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {project.tags.map(function (tag, k) { return (<span key={k} style={{
                    background: '#C0C0C0',
                    padding: '2px 6px',
                    fontSize: '10px',
                    fontFamily: 'monospace'
                }}>{tag}</span>); })}
                      </div>
                      {project.link && (<a href={project.link} target="_blank" rel="noopener noreferrer" className="win31-btn-3d" style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    textDecoration: 'none'
                }}>View Live</a>)}
                    </div>
                  </div>); })}
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="win31-window" style={{ marginTop: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">-</div>
              </div>
              <span className="win31-title-text">EDUCATION.TXT</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">[]</div>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <h2 style={{ marginTop: 0, fontSize: '22px', marginBottom: '20px', color: '#000080' }}>Education</h2>

              {[
            {
                degree: "MS Applied Mathematics",
                school: "Brown University",
                year: "2011",
                details: "Research at University of Paris VI. TA for dynamics, analysis, cryptography, differential geometry. Focus: Probability theory, nonlinear dynamics, mathematical neuroscience."
            },
            {
                degree: "BS Applied Mathematics",
                school: "Columbia University",
                year: "2009",
                details: "Editor, Columbia Undergraduate Science Journal. Strong mathematical and scientific foundations."
            },
            {
                degree: "Budapest Semesters in Mathematics",
                school: "Budapest Semesters in Mathematics",
                year: "2007",
                details: "Intensive mathematics program: Combinatorics, Analysis, Set Theory"
            }
        ].map(function (edu, i) { return (<div key={i} style={{
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: i < 2 ? '1px solid #808080' : 'none'
            }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#000080' }}>{edu.degree}</h3>
                    <span style={{ fontSize: '13px', color: '#808080', fontWeight: 'bold' }}>{edu.year}</span>
                  </div>
                  <div style={{ fontSize: '14px', marginBottom: '4px' }}>{edu.school}</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>{edu.details}</div>
                </div>); })}
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
                <a href="https://www.linkedin.com/in/erich-owens-01a38446/" target="_blank" rel="noopener noreferrer" className="win31-btn-3d" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 16px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 'bold'
        }}>
                  LinkedIn (Fastest)
                </a>
                <a href="https://github.com/erichowens" target="_blank" rel="noopener noreferrer" className="win31-btn-3d" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 16px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 'bold'
        }}>
                  GitHub
                </a>
                <a href="https://github.com/erichowens/some_claude_skills/issues" target="_blank" rel="noopener noreferrer" className="win31-btn-3d" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 16px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 'bold'
        }}>
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
                <li><Link_1.default to="/docs/skills/cv_creator">cv-creator</Link_1.default> - Career narrative extraction and portfolio generation</li>
                <li><Link_1.default to="/docs/skills/career_biographer">career-biographer</Link_1.default> - Professional story structuring</li>
                <li><Link_1.default to="/docs/skills/competitive_cartographer">competitive-cartographer</Link_1.default> - Market positioning and differentiation</li>
                <li><Link_1.default to="/docs/skills/vibe_matcher">vibe-matcher</Link_1.default> - Visual DNA and aesthetic direction</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </Layout_1.default>);
}
