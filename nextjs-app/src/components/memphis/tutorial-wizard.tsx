'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Win31Button, Win31Window } from './program-manager';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TUTORIAL WIZARD - Click-through educational programs
 * Like Win3.1 setup wizards but for learning Claude skills
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface TutorialStep {
  title: string;
  content: React.ReactNode;
  image?: string;
  highlight?: string; // CSS selector to highlight
}

interface TutorialWizardProps {
  title: string;
  steps: TutorialStep[];
  onComplete?: () => void;
  onClose?: () => void;
}

export function TutorialWizard({
  title,
  steps,
  onComplete,
  onClose,
}: TutorialWizardProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const goNext = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goBack = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Win31Window
        title={title}
        className="w-[500px] max-w-[95vw] max-h-[90vh]"
        onClose={onClose}
        menuItems={[]}
      >
        <div className="p-4 bg-[var(--memphis-cream)]">
          {/* Progress indicator */}
          <div className="flex gap-1 mb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 flex-1 rounded-full transition-colors',
                  i <= currentStep
                    ? 'bg-gradient-to-r from-[var(--memphis-purple)] to-[var(--memphis-pink)]'
                    : 'bg-[var(--memphis-cream-dark)]'
                )}
              />
            ))}
          </div>

          {/* Step title */}
          <h2 className="text-lg font-bold text-[var(--memphis-purple)] mb-4">
            {step.title}
          </h2>

          {/* Step content */}
          <div className="flex gap-4">
            {step.image && (
              <div className="w-48 h-32 flex-shrink-0 bg-white border border-[var(--memphis-shadow)] flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={step.image}
                  alt=""
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <div className="flex-1 text-sm leading-relaxed">
              {step.content}
            </div>
          </div>

          {/* Step indicator */}
          <div className="mt-4 text-center text-xs text-[var(--memphis-shadow)]">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Button bar */}
        <div className="p-3 bg-[var(--memphis-cream)] border-t border-[var(--memphis-shadow)] flex justify-between">
          <Win31Button onClick={onClose}>
            Cancel
          </Win31Button>
          <div className="flex gap-2">
            <Win31Button onClick={goBack} disabled={isFirstStep}>
              &lt; Back
            </Win31Button>
            <Win31Button onClick={goNext} variant="primary" isDefault>
              {isLastStep ? 'Finish' : 'Next >'}
            </Win31Button>
          </div>
        </div>
      </Win31Window>
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PRE-BUILT TUTORIALS - Ready-to-use educational content
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TUTORIAL_WHAT_IS_A_SKILL: TutorialStep[] = [
  {
    title: 'Welcome to Claude Skills!',
    content: (
      <div className="space-y-3">
        <p>
          <strong>Claude Skills</strong> are reusable instructions that give Claude Code
          superpowers in specific domains.
        </p>
        <p>
          Think of them like plugins for your AI assistant - each skill teaches Claude
          how to be an expert at something specific.
        </p>
      </div>
    ),
    image: '/img/tutorial-skill-intro.png',
  },
  {
    title: 'What Skills Can Do',
    content: (
      <div className="space-y-3">
        <p>Skills can help you:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Write better code following best practices</li>
          <li>Generate documentation and tests</li>
          <li>Create visual assets and designs</li>
          <li>Work with specific APIs and frameworks</li>
          <li>Follow company style guides</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'How Skills Work',
    content: (
      <div className="space-y-3">
        <p>
          Each skill is a markdown file stored in your <code className="bg-white px-1 border border-[var(--memphis-shadow)]">.claude/skills/</code> folder.
        </p>
        <p>
          When you mention a skill name, Claude automatically loads those instructions
          and applies that expertise to your task.
        </p>
        <div className="bg-[var(--memphis-cyan)]/10 p-2 border border-[var(--memphis-cyan)] rounded text-xs">
          <strong>Example:</strong> &quot;Use the react-best-practices skill to review my component&quot;
        </div>
      </div>
    ),
  },
  {
    title: 'Ready to Get Started?',
    content: (
      <div className="space-y-3">
        <p>
          You now understand the basics of Claude Skills! Next, you might want to:
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Browse the skill gallery</li>
          <li>Install your first skill</li>
          <li>Try the &quot;Installing Your First Skill&quot; tutorial</li>
        </ul>
        <p className="text-[var(--memphis-purple)] font-semibold">
          Click Finish to explore the skills!
        </p>
      </div>
    ),
  },
];

export const TUTORIAL_INSTALLING_SKILLS: TutorialStep[] = [
  {
    title: 'Installing Your First Skill',
    content: (
      <div className="space-y-3">
        <p>
          Installing a skill is easy! Let&apos;s walk through the process step by step.
        </p>
        <p>
          First, you&apos;ll need Claude Code installed and running on your machine.
        </p>
      </div>
    ),
  },
  {
    title: 'Step 1: Add the Marketplace',
    content: (
      <div className="space-y-3">
        <p>
          Before installing skills, add the Some Claude Skills marketplace (one-time setup):
        </p>
        <div className="bg-black text-green-400 p-2 font-mono text-xs rounded">
          /marketplace add some-claude-skills
        </div>
        <p className="text-xs text-[var(--memphis-shadow)]">
          This connects Claude to our curated skill collection.
        </p>
      </div>
    ),
  },
  {
    title: 'Step 2: Browse and Choose',
    content: (
      <div className="space-y-3">
        <p>
          Browse our gallery and find a skill you want. Each skill page shows:
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li>What the skill does</li>
          <li>Example use cases</li>
          <li>Installation command</li>
          <li>Compatible skills that work well together</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Step 3: Install the Skill',
    content: (
      <div className="space-y-3">
        <p>
          Copy the install command from the skill page:
        </p>
        <div className="bg-black text-green-400 p-2 font-mono text-xs rounded">
          /plugin install skill-name@some-claude-skills
        </div>
        <p>
          Paste it into Claude Code and press Enter. The skill will be downloaded
          to your <code className="bg-white px-1 border border-[var(--memphis-shadow)]">.claude/skills/</code> folder.
        </p>
      </div>
    ),
  },
  {
    title: 'Step 4: Use Your New Skill',
    content: (
      <div className="space-y-3">
        <p>
          Now just mention the skill in your prompts:
        </p>
        <div className="bg-[var(--memphis-cyan)]/10 p-2 border border-[var(--memphis-cyan)] rounded text-xs">
          &quot;Use the <strong>typescript-best-practices</strong> skill to review my code&quot;
        </div>
        <p>
          Claude will automatically apply that expertise!
        </p>
        <p className="text-[var(--memphis-purple)] font-semibold">
          🎉 Congratulations! You&apos;re ready to supercharge Claude.
        </p>
      </div>
    ),
  },
];

export const TUTORIAL_CREATIVE_WRITING: TutorialStep[] = [
  {
    title: 'Creative Uses: Writing with Skills',
    content: (
      <div className="space-y-3">
        <p>
          Skills aren&apos;t just for code! Let&apos;s explore how to use skills for creative
          writing and content creation.
        </p>
      </div>
    ),
  },
  {
    title: 'Writing Assistant Skills',
    content: (
      <div className="space-y-3">
        <p>Skills can help you:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Blog Post Writer</strong> - SEO-optimized articles</li>
          <li><strong>Technical Docs</strong> - Clear documentation</li>
          <li><strong>Copy Editor</strong> - Polish your prose</li>
          <li><strong>Social Media</strong> - Engaging posts</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Combining Skills',
    content: (
      <div className="space-y-3">
        <p>
          The real power comes from combining skills:
        </p>
        <div className="bg-[var(--memphis-cyan)]/10 p-2 border border-[var(--memphis-cyan)] rounded text-xs">
          &quot;Use <strong>blog-writer</strong> and <strong>seo-optimizer</strong> skills
          to write a post about AI productivity&quot;
        </div>
        <p>
          Claude will blend both skill sets for optimal results!
        </p>
      </div>
    ),
  },
  {
    title: 'Skill Bundles',
    content: (
      <div className="space-y-3">
        <p>
          We&apos;ve created <strong>Skill Bundles</strong> for common workflows:
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Content Creator Bundle</li>
          <li>Technical Writer Bundle</li>
          <li>Marketing Copy Bundle</li>
        </ul>
        <p>
          Each bundle installs multiple complementary skills at once.
        </p>
      </div>
    ),
  },
];

export const TUTORIAL_CREATIVE_CODING: TutorialStep[] = [
  {
    title: 'Creative Uses: Coding with Skills',
    content: (
      <div className="space-y-3">
        <p>
          Skills transform Claude into a specialized developer for any stack or domain.
        </p>
      </div>
    ),
  },
  {
    title: 'Framework-Specific Skills',
    content: (
      <div className="space-y-3">
        <p>Install skills for your tech stack:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>React/Next.js</strong> - Modern patterns</li>
          <li><strong>Python/FastAPI</strong> - Type-safe APIs</li>
          <li><strong>Rust</strong> - Memory-safe systems</li>
          <li><strong>Swift/SwiftUI</strong> - Apple ecosystem</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Architecture Skills',
    content: (
      <div className="space-y-3">
        <p>
          Skills can enforce architectural patterns:
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Clean Architecture</li>
          <li>Domain-Driven Design</li>
          <li>Microservices patterns</li>
          <li>Event sourcing</li>
        </ul>
        <p>
          Claude will structure code according to these principles!
        </p>
      </div>
    ),
  },
  {
    title: 'Testing & Quality',
    content: (
      <div className="space-y-3">
        <p>
          Combine coding skills with quality skills:
        </p>
        <div className="bg-[var(--memphis-cyan)]/10 p-2 border border-[var(--memphis-cyan)] rounded text-xs">
          &quot;Use <strong>react-expert</strong> and <strong>testing-champion</strong> skills
          to build a user profile component with tests&quot;
        </div>
        <p>
          Get production-ready code with comprehensive tests!
        </p>
      </div>
    ),
  },
];

export const TUTORIAL_BUILDING_SKILLS: TutorialStep[] = [
  {
    title: 'Building Your Own Skill',
    content: (
      <div className="space-y-3">
        <p>
          Ready to create your own skill? It&apos;s just a markdown file with
          structured instructions.
        </p>
      </div>
    ),
  },
  {
    title: 'Skill Anatomy',
    content: (
      <div className="space-y-3">
        <p>A skill file contains:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Frontmatter</strong> - Metadata (name, tags, etc.)</li>
          <li><strong>Description</strong> - What the skill does</li>
          <li><strong>Instructions</strong> - How Claude should behave</li>
          <li><strong>Examples</strong> - Input/output samples</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Writing Instructions',
    content: (
      <div className="space-y-3">
        <p>
          Good skill instructions are:
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Specific</strong> - Clear, actionable guidance</li>
          <li><strong>Contextual</strong> - When to apply what</li>
          <li><strong>Exemplified</strong> - Show don&apos;t just tell</li>
          <li><strong>Tested</strong> - Verify they work</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Sharing Your Skills',
    content: (
      <div className="space-y-3">
        <p>
          Want to share your skills with the community?
        </p>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Fork the Some Claude Skills repo</li>
          <li>Add your skill to the skills folder</li>
          <li>Submit a pull request</li>
          <li>We&apos;ll review and publish it!</li>
        </ol>
      </div>
    ),
  },
];

export const TUTORIAL_SKILL_BUNDLES: TutorialStep[] = [
  {
    title: 'Skill Bundles & Workflows',
    content: (
      <div className="space-y-3">
        <p>
          <strong>Skill Bundles</strong> are curated collections of complementary skills
          designed for specific workflows.
        </p>
      </div>
    ),
  },
  {
    title: 'Why Bundles?',
    content: (
      <div className="space-y-3">
        <p>Instead of installing skills one by one, bundles give you:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Pre-tested skill combinations</li>
          <li>Workflow-optimized setups</li>
          <li>One-click installation</li>
          <li>Best practices baked in</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Available Bundles',
    content: (
      <div className="space-y-3">
        <p>Popular bundles include:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Full-Stack Web Dev</strong> - React, Node, TypeScript</li>
          <li><strong>Data Science</strong> - Python, Pandas, ML</li>
          <li><strong>DevOps Pro</strong> - Docker, K8s, CI/CD</li>
          <li><strong>Content Creator</strong> - Writing, SEO, Social</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Installing Bundles',
    content: (
      <div className="space-y-3">
        <p>
          Install an entire bundle with one command:
        </p>
        <div className="bg-black text-green-400 p-2 font-mono text-xs rounded">
          /bundle install fullstack-web@some-claude-skills
        </div>
        <p>
          All skills in the bundle are installed and ready to use!
        </p>
      </div>
    ),
  },
];

// Tutorial registry
export const TUTORIALS = {
  'what-is-a-skill': {
    title: 'What is a Claude Skill?',
    icon: '❓',
    steps: TUTORIAL_WHAT_IS_A_SKILL,
  },
  'installing-skills': {
    title: 'Installing Your First Skill',
    icon: '📦',
    steps: TUTORIAL_INSTALLING_SKILLS,
  },
  'creative-writing': {
    title: 'Creative Uses: Writing',
    icon: '✍️',
    steps: TUTORIAL_CREATIVE_WRITING,
  },
  'creative-coding': {
    title: 'Creative Uses: Coding',
    icon: '💻',
    steps: TUTORIAL_CREATIVE_CODING,
  },
  'building-skills': {
    title: 'Building Your Own Skill',
    icon: '🔧',
    steps: TUTORIAL_BUILDING_SKILLS,
  },
  'skill-bundles': {
    title: 'Skill Bundles & Workflows',
    icon: '📚',
    steps: TUTORIAL_SKILL_BUNDLES,
  },
} as const;

export type TutorialId = keyof typeof TUTORIALS;
