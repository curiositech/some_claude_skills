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

/**
 * Set this to your deployed Cloudflare Worker URL to enable live execution.
 * See api/README.md for deployment instructions.
 * Leave as null to keep the builder in demo-only mode.
 */
const API_BASE_URL: string | null = null;

// Sample skills for demonstration — a curated subset of the catalog
const SAMPLE_SKILLS = [
  { id: 'ai-engineer', name: 'AI Engineer', category: 'AI/ML' },
  { id: 'code-review-checklist', name: 'Code Review', category: 'Development' },
  { id: 'security-auditor', name: 'Security Audit', category: 'Security' },
  { id: 'documentation', name: 'Documentation', category: 'Writing' },
  { id: 'api-architect', name: 'API Architect', category: 'Architecture' },
  { id: 'backend-architect', name: 'Backend Architect', category: 'Architecture' },
  { id: 'data-pipeline-engineer', name: 'Data Pipeline Engineer', category: 'Data' },
  { id: 'deployment-engineer', name: 'Deployment Engineer', category: 'DevOps' },
  { id: 'computer-vision-pipeline', name: 'Computer Vision', category: 'AI/ML' },
  { id: 'adhd-design-expert', name: 'ADHD Design Expert', category: 'Design' },
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
  yaml += `  maxExecutionTimeMs: ${dag.config.maxExecutionTimeMs}\n`;
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
  const [isExecuting, setIsExecuting] = useState(false);
  const [executeResult, setExecuteResult] = useState<string | null>(null);

  const handleSave = useCallback((dag: DAG) => {
    setSavedDag(dag);
    console.log('Saved DAG:', dag);
    alert(`Workflow "${dag.name}" saved with ${dag.nodes.size} nodes!`);
  }, []);

  const handleExecute = useCallback(async (dag: DAG) => {
    if (!API_BASE_URL) {
      alert(
        'Live execution is not configured.\n\n' +
        'Deploy the Cloudflare Worker from the api/ directory, then set API_BASE_URL in builder.tsx.\n\n' +
        'See api/README.md for instructions.'
      );
      return;
    }

    setIsExecuting(true);
    setExecuteResult(null);

    const body = {
      id: dag.id,
      name: dag.name,
      nodes: Array.from(dag.nodes.values()).map(n => ({
        id: n.id as string,
        name: n.name,
        description: n.description,
        skillId: n.skillId,
        dependencies: n.dependencies.map(d => d as string),
        model: n.config.model,
      })),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/dag/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json() as Record<string, unknown>;
      setExecuteResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setExecuteResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsExecuting(false);
    }
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
            onExecute={handleExecute}
          />
        </div>

        {/* Execution status indicator */}
        {isExecuting && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#c0c0c0', border: '2px solid #808080', fontFamily: 'var(--font-system)', fontSize: 13 }}>
            ⏳ Executing workflow via Haiku API…
          </div>
        )}

        {/* Execution result */}
        {executeResult && !isExecuting && (
          <div style={{ marginTop: 16, background: '#c0c0c0', border: '4px solid #000000' }}>
            <div style={{ padding: '4px 8px', background: 'linear-gradient(90deg,#000080,#1084d0)', color: '#fff', fontFamily: 'var(--font-system)', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
              <span>✅ Execution Result</span>
              <button onClick={() => setExecuteResult(null)} style={{ background: '#c0c0c0', border: '2px solid', borderColor: '#ffffff #808080 #808080 #ffffff', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>×</button>
            </div>
            <pre style={{ margin: 0, padding: 16, background: '#ffffff', border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080', maxHeight: 400, overflow: 'auto', fontFamily: 'var(--font-code)', fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {executeResult}
            </pre>
          </div>
        )}

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
                background: '#c0c0c0',
                border: '4px solid #000000',
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
                  color: 'white',
                  fontFamily: 'var(--font-system)',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                <span>📤 Export - {exportFormat.toUpperCase()}</span>
                <button
                  style={{
                    background: '#c0c0c0',
                    border: '2px solid',
                    borderColor: '#ffffff #808080 #808080 #ffffff',
                    color: '#000000',
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
                    background: '#ffffff',
                    border: '2px solid',
                    borderColor: '#808080 #ffffff #ffffff #808080',
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
