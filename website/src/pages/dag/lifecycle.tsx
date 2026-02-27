/**
 * winDAGs Lifecycle Tour
 *
 * A guided walkthrough of the full winDAGs execution lifecycle:
 * 1. Problem Input → 2. Decomposition → 3. Skill Matching → 4. Execution
 * 5. Human Gate → 6. Mutation → 7. Completion → 8. Skill Evolution
 *
 * Uses the existing DAGVisualizer with mock data to show each phase.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import { DAGVisualizer } from '../../components/DAG/DAGVisualizer';
import type { DAG, DAGNode, NodeId, TaskState } from '../../dag/types';
import { DEFAULT_TASK_CONFIG, DEFAULT_DAG_CONFIG, NodeId as NodeIdFn } from '../../dag/types';

// ============================================================================
// LIFECYCLE PHASES
// ============================================================================

interface Phase {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  dag: DAG;
  executionState: Map<NodeId, TaskState>;
  costSoFar: number;
  highlight?: string;
}

function createNode(
  id: string,
  name: string,
  description: string,
  skillId: string,
  dependencies: NodeId[] = [],
  model: 'haiku' | 'sonnet' | 'opus' = 'sonnet'
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

// The base DAG for the Portfolio Builder example
function makePortfolioDAG(): DAG {
  return {
    id: NodeIdFn('portfolio-builder') as any,
    name: 'Portfolio Website Builder',
    version: '2.1',
    nodes: new Map([
      [NodeIdFn('interview'), createNode(
        'interview', 'Interview User',
        'Gather goals, experience, preferences, and style direction',
        'career-biographer', [], 'sonnet'
      )],
      [NodeIdFn('research'), createNode(
        'research', 'Research Industry',
        'Analyze industry portfolios, identify competitive whitespace',
        'competitive-cartographer', [NodeIdFn('interview')], 'haiku'
      )],
      [NodeIdFn('content'), createNode(
        'content', 'Write Content',
        'Draft portfolio copy from interview data',
        'cv-creator', [NodeIdFn('interview')], 'sonnet'
      )],
      [NodeIdFn('design'), createNode(
        'design', 'Design System',
        'Create visual identity from research + user vibes',
        'vibe-matcher', [NodeIdFn('research'), NodeIdFn('content')], 'sonnet'
      )],
      [NodeIdFn('build'), createNode(
        'build', 'Build Site',
        'Implement portfolio as Next.js application',
        'frontend-architect', [NodeIdFn('design')], 'sonnet'
      )],
      [NodeIdFn('review'), createNode(
        'review', 'Human Review',
        'User reviews the built portfolio for approval',
        'human-gate-designer', [NodeIdFn('build')], 'haiku'
      )],
      [NodeIdFn('deploy'), createNode(
        'deploy', 'Deploy',
        'Deploy approved portfolio to Vercel',
        'vercel-deployment', [NodeIdFn('review')], 'haiku'
      )],
    ]),
    edges: new Map([
      [NodeIdFn('interview'), [NodeIdFn('research'), NodeIdFn('content')]],
      [NodeIdFn('research'), [NodeIdFn('design')]],
      [NodeIdFn('content'), [NodeIdFn('design')]],
      [NodeIdFn('design'), [NodeIdFn('build')]],
      [NodeIdFn('build'), [NodeIdFn('review')]],
      [NodeIdFn('review'), [NodeIdFn('deploy')]],
    ]),
    config: DEFAULT_DAG_CONFIG,
    inputs: [],
    outputs: [{ name: 'portfolio', description: 'Deployed portfolio website', sourceNodeId: NodeIdFn('deploy') }],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeState(statuses: Record<string, TaskState['status']>): Map<NodeId, TaskState> {
  const map = new Map<NodeId, TaskState>();
  for (const [id, status] of Object.entries(statuses)) {
    map.set(NodeIdFn(id), {
      status,
      startedAt: status !== 'pending' ? Date.now() - 3000 : undefined,
      completedAt: status === 'completed' ? Date.now() : undefined,
    });
  }
  return map;
}

// ============================================================================
// PHASE DEFINITIONS
// ============================================================================

const PHASES: Phase[] = [
  {
    id: 'input',
    title: '1. Problem Input',
    subtitle: 'The user describes what they want',
    description: '"Build me a professional portfolio website. I\'m a staff software engineer with 12 years at Meta, working on VR, ML, and social features. I want something bold but tasteful."',
    details: [
      'The user provides a natural language description',
      'No technical knowledge required — just describe the goal',
      'winDAGs will decompose this into a structured workflow',
    ],
    dag: makePortfolioDAG(),
    executionState: makeState({
      interview: 'pending', research: 'pending', content: 'pending',
      design: 'pending', build: 'pending', review: 'pending', deploy: 'pending',
    }),
    costSoFar: 0,
  },
  {
    id: 'decompose',
    title: '2. Task Decomposition',
    subtitle: 'The meta-DAG breaks the problem into phases',
    description: 'The task-decomposer uses the software-project-decomposition meta-skill to identify 7 nodes across 5 waves. Research and content writing run in parallel (Wave 2).',
    details: [
      'Domain meta-skill selected: software-project-decomposition',
      'Identified 7 sub-tasks with dependencies',
      'Parallel opportunity found: research ∥ content (Wave 2)',
      'Human gate placed before deployment (irreversible action)',
      'Skills auto-matched via dag-skills-matcher + Thompson sampling',
      'Estimated cost: $0.10 — $0.25',
    ],
    dag: makePortfolioDAG(),
    executionState: makeState({
      interview: 'pending', research: 'pending', content: 'pending',
      design: 'pending', build: 'pending', review: 'pending', deploy: 'pending',
    }),
    costSoFar: 0.003,
    highlight: 'The DAG is now visible — all nodes pending, ready to execute.',
  },
  {
    id: 'wave1',
    title: '3. Wave 1: Interview',
    subtitle: 'First node executes — gathering user context',
    description: 'The career-biographer skill guides a Sonnet agent to interview the user about their goals, experience, and aesthetic preferences.',
    details: [
      'Model: Claude Sonnet 4.5 (Tier 2 — creative quality matters)',
      'Skill loaded: career-biographer',
      'Duration: ~4 seconds',
      'Cost: $0.02',
      'Output: structured interview data with goals, experience, and style preferences',
    ],
    dag: makePortfolioDAG(),
    executionState: makeState({
      interview: 'completed', research: 'pending', content: 'pending',
      design: 'pending', build: 'pending', review: 'pending', deploy: 'pending',
    }),
    costSoFar: 0.023,
    highlight: 'Interview complete (green). Research and Content now ready to execute in parallel.',
  },
  {
    id: 'wave2',
    title: '4. Wave 2: Research ∥ Content (Parallel)',
    subtitle: 'Two nodes execute simultaneously',
    description: 'Research uses Haiku (cheap classification + web search), while Content uses Sonnet (creative writing). Both run at the same time — total wave time is the max of the two, not the sum.',
    details: [
      'Research: Haiku ($0.001) — competitive-cartographer analyzes industry portfolios',
      'Content: Sonnet ($0.02) — cv-creator drafts portfolio copy from interview data',
      'Parallel execution: 4s wall-clock (not 8s sequential)',
      'Both receive interview output from Wave 1 via Context Store',
    ],
    dag: makePortfolioDAG(),
    executionState: makeState({
      interview: 'completed', research: 'completed', content: 'completed',
      design: 'pending', build: 'pending', review: 'pending', deploy: 'pending',
    }),
    costSoFar: 0.044,
    highlight: 'Two nodes completed in parallel. Design can now start with both inputs.',
  },
  {
    id: 'wave3',
    title: '5. Wave 3: Design',
    subtitle: 'Synthesizing research + content into a visual identity',
    description: 'The vibe-matcher skill translates the user\'s "bold but tasteful" preference and competitive whitespace analysis into a concrete design system: colors, typography, layout patterns.',
    details: [
      'Model: Sonnet ($0.02) — needs creative judgment',
      'Skills: vibe-matcher + design-system-generator',
      'Receives: interview data (Wave 1) + research (Wave 2) + content (Wave 2)',
      'Context Store provides summaries from all prior waves',
      'Output: design tokens, color palette, typography scale, layout patterns',
    ],
    dag: makePortfolioDAG(),
    executionState: makeState({
      interview: 'completed', research: 'completed', content: 'completed',
      design: 'completed', build: 'pending', review: 'pending', deploy: 'pending',
    }),
    costSoFar: 0.064,
  },
  {
    id: 'wave4',
    title: '6. Wave 4: Build',
    subtitle: 'Implementing the portfolio as a real web application',
    description: 'The frontend-architect skill guides Sonnet to build a Next.js application using the design system, content, and interview data. This is the most expensive node.',
    details: [
      'Model: Sonnet ($0.04) — code generation needs accuracy',
      'Skills: frontend-architect + nextjs-app-router-expert',
      'Generates: complete Next.js project with components, pages, styles',
      'Cost optimizer: running at 64% of budget, no downgrading needed',
    ],
    dag: makePortfolioDAG(),
    executionState: makeState({
      interview: 'completed', research: 'completed', content: 'completed',
      design: 'completed', build: 'completed', review: 'pending', deploy: 'pending',
    }),
    costSoFar: 0.104,
  },
  {
    id: 'human-gate',
    title: '7. Human Gate: Review',
    subtitle: 'The user reviews the built portfolio before deployment',
    description: 'Execution pauses. The user sees a preview of their portfolio with the design decisions highlighted. They can approve, modify (with specific feedback), or reject.',
    details: [
      'Gate type: Before irreversible action (deployment)',
      'Presentation: preview URL + design decisions + cost summary',
      'Options: ✅ Approve → deploy | ✏️ Modify → rebuild with feedback | ❌ Reject → replan',
      'Cost so far: $0.10 of $0.25 budget',
      'This is where the user\'s judgment matters most',
    ],
    dag: makePortfolioDAG(),
    executionState: makeState({
      interview: 'completed', research: 'completed', content: 'completed',
      design: 'completed', build: 'completed', review: 'running', deploy: 'pending',
    }),
    costSoFar: 0.104,
    highlight: 'Execution paused at the human gate (blue pulsing). Waiting for user decision.',
  },
  {
    id: 'complete',
    title: '8. Completion: Deploy',
    subtitle: 'User approved — portfolio goes live',
    description: 'The user approved the portfolio. A Haiku agent deploys to Vercel (cheap, mechanical task). The portfolio is live. Quality scores are collected and fed back into skill rankings.',
    details: [
      'Deploy: Haiku ($0.001) — vercel-deployment skill',
      'Total cost: $0.11 (under the $0.25 budget)',
      'Total time: ~25 seconds wall-clock',
      'All quality scores recorded → skill Elo updated',
      'Execution trace saved for replay debugging',
      'Template success rate: 91% → 91.2% (incrementally better)',
    ],
    dag: makePortfolioDAG(),
    executionState: makeState({
      interview: 'completed', research: 'completed', content: 'completed',
      design: 'completed', build: 'completed', review: 'completed', deploy: 'completed',
    }),
    costSoFar: 0.111,
    highlight: 'All nodes complete (green). Portfolio is live. Skills ranked. Trace saved.',
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

const phaseColors: Record<string, string> = {
  input: '#6B7280',
  decompose: '#3B82F6',
  wave1: '#10B981',
  wave2: '#10B981',
  wave3: '#10B981',
  wave4: '#10B981',
  'human-gate': '#8B5CF6',
  complete: '#10B981',
};

export default function LifecycleTour(): JSX.Element {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const phase = PHASES[currentPhase];

  const next = useCallback(() => {
    setCurrentPhase((p) => Math.min(p + 1, PHASES.length - 1));
  }, []);

  const prev = useCallback(() => {
    setCurrentPhase((p) => Math.max(p - 1, 0));
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying((p) => !p);
  }, []);

  useEffect(() => {
    if (isAutoPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentPhase((p) => {
          if (p >= PHASES.length - 1) {
            setIsAutoPlaying(false);
            return p;
          }
          return p + 1;
        });
      }, 4000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying]);

  return (
    <Layout title="winDAGs Lifecycle Tour" description="A guided walkthrough of the full winDAGs execution lifecycle">
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            winDAGs Lifecycle Tour
          </h1>
          <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>
            Watch a DAG of skillful agents build a portfolio website from a single sentence.
          </p>
        </div>

        {/* Phase Navigation */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '1.5rem',
          justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {PHASES.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setCurrentPhase(i)}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                border: i === currentPhase ? '2px solid #000080' : '2px solid #c0c0c0',
                background: i === currentPhase ? '#000080' : i < currentPhase ? '#d4edda' : '#f8f9fa',
                color: i === currentPhase ? '#fff' : '#333',
                cursor: 'pointer',
                fontFamily: 'var(--font-system, sans-serif)',
              }}
            >
              {p.title.split(':')[0]}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <button onClick={prev} disabled={currentPhase === 0}
            style={{ padding: '8px 16px', cursor: 'pointer', border: '2px outset #c0c0c0', background: '#c0c0c0' }}>
            ◀ Previous
          </button>
          <button onClick={toggleAutoPlay}
            style={{ padding: '8px 16px', cursor: 'pointer', border: '2px outset #c0c0c0', background: isAutoPlaying ? '#ff6b6b' : '#c0c0c0' }}>
            {isAutoPlaying ? '⏸ Pause' : '▶ Auto-Play'}
          </button>
          <button onClick={next} disabled={currentPhase === PHASES.length - 1}
            style={{ padding: '8px 16px', cursor: 'pointer', border: '2px outset #c0c0c0', background: '#c0c0c0' }}>
            Next ▶
          </button>
        </div>

        {/* Phase Content */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem', marginBottom: '1.5rem',
        }}>
          {/* Left: Description */}
          <div style={{
            border: '4px solid #000', boxShadow: '8px 8px 0 rgba(0,0,0,0.3)',
            background: '#fff',
          }}>
            {/* Win31 title bar */}
            <div style={{
              background: 'linear-gradient(90deg, #000080, #1084d0)',
              color: '#fff', padding: '4px 8px', fontWeight: 'bold',
              fontSize: '0.9rem', fontFamily: 'var(--font-system, sans-serif)',
            }}>
              {phase.title}
            </div>
            <div style={{ padding: '1rem' }}>
              <p style={{ fontStyle: 'italic', color: '#6B7280', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                {phase.subtitle}
              </p>
              <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
                {phase.description}
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {phase.details.map((d, i) => (
                  <li key={i} style={{
                    padding: '4px 0', borderBottom: '1px solid #eee',
                    fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '6px',
                  }}>
                    <span style={{ color: '#10B981', flexShrink: 0 }}>▸</span> {d}
                  </li>
                ))}
              </ul>
              {phase.highlight && (
                <div style={{
                  marginTop: '1rem', padding: '8px 12px',
                  background: '#FEF3C7', border: '1px solid #F59E0B',
                  fontSize: '0.85rem', borderRadius: '4px',
                }}>
                  💡 {phase.highlight}
                </div>
              )}
            </div>
          </div>

          {/* Right: DAG Visualization */}
          <div style={{
            border: '4px solid #000', boxShadow: '8px 8px 0 rgba(0,0,0,0.3)',
            background: '#fff', minHeight: '400px',
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #000080, #1084d0)',
              color: '#fff', padding: '4px 8px', fontWeight: 'bold',
              fontSize: '0.9rem', fontFamily: 'var(--font-system, sans-serif)',
            }}>
              DAG Visualization — ${phase.costSoFar.toFixed(3)} spent
            </div>
            <div style={{ height: '400px' }}>
              <DAGVisualizer
                dag={phase.dag}
                executionState={phase.executionState}
              />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          background: '#e5e7eb', height: '8px', borderRadius: '4px',
          overflow: 'hidden', marginBottom: '1rem',
        }}>
          <div style={{
            background: '#000080',
            height: '100%',
            width: `${((currentPhase + 1) / PHASES.length) * 100}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>

        {/* Phase Counter */}
        <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.9rem' }}>
          Phase {currentPhase + 1} of {PHASES.length} · Portfolio Website Builder Template
        </p>
      </main>
    </Layout>
  );
}
