/**
 * DAG Builder Page
 *
 * Interactive interface for building DAG workflows.
 */

import React, { useState, useCallback } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { DAGBuilder } from '@site/src/components/DAG';
import type { DAG } from '@site/src/dag/types';
import styles from './dag.module.css';

// Sample skills for demonstration
const SAMPLE_SKILLS = [
  { id: 'code-review', name: 'Code Review', category: 'Development' },
  { id: 'unit-testing', name: 'Unit Testing', category: 'Testing' },
  { id: 'security-audit', name: 'Security Audit', category: 'Security' },
  { id: 'documentation', name: 'Documentation', category: 'Writing' },
  { id: 'api-design', name: 'API Design', category: 'Architecture' },
  { id: 'performance-optimization', name: 'Performance Optimization', category: 'Development' },
  { id: 'data-validation', name: 'Data Validation', category: 'Data' },
  { id: 'error-handling', name: 'Error Handling', category: 'Development' },
];

function dagToJson(dag: DAG): string {
  const obj = {
    id: dag.id,
    name: dag.name,
    nodes: Array.from(dag.nodes.values()).map(node => ({
      id: node.id,
      type: node.type,
      skillId: node.skillId,
      dependencies: node.dependencies,
    })),
    config: dag.config,
  };
  return JSON.stringify(obj, null, 2);
}

function dagToYaml(dag: DAG): string {
  const nodes = Array.from(dag.nodes.values());
  let yaml = `# DAG Workflow: ${dag.name}\n`;
  yaml += `id: ${dag.id}\n`;
  yaml += `name: ${dag.name}\n`;
  yaml += `config:\n`;
  yaml += `  maxParallelism: ${dag.config.maxParallelism}\n`;
  yaml += `  defaultTimeout: ${dag.config.defaultTimeout}\n`;
  yaml += `  errorHandling: ${dag.config.errorHandling}\n`;
  yaml += `nodes:\n`;
  for (const node of nodes) {
    yaml += `  - id: ${node.id}\n`;
    yaml += `    type: ${node.type}\n`;
    if (node.skillId) {
      yaml += `    skillId: ${node.skillId}\n`;
    }
    if (node.dependencies.length > 0) {
      yaml += `    dependencies:\n`;
      for (const dep of node.dependencies) {
        yaml += `      - ${dep}\n`;
      }
    }
  }
  return yaml;
}

export default function DAGBuilderPage(): React.ReactElement {
  const [savedDag, setSavedDag] = useState<DAG | null>(null);
  const [exportedContent, setExportedContent] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'yaml'>('json');

  const handleSave = useCallback((dag: DAG) => {
    setSavedDag(dag);
    // In a real app, this would save to backend/localStorage
    console.log('Saved DAG:', dag);
    alert(`Workflow "${dag.name}" saved with ${dag.nodes.size} nodes!`);
  }, []);

  const handleExport = useCallback((dag: DAG, format: 'json' | 'yaml') => {
    const content = format === 'json' ? dagToJson(dag) : dagToYaml(dag);
    setExportedContent(content);
    setExportFormat(format);
  }, []);

  const handleCopyExport = useCallback(() => {
    if (exportedContent) {
      navigator.clipboard.writeText(exportedContent);
      alert('Copied to clipboard!');
    }
  }, [exportedContent]);

  const handleDownloadExport = useCallback(() => {
    if (exportedContent && savedDag) {
      const blob = new Blob([exportedContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${savedDag.name.toLowerCase().replace(/\s+/g, '-')}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [exportedContent, exportFormat, savedDag]);

  return (
    <Layout
      title="DAG Builder"
      description="Build DAG workflows visually"
    >
      <div className={styles.container}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbs}>
          <Link to="/dag" className={styles.breadcrumbLink}>DAG Framework</Link>
          <span className={styles.breadcrumbSeparator}>›</span>
          <span className={styles.breadcrumbCurrent}>Builder</span>
        </div>

        {/* Header */}
        <div className={styles.builderHeader}>
          <h1 className={styles.builderTitle}>
            📊 DAG Workflow Builder
          </h1>
          <div className={styles.builderActions}>
            <Link to="/dag/monitor" className={styles.secondaryCta}>
              📈 Monitor
            </Link>
          </div>
        </div>

        {/* Builder Component */}
        <div className={styles.builderContainer}>
          <DAGBuilder
            availableSkills={SAMPLE_SKILLS}
            onSave={handleSave}
            onExport={handleExport}
          />
        </div>

        {/* Export Modal */}
        {exportedContent && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setExportedContent(null)}
          >
            <div
              style={{
                width: '600px',
                maxHeight: '80vh',
                background: "var(--theme-surface)",
                border: "4px solid var(--theme-border)",
                boxShadow: '8px 8px 0 rgba(0,0,0,0.3)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 8px',
                  background: 'linear-gradient(90deg, #000080, #1084d0)',
                  color: "var(--theme-titlebar-text)",
                  fontFamily: 'var(--font-system)',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                <span>📤 Export - {exportFormat.toUpperCase()}</span>
                <button
                  style={{
                    background: "var(--theme-surface)",
                    border: '2px solid',
                    borderColor: "var(--theme-border-light) var(--theme-border) var(--theme-border) var(--theme-border-light)",
                    color: "var(--theme-text)",
                    width: '20px',
                    height: '20px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => setExportedContent(null)}
                >
                  ×
                </button>
              </div>
              <div style={{ padding: '16px' }}>
                <pre
                  style={{
                    background: "var(--theme-elevated)",
                    border: '2px solid',
                    borderColor: "var(--theme-border) var(--theme-border-light) var(--theme-border-light) var(--theme-border)",
                    padding: '12px',
                    margin: '0 0 16px 0',
                    maxHeight: '400px',
                    overflow: 'auto',
                    fontFamily: 'var(--font-code)',
                    fontSize: '11px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {exportedContent}
                </pre>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className={styles.primaryCta}
                    onClick={handleCopyExport}
                  >
                    📋 Copy to Clipboard
                  </button>
                  <button
                    className={styles.secondaryCta}
                    onClick={handleDownloadExport}
                  >
                    💾 Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
