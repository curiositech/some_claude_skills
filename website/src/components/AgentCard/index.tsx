import React, { useState } from 'react';
import type { Agent } from '../../types/agent';
import { AGENT_STATUS_CONFIG, AGENT_BADGE_CONFIG } from '../../types/agent';
import { useHoverLift, HOVER_CONFIGS } from '../../hooks/useHoverLift';
import { getAgentById } from '../../data/agents';
import styles from './styles.module.css';

interface AgentCardProps {
  agent: Agent;
  onClick?: (agent: Agent) => void;
  showConnections?: boolean;
}

/**
 * Agent card component for displaying Founding Council members
 * Features status glow, coordination network preview, and expandable details
 */
export default function AgentCard({
  agent,
  onClick,
  showConnections = true,
}: AgentCardProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const hoverHandlers = useHoverLift(HOVER_CONFIGS.card);
  const statusConfig = AGENT_STATUS_CONFIG[agent.status];
  const badgeConfig = agent.badge ? AGENT_BADGE_CONFIG[agent.badge] : null;

  const handleCardClick = () => {
    if (onClick) {
      onClick(agent);
    } else {
      setExpanded(!expanded);
    }
  };

  // Get coordinating agent names
  const coordinatingAgents = agent.coordinatesWith
    .map((id) => getAgentById(id))
    .filter(Boolean) as Agent[];

  return (
    <div
      className={styles.agentCard}
      onClick={handleCardClick}
      style={{
        '--status-glow': statusConfig.glow,
      } as React.CSSProperties}
      {...hoverHandlers}
    >
      {/* Status glow indicator */}
      <div
        className={`${styles.statusGlow} ${agent.status === 'active' ? styles.statusGlowActive : ''}`}
      />

      {/* Header with emoji and badges */}
      <div className={styles.header}>
        <span className={styles.emoji}>{agent.emoji}</span>
        <div className={styles.badges}>
          {badgeConfig && (
            <span
              className={styles.badge}
              style={{ backgroundColor: badgeConfig.bg, color: badgeConfig.color }}
            >
              {badgeConfig.label}
            </span>
          )}
          <span
            className={styles.statusBadge}
            style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={`win31-font ${styles.title}`}>{agent.name}</h3>
        <div className={styles.role}>{agent.role}</div>
        <p className={`win31-font ${styles.description}`}>{agent.description}</p>

        {/* Triggers preview */}
        <div className={styles.triggersPreview}>
          <span className={`win31-font ${styles.triggersLabel}`}>Triggers:</span>
          <div className={styles.triggersList}>
            {agent.triggers.slice(0, 4).map((trigger, idx) => (
              <span key={idx} className={styles.triggerBadge}>
                "{trigger}"
              </span>
            ))}
            {agent.triggers.length > 4 && (
              <span className={styles.triggerBadge}>+{agent.triggers.length - 4}</span>
            )}
          </div>
        </div>

        {/* Coordination network preview */}
        {showConnections && coordinatingAgents.length > 0 && (
          <div className={styles.coordinationPreview}>
            <span className={`win31-font ${styles.coordLabel}`}>Coordinates with:</span>
            <div className={styles.coordAgents}>
              {coordinatingAgents.map((coordAgent) => (
                <span key={coordAgent.id} className={styles.coordAgent} title={coordAgent.name}>
                  {coordAgent.emoji}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expanded content */}
        {expanded && (
          <div className={styles.expandedContent}>
            {agent.longDescription && (
              <p className={`win31-font ${styles.longDescription}`}>
                {agent.longDescription}
              </p>
            )}

            {/* Beliefs */}
            <div className={styles.section}>
              <h4 className="win31-font">Core Beliefs</h4>
              <ul className={styles.beliefsList}>
                {agent.beliefs.map((belief, idx) => (
                  <li key={idx}>{belief}</li>
                ))}
              </ul>
            </div>

            {/* Outputs */}
            <div className={styles.section}>
              <h4 className="win31-font">Outputs</h4>
              <div className={styles.outputsList}>
                {agent.outputs.map((output, idx) => (
                  <span key={idx} className={styles.outputBadge}>
                    {output}
                  </span>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className={styles.section}>
              <h4 className="win31-font">Allowed Tools ({agent.allowedTools.length})</h4>
              <div className={styles.toolsList}>
                {agent.allowedTools.map((tool, idx) => (
                  <code key={idx} className={styles.toolBadge}>
                    {tool}
                  </code>
                ))}
              </div>
            </div>

            {/* Pledge */}
            {agent.pledge && (
              <div className={styles.pledge}>
                <em>"{agent.pledge}"</em>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.stats}>
            <span className={styles.stat}>
              <span className={styles.statIcon}>🛠️</span>
              {agent.skillsCreated || 0} skills
            </span>
            <span className={styles.stat}>
              <span className={styles.statIcon}>🤖</span>
              {agent.agentsSpawned || 0} agents
            </span>
          </div>
          <div className={styles.created}>
            Created: {agent.createdDate}
          </div>
        </div>

        {/* Expand hint */}
        <div className={styles.expandHint}>
          {expanded ? 'Click to collapse' : 'Click for details'}
        </div>
      </div>
    </div>
  );
}

/**
 * Mini agent card for coordination network visualization
 */
export function AgentMiniCard({ agent }: { agent: Agent }): JSX.Element {
  const statusConfig = AGENT_STATUS_CONFIG[agent.status];

  return (
    <div
      className={styles.miniCard}
      style={{
        '--status-glow': statusConfig.glow,
      } as React.CSSProperties}
    >
      <span className={styles.miniEmoji}>{agent.emoji}</span>
      <span className={styles.miniName}>{agent.name}</span>
      <span
        className={styles.miniStatus}
        style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
      >
        {statusConfig.label}
      </span>
    </div>
  );
}
