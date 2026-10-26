/**
 * DAG Execution Demo Page
 *
 * Interactive visualization of DAG execution
 */

import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { DAGVisualizer } from '../../components/DAG/DAGVisualizer';
import type { DAG, DAGNode, NodeId } from '../../dag/types';
import { DEFAULT_TASK_CONFIG, DEFAULT_DAG_CONFIG, NodeId as NodeIdFn } from '../../dag/types';
import styles from './demo.module.css';

// Helper to create rich DAG nodes
function createNode(
  id: string,
  name: string,
  description: string,
  skillId: string,
  dependencies: NodeId[] = [],
  model: 'haiku' | 'sonnet' | 'opus' = 'haiku'
): DAGNode {
  return {
    id: NodeIdFn(id),
    name,
    description,
    type: 'skill',
    skillId,
    dependencies,
    state: { status: 'pending' },
    config: { ...DEFAULT_TASK_CONFIG, model },
  };
}

// Example DAGs
const SIMPLE_DAG: DAG = {
  id: NodeIdFn('simple') as any,
  name: 'Simple Sequential',
  version: '1.0.0',
  nodes: new Map([
    [NodeIdFn('research'), createNode(
      'research',
      'Research Topic',
      'Comprehensive research on the given topic using web search and documentation',
      'comprehensive-researcher',
      [],
      'haiku'
    )],
    [NodeIdFn('write'), createNode(
      'write',
      'Write Documentation',
      'Technical writing based on research findings with clear structure',
      'technical-writer',
      [NodeIdFn('research')],
      'sonnet'
    )],
    [NodeIdFn('review'), createNode(
      'review',
      'Code Review',
      'Review documentation for quality, accuracy, and adherence to standards',
      'code-reviewer',
      [NodeIdFn('write')],
      'haiku'
    )],
  ]),
  edges: new Map([
    [NodeIdFn('research'), [NodeIdFn('write')]],
    [NodeIdFn('write'), [NodeIdFn('review')]],
  ]),
  config: DEFAULT_DAG_CONFIG,
  inputs: [],
  outputs: [{ name: 'result', description: 'Final reviewed documentation', sourceNodeId: NodeIdFn('review') }],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const PARALLEL_DAG: DAG = {
  id: NodeIdFn('parallel') as any,
  name: 'Parallel Execution',
  version: '1.0.0',
  nodes: new Map([
    [NodeIdFn('design'), createNode(
      'design',
      'UI/UX Design',
      'Create visual design mockups and component library with modern aesthetics',
      'web-design-expert',
      [],
      'sonnet'
    )],
    [NodeIdFn('content'), createNode(
      'content',
      'Content Writing',
      'Write clear, engaging content with proper structure and SEO optimization',
      'technical-writer',
      [],
      'haiku'
    )],
    [NodeIdFn('code'), createNode(
      'code',
      'Frontend Development',
      'Implement React components with TypeScript and modern best practices',
      'frontend-developer',
      [],
      'sonnet'
    )],
    [NodeIdFn('integrate'), createNode(
      'integrate',
      'Full Integration',
      'Combine design, content, and code into cohesive application with testing',
      'fullstack-developer',
      [NodeIdFn('design'), NodeIdFn('content'), NodeIdFn('code')],
      'opus'
    )],
  ]),
  edges: new Map([
    [NodeIdFn('design'), [NodeIdFn('integrate')]],
    [NodeIdFn('content'), [NodeIdFn('integrate')]],
    [NodeIdFn('code'), [NodeIdFn('integrate')]],
  ]),
  config: DEFAULT_DAG_CONFIG,
  inputs: [],
  outputs: [{ name: 'result', description: 'Integrated application', sourceNodeId: NodeIdFn('integrate') }],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Real-world example: Website modernization for 5 personas
const WEBSITE_MODERNIZATION_DAG: DAG = {
  id: NodeIdFn('website-modernization') as any,
  name: 'Website Modernization (Real Task)',
  version: '1.0.0',
  nodes: new Map([
    [NodeIdFn('ux-friction-audit'), createNode(
      'ux-friction-audit', 'UX Friction Audit',
      'Analyze current site for usability issues, navigation problems, and user pain points',
      'ux-friction-analyzer', [], 'haiku'
    )],
    [NodeIdFn('seo-audit'), createNode(
      'seo-audit', 'SEO Audit',
      'Comprehensive SEO analysis: meta tags, performance, indexing, mobile optimization',
      'technical-writer', [], 'haiku'
    )],
    [NodeIdFn('competitive-landscape'), createNode(
      'competitive-landscape', 'Competitive Analysis',
      'Research competitor sites and industry design trends for positioning',
      'web-design-expert', [], 'sonnet'
    )],
    [NodeIdFn('persona-vibe-matching'), createNode(
      'persona-vibe-matching', 'Persona Vibe Matching',
      'Translate 5 personas into specific design language and content tone',
      'vibe-matcher', [NodeIdFn('competitive-landscape')], 'sonnet'
    )],
    [NodeIdFn('design-system-creation'), createNode(
      'design-system-creation', 'Design System Creation',
      'Create comprehensive design system: colors, typography, components, spacing',
      'design-system-creator',
      [NodeIdFn('persona-vibe-matching'), NodeIdFn('ux-friction-audit')],
      'opus'
    )],
    [NodeIdFn('content-strategy'), createNode(
      'content-strategy', 'Content Strategy',
      'Plan content structure, information architecture, and messaging for each persona',
      'diagramming-expert',
      [NodeIdFn('ux-friction-audit'), NodeIdFn('seo-audit'), NodeIdFn('persona-vibe-matching')],
      'sonnet'
    )],
    [NodeIdFn('visual-design-mockups'), createNode(
      'visual-design-mockups', 'Visual Design Mockups',
      'Create high-fidelity mockups for all key pages and components',
      'web-design-expert',
      [NodeIdFn('design-system-creation'), NodeIdFn('content-strategy')],
      'opus'
    )],
    [NodeIdFn('implementation-frontend'), createNode(
      'implementation-frontend', 'Frontend Implementation',
      'Build React components implementing the design system and mockups',
      'prompt-engineer',
      [NodeIdFn('visual-design-mockups'), NodeIdFn('design-system-creation')],
      'opus'
    )],
    [NodeIdFn('seo-implementation'), createNode(
      'seo-implementation', 'SEO Implementation',
      'Implement technical SEO: meta tags, schema, sitemap, performance optimizations',
      'chatbot-analytics',
      [NodeIdFn('seo-audit'), NodeIdFn('implementation-frontend')],
      'sonnet'
    )],
    [NodeIdFn('content-writing'), createNode(
      'content-writing', 'Content Writing',
      'Write final copy for all pages optimized for personas and SEO',
      'technical-writer',
      [NodeIdFn('content-strategy'), NodeIdFn('persona-vibe-matching')],
      'sonnet'
    )],
    [NodeIdFn('deployment-optimization'), createNode(
      'deployment-optimization', 'Deployment & Optimization',
      'Deploy to production with CI/CD, monitoring, and performance tuning',
      'site-reliability-engineer',
      [NodeIdFn('implementation-frontend'), NodeIdFn('seo-implementation'), NodeIdFn('content-writing')],
      'opus'
    )],
    [NodeIdFn('validation-testing'), createNode(
      'validation-testing', 'Validation & Testing',
      'Comprehensive testing: unit, integration, accessibility, cross-browser',
      'vitest-testing-patterns',
      [NodeIdFn('deployment-optimization')],
      'sonnet'
    )],
  ]),
  edges: new Map([
    [NodeIdFn('ux-friction-audit'), [NodeIdFn('design-system-creation'), NodeIdFn('content-strategy')]],
    [NodeIdFn('seo-audit'), [NodeIdFn('content-strategy'), NodeIdFn('seo-implementation')]],
    [NodeIdFn('competitive-landscape'), [NodeIdFn('persona-vibe-matching')]],
    [NodeIdFn('persona-vibe-matching'), [NodeIdFn('design-system-creation'), NodeIdFn('content-strategy'), NodeIdFn('content-writing')]],
    [NodeIdFn('design-system-creation'), [NodeIdFn('visual-design-mockups'), NodeIdFn('implementation-frontend')]],
    [NodeIdFn('content-strategy'), [NodeIdFn('visual-design-mockups'), NodeIdFn('content-writing')]],
    [NodeIdFn('visual-design-mockups'), [NodeIdFn('implementation-frontend')]],
    [NodeIdFn('implementation-frontend'), [NodeIdFn('seo-implementation'), NodeIdFn('deployment-optimization')]],
    [NodeIdFn('seo-implementation'), [NodeIdFn('deployment-optimization')]],
    [NodeIdFn('content-writing'), [NodeIdFn('deployment-optimization')]],
    [NodeIdFn('deployment-optimization'), [NodeIdFn('validation-testing')]],
    [NodeIdFn('validation-testing'), []],
  ]),
  config: DEFAULT_DAG_CONFIG,
  inputs: [],
  outputs: [{ name: 'validation_report', description: 'Final validation report with test results', sourceNodeId: NodeIdFn('validation-testing') }],
  createdAt: new Date(),
  updatedAt: new Date(),
};

type DAGExample = 'simple' | 'parallel' | 'website-modernization';

const DAG_DESCRIPTIONS: Record<DAGExample, { title: string; description: string; complexity: number }> = {
  'simple': {
    title: 'Simple Sequential',
    description: 'Basic 3-step workflow: research → write → review. Demonstrates linear task dependencies.',
    complexity: 3,
  },
  'parallel': {
    title: 'Parallel Execution',
    description: 'Fan-out/fan-in pattern: 3 tasks run concurrently (design, content, code), then integrate. Shows 3x speedup potential.',
    complexity: 5,
  },
  'website-modernization': {
    title: 'Website Modernization',
    description: 'Real-world task: modernize someclaudeskills.com for 5 personas. Multi-phase strategy with UX audit, design system, implementation, and deployment. Complexity 9/10.',
    complexity: 9,
  },
};

export default function DAGDemo(): JSX.Element {
  const [selectedDAG, setSelectedDAG] = useState<DAGExample>('simple');

  const dag = selectedDAG === 'simple'
    ? SIMPLE_DAG
    : selectedDAG === 'parallel'
    ? PARALLEL_DAG
    : WEBSITE_MODERNIZATION_DAG;

  const description = DAG_DESCRIPTIONS[selectedDAG];

  return (
    <Layout
      title="DAG Visualization Demo"
      description="Interactive DAG execution visualization"
    >
      <div className={styles.container}>
        <h1>DAG Visualization Demo</h1>

        <p className={styles.intro}>
          See how arbitrary tasks are decomposed into execution graphs with automatic parallelization.
        </p>

        <div className={styles.controls}>
          <label htmlFor="dag-example">Example:</label>
          <select
            id="dag-example"
            value={selectedDAG}
            onChange={(e) => setSelectedDAG(e.target.value as DAGExample)}
          >
            <option value="simple">Simple Sequential</option>
            <option value="parallel">Parallel Execution</option>
            <option value="website-modernization">Website Modernization (Real Task)</option>
          </select>
        </div>

        <div className={styles.description}>
          <h3>{description.title}</h3>
          <p>{description.description}</p>
          <p className={styles.complexity}>
            <strong>Complexity:</strong> {description.complexity}/10
          </p>
        </div>

        <div className={styles.dagExplanation}>
          <h3>📋 Understanding the DAG</h3>
          <p><strong>What is this?</strong> A Directed Acyclic Graph (DAG) showing task execution order and dependencies.</p>

          <h4>How Data Flows:</h4>
          <ul>
            <li><strong>Nodes (Windows):</strong> Each window represents a skill/agent that performs work</li>
            <li><strong>Arrows:</strong> Show dependencies - an arrow from A→B means "B depends on A's output"</li>
            <li><strong>Waves (Columns):</strong> Nodes in the same column can run in parallel (no dependencies between them)</li>
            <li><strong>Execution Order:</strong> Left to right - earlier waves complete before later ones</li>
          </ul>

          <h4>Node Inputs & Outputs:</h4>
          <ul>
            <li><strong>Input:</strong> Each node receives the combined outputs of all its dependencies</li>
            <li><strong>Processing:</strong> The skill analyzes inputs and produces new artifacts (docs, designs, code, etc.)</li>
            <li><strong>Output:</strong> Artifacts are passed to dependent nodes (shown by arrows)</li>
            <li><strong>Example:</strong> "Research" outputs findings → "Write" consumes findings and outputs draft → "Review" consumes draft and outputs feedback</li>
          </ul>

          <h4>Color Legend:</h4>
          <ul>
            <li><strong>Navy:</strong> Pending (waiting for dependencies)</li>
            <li><strong>Yellow:</strong> Ready (all dependencies met, can start)</li>
            <li><strong>Blue:</strong> Running (actively executing)</li>
            <li><strong>Green:</strong> Completed (output available)</li>
            <li><strong>Red:</strong> Failed (error occurred)</li>
          </ul>
        </div>

        <DAGVisualizer dag={dag} highlightCriticalPath />

        <div className={styles.info}>
          <h2>DAG Statistics</h2>
          <p><strong>Total nodes:</strong> {dag.nodes.size}</p>
          <p><strong>Total edges:</strong> {dag.edges.size}</p>
          <p><strong>Parallelization opportunities:</strong> {
            Array.from(dag.nodes.values()).filter(n => n.dependencies.length === 0).length
          } (wave 1)</p>
        </div>

        {selectedDAG === 'website-modernization' && (
          <div className={styles.realTaskNote}>
            <h3>📊 Real Task Decomposition</h3>
            <p>
              This DAG was generated from the task: <em>"Modernize someclaudeskills.com for 5 personas:
              AI newbie, developer, ADHD dilettante, potential employer, and non-tech friend.
              Minimize UX friction, optimize SEO, make it beautiful and unique."</em>
            </p>
            <p>
              The decomposer identified 12 subtasks across 6 waves: research/audit (wave 1),
              persona translation (wave 2), design system + content strategy (wave 3),
              visual mockups (wave 4), implementation (wave 5), deployment + validation (wave 6).
            </p>
            <p>
              <strong>Estimated speedup:</strong> 3.1x vs sequential execution through parallel research/audit phases.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
