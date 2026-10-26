import React, { useState, useMemo } from 'react';
import StatsPanel from './StatsPanel';
import KnowledgeGraph from './KnowledgeGraph';
import AgentCard from './AgentCard';
import SkillGrid from './SkillGrid';
import styles from './styles.module.css';

interface Agent {
  name: string;
  role: string;
  description: string;
  tools: string[];
  triggers: string[];
  coordinates_with: string[];
  outputs: string[];
}

interface Skill {
  name: string;
  description: string;
  category: string | null;
  tools: string[];
  has_references: boolean;
  has_examples: boolean;
}

interface EcosystemData {
  version: string;
  generated_at: string;
  summary: {
    total_agents: number;
    total_skills: number;
    unique_tools: number;
    skill_categories: Record<string, number>;
  };
  agents: Agent[];
  skills: Skill[];
  tool_usage: Record<string, number>;
  capability_graph: {
    nodes: Array<{ id: string; type: string; label: string; role?: string }>;
    edges: Array<{ from: string; to: string; type: string }>;
  };
}

interface EcosystemDashboardProps {
  data: EcosystemData;
}

export default function EcosystemDashboard({ data }: EcosystemDashboardProps): JSX.Element {
  const [selectedView, setSelectedView] = useState<'graph' | 'agents' | 'skills'>('graph');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // Calculate domain coverage heatmap data
  const domainCoverage = useMemo(() => {
    const domains = {
      'Computer Vision': ['clip-aware-embeddings', 'drone-cv-expert', 'drone-inspection-specialist',
        'photo-composition-critic', 'photo-content-recognition-curation-expert'],
      'Design & UI': ['web-design-expert', 'typography-expert', 'vaporwave-glassomorphic-ui-designer',
        'design-system-creator', 'native-app-designer', 'adhd-design-expert', 'collage-layout-expert'],
      'Audio & Music': ['sound-engineer', 'voice-audio-engineer', '2000s-visualization-expert',
        'speech-pathology-ai'],
      'Psychology & Wellness': ['jungian-psychologist', 'hrv-alexithymia-expert',
        'wisdom-accountability-coach', 'project-management-guru-adhd'],
      'Career & Business': ['career-biographer', 'cv-creator', 'job-application-optimizer',
        'competitive-cartographer', 'indie-monetization-strategist', 'tech-entrepreneur-coach-adhd'],
      'Development Tools': ['bot-developer', 'agent-creator', 'code-necromancer',
        'site-reliability-engineer', 'skill-coach', 'orchestrator']
    };

    return Object.entries(domains).map(([domain, skillIds]) => {
      const matchingSkills = data.skills.filter(s =>
        skillIds.some(id => s.name.includes(id))
      );
      return {
        domain,
        count: matchingSkills.length,
        percentage: (matchingSkills.length / skillIds.length) * 100
      };
    });
  }, [data.skills]);

  return (
    <div className={styles.dashboard}>
      {/* Stats Panel - Always visible at top */}
      <StatsPanel
        totalAgents={data.summary.total_agents}
        totalSkills={data.summary.total_skills}
        totalTools={data.summary.unique_tools}
        toolUsage={data.tool_usage}
        domainCoverage={domainCoverage}
      />

      {/* View Selector */}
      <div className={styles.viewSelector}>
        <button
          className={`${styles.viewButton} ${selectedView === 'graph' ? styles.active : ''}`}
          onClick={() => setSelectedView('graph')}
        >
          Knowledge Graph
        </button>
        <button
          className={`${styles.viewButton} ${selectedView === 'agents' ? styles.active : ''}`}
          onClick={() => setSelectedView('agents')}
        >
          Agents ({data.summary.total_agents})
        </button>
        <button
          className={`${styles.viewButton} ${selectedView === 'skills' ? styles.active : ''}`}
          onClick={() => setSelectedView('skills')}
        >
          Skills ({data.summary.total_skills})
        </button>
      </div>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {selectedView === 'graph' && (
          <KnowledgeGraph
            nodes={data.capability_graph.nodes}
            edges={data.capability_graph.edges}
            onNodeClick={(nodeId) => {
              // Handle agent clicks
              const agent = data.agents.find(a => `agent:${a.name}` === nodeId);
              if (agent) {
                setSelectedSkill(null);
                setSelectedAgent(agent);
                return;
              }
              // Handle skill clicks
              const skill = data.skills.find(s => `skill:${s.name}` === nodeId);
              if (skill) {
                setSelectedAgent(null);
                setSelectedSkill(skill);
              }
            }}
          />
        )}

        {selectedView === 'agents' && (
          <div className={styles.agentGrid}>
            {data.agents.map(agent => (
              <AgentCard
                key={agent.name}
                agent={agent}
                onClick={() => setSelectedAgent(agent)}
                isSelected={selectedAgent?.name === agent.name}
              />
            ))}
          </div>
        )}

        {selectedView === 'skills' && (
          <SkillGrid skills={data.skills} />
        )}
      </div>

      {/* Agent Detail Panel (slides in from right when selected) */}
      {selectedAgent && (
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <h2>{selectedAgent.name}</h2>
            <button
              className={styles.closeButton}
              onClick={() => setSelectedAgent(null)}
            >
              ✕
            </button>
          </div>
          <div className={styles.detailContent}>
            <h3>{selectedAgent.role}</h3>
            <p>{selectedAgent.description}</p>

            <div className={styles.detailSection}>
              <h4>Tools ({selectedAgent.tools.length})</h4>
              <div className={styles.tagList}>
                {selectedAgent.tools.map(tool => (
                  <span key={tool} className={styles.tag}>{tool}</span>
                ))}
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4>Coordinates With</h4>
              <div className={styles.tagList}>
                {selectedAgent.coordinates_with.map(coord => (
                  <span
                    key={coord}
                    className={`${styles.tag} ${styles.tagAgent}`}
                    onClick={() => {
                      const agent = data.agents.find(a => a.name === coord);
                      if (agent) setSelectedAgent(agent);
                    }}
                  >
                    {coord}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4>Triggers</h4>
              <div className={styles.tagList}>
                {selectedAgent.triggers.slice(0, 10).map(trigger => (
                  <span key={trigger} className={`${styles.tag} ${styles.tagTrigger}`}>
                    "{trigger}"
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skill Detail Panel (slides in from right when selected) */}
      {selectedSkill && (
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader} style={{ background: '#10b981' }}>
            <h2>{selectedSkill.name}</h2>
            <button
              className={styles.closeButton}
              onClick={() => setSelectedSkill(null)}
            >
              ✕
            </button>
          </div>
          <div className={styles.detailContent}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {selectedSkill.has_examples && (
                <span className={`${styles.tag} ${styles.tagTrigger}`}>Has Examples</span>
              )}
              {selectedSkill.has_references && (
                <span className={styles.tag}>Has References</span>
              )}
            </div>

            <p>{selectedSkill.description}</p>

            <div className={styles.detailSection}>
              <h4>Tools ({selectedSkill.tools.length})</h4>
              <div className={styles.tagList}>
                {selectedSkill.tools.map(tool => (
                  <span key={tool} className={styles.tag}>{tool}</span>
                ))}
              </div>
            </div>

            {selectedSkill.category && (
              <div className={styles.detailSection}>
                <h4>Category</h4>
                <span className={`${styles.tag} ${styles.tagAgent}`}>
                  {selectedSkill.category}
                </span>
              </div>
            )}

            <div className={styles.detailSection}>
              <h4>View Full Documentation</h4>
              <a
                href={`/docs/skills/${selectedSkill.name.replace(/-/g, '_')}`}
                style={{
                  display: 'inline-block',
                  marginTop: '8px',
                  padding: '8px 16px',
                  background: '#10b981',
                  color: "var(--theme-titlebar-text)",
                  textDecoration: 'none',
                  fontFamily: 'var(--font-system)',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '2px solid #059669'
                }}
              >
                Open Skill Page →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
