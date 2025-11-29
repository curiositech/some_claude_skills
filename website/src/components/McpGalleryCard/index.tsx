import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import type { McpServer } from '../../types/mcp';
import { MCP_STATUS_CONFIG } from '../../types/mcp';
import { useHoverLift, HOVER_CONFIGS } from '../../hooks/useHoverLift';
import styles from './styles.module.css';

interface McpGalleryCardProps {
  mcp: McpServer;
  onClick?: (mcp: McpServer) => void;
}

export default function McpGalleryCard({
  mcp,
  onClick,
}: McpGalleryCardProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const hoverHandlers = useHoverLift(HOVER_CONFIGS.card);
  const statusConfig = MCP_STATUS_CONFIG[mcp.status];

  const handleCardClick = () => {
    if (onClick) {
      onClick(mcp);
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <div
      className={styles.mcpCard}
      onClick={handleCardClick}
      {...hoverHandlers}
    >
      {/* Header with icon and badges */}
      <div className={styles.header}>
        <span className={styles.icon}>{mcp.icon || '🔌'}</span>
        <div className={styles.badges}>
          {mcp.badge === 'FEATURED' && (
            <span className={styles.featuredBadge}>★ FEATURED</span>
          )}
          {mcp.badge === 'NEW' && (
            <span className={styles.newBadge}>NEW!</span>
          )}
          <span
            className={styles.statusBadge}
            style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Hero image if available */}
      {mcp.heroImage && (
        <div className={styles.heroContainer}>
          <img src={mcp.heroImage} alt={mcp.name} className={styles.heroImage} />
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        <h3 className={`win31-font ${styles.title}`}>{mcp.name}</h3>
        <p className={`win31-font ${styles.description}`}>{mcp.description}</p>

        {/* Tools preview */}
        <div className={styles.toolsPreview}>
          <span className={`win31-font ${styles.toolsLabel}`}>Tools:</span>
          <div className={styles.toolsList}>
            {mcp.tools.slice(0, 3).map((tool, idx) => (
              <span key={idx} className={styles.toolBadge}>
                {tool.name}
              </span>
            ))}
            {mcp.tools.length > 3 && (
              <span className={styles.toolBadge}>+{mcp.tools.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className={styles.expandedContent}>
            {mcp.longDescription && (
              <p className={`win31-font ${styles.longDescription}`}>
                {mcp.longDescription}
              </p>
            )}

            {/* All tools */}
            <div className={styles.allTools}>
              <h4 className="win31-font">All Tools</h4>
              {mcp.tools.map((tool, idx) => (
                <div key={idx} className={styles.toolDetail}>
                  <code>{tool.name}</code>
                  <span>{tool.description}</span>
                </div>
              ))}
            </div>

            {/* Requirements */}
            {mcp.requirements && mcp.requirements.length > 0 && (
              <div className={styles.requirements}>
                <h4 className="win31-font">Requirements</h4>
                <ul>
                  {mcp.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer with links */}
        <div className={styles.footer}>
          <div className={styles.meta}>
            <span className={styles.author}>by {mcp.author}</span>
            {mcp.version && <span className={styles.version}>v{mcp.version}</span>}
          </div>
          <div className={styles.links} onClick={(e) => e.stopPropagation()}>
            <a
              href={mcp.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
              title="View on GitHub"
            >
              GitHub
            </a>
            {mcp.docsUrl && (
              <Link to={mcp.docsUrl} className={styles.link}>
                Docs
              </Link>
            )}
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
