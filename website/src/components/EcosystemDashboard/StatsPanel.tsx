import React from 'react';
import styles from './styles.module.css';

interface StatsPanelProps {
  totalAgents: number;
  totalSkills: number;
  totalTools: number;
  toolUsage: Record<string, number>;
  domainCoverage: Array<{
    domain: string;
    count: number;
    percentage: number;
  }>;
}

export default function StatsPanel({
  totalAgents,
  totalSkills,
  totalTools,
  toolUsage,
  domainCoverage
}: StatsPanelProps): JSX.Element {
  // Top 5 most used tools
  const topTools = Object.entries(toolUsage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="win31-window" style={{ marginBottom: '24px' }}>
      <div className="win31-titlebar">
        <div className="win31-titlebar__left">
          <div className="win31-btn-3d win31-btn-3d--small">─</div>
        </div>
        <span className="win31-title-text">ECOSYSTEM.SYS - Overview</span>
        <div className="win31-titlebar__right">
          <div className="win31-btn-3d win31-btn-3d--small">□</div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {/* Summary Stats */}
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Agents</div>
          <div className={styles.statValue} style={{ color: "var(--theme-link)" }}>
            {totalAgents}
          </div>
          <div className={styles.statSubtext}>Meta-coordinators</div>
        </div>

        <div className={styles.statBox}>
          <div className={styles.statLabel}>Skills</div>
          <div className={styles.statValue} style={{ color: "var(--theme-link)" }}>
            {totalSkills}
          </div>
          <div className={styles.statSubtext}>Domain experts</div>
        </div>

        <div className={styles.statBox}>
          <div className={styles.statLabel}>Tools</div>
          <div className={styles.statValue} style={{ color: "var(--theme-text)" }}>
            {totalTools}
          </div>
          <div className={styles.statSubtext}>Unique capabilities</div>
        </div>

        {/* Top Tools */}
        <div className={styles.statBox} style={{ gridColumn: 'span 2' }}>
          <div className={styles.statLabel}>Most Used Tools</div>
          <div className={styles.toolList}>
            {topTools.map(([tool, count]) => (
              <div key={tool} className={styles.toolItem}>
                <span className={styles.toolName}>{tool}</span>
                <div className={styles.toolBar}>
                  <div
                    className={styles.toolBarFill}
                    style={{ width: `${(count / topTools[0][1]) * 100}%` }}
                  />
                  <span className={styles.toolCount}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Domain Coverage Heatmap */}
        <div className={styles.statBox} style={{ gridColumn: 'span 3' }}>
          <div className={styles.statLabel}>Domain Coverage</div>
          <div className={styles.heatmapGrid}>
            {domainCoverage.map(({ domain, count }) => (
              <div key={domain} className={styles.heatmapCell}>
                <div className={styles.heatmapLabel}>{domain}</div>
                <div className={styles.heatmapValue}>{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
