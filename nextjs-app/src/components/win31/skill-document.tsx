'use client';

import * as React from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  FileText,
  Book,
  Link2,
  ChevronDown,
  ChevronRight,
  Zap,
  Clock,
  Tag,
  Layers,
  Terminal,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Lightbulb,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { type Skill, type SkillReference, categoryMeta } from '@/lib/skills';
import { Button } from '@/components/ui/button';
import { Window } from './window';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SKILL DOCUMENT VIEWER - Bento Layout with Progressive Disclosure
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface SkillDocumentProps {
  skill: Skill;
  onClose: () => void;
  onNavigate?: (skillId: string) => void;
}

export function SkillDocument({ skill, onClose, onNavigate }: SkillDocumentProps) {
  const [copied, setCopied] = React.useState(false);
  const [activeReference, setActiveReference] = React.useState<string | null>(null);
  const category = categoryMeta[skill.category];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(skill.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle skill link clicks
  const handleSkillClick = (skillId: string) => {
    if (onNavigate) {
      onNavigate(skillId);
    }
  };

  // Handle reference link clicks
  const handleReferenceClick = (refPath: string) => {
    setActiveReference(refPath);
  };

  // Parse content into sections for progressive disclosure
  const sections = React.useMemo(() => parseContentSections(skill.content), [skill.content]);

  // Extract stats
  const lineCount = skill.content.split('\n').length;
  const wordCount = skill.content.split(/\s+/).length;
  const codeBlockCount = (skill.content.match(/```/g) || []).length / 2;

  return (
    <Window
      title={`${skill.title}.md`}
      icon={<FileText className="h-4 w-4" />}
      onClose={onClose}
      className="mx-auto h-[calc(100dvh-60px)] max-w-6xl animate-fade-in"
      size="full"
    >
      <div className="flex h-full flex-col overflow-hidden">
        {/* Main scrollable area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            {/* ═══════════════════════════════════════════════════════════════
                HERO FRONT CARD - The beautiful first impression
            ═══════════════════════════════════════════════════════════════ */}
            <div className="mb-6 grid gap-4 lg:grid-cols-3">
              {/* Main hero card */}
              <div className="lg:col-span-2">
                <BentoCard className="h-full" size="large" glow>
                  <div className="flex h-full flex-col">
                    {/* Hero image area */}
                    <div className="relative mb-4 aspect-video w-full overflow-hidden rounded bg-gradient-to-br from-win31-navy via-win31-blue to-indigo-600">
                      {/* Actual hero image if available */}
                      {skill.heroImage ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={skill.heroImage}
                            alt={skill.title}
                            className="absolute inset-0 h-full w-full object-cover"
                            onError={(e) => {
                              // Hide image on error, show fallback
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          {/* Subtle overlay for text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        </>
                      ) : (
                        <>
                          {/* Fallback: gradient + icon */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-8xl opacity-30">{skill.icon}</span>
                          </div>
                          {/* Pixel grid overlay */}
                          <div 
                            className="absolute inset-0 opacity-10"
                            style={{
                              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 4px),
                                               repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 4px)`,
                            }}
                          />
                        </>
                      )}
                      {/* Category badge */}
                      <div className="absolute left-3 top-3">
                        <span className="inline-flex items-center gap-1.5 rounded-sm bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                          {category.icon} {category.label}
                        </span>
                      </div>
                      {/* Difficulty badge */}
                      <div className="absolute right-3 top-3">
                        <DifficultyBadge difficulty={skill.difficulty} />
                      </div>
                    </div>

                    {/* Title and description */}
                    <div className="flex-1">
                      <div className="mb-2 flex items-start gap-3">
                        <span className="text-4xl">{skill.icon}</span>
                        <div className="flex-1">
                          <h1 className="text-2xl font-bold text-win31-navy">{skill.title}</h1>
                          <p className="mt-1 text-sm text-win31-gray-darker leading-relaxed">
                            {skill.description}
                          </p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {skill.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-sm bg-win31-gray-light px-2 py-0.5 text-xs text-win31-gray-darker border border-win31-gray-darker/30"
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Install CTA - Both Steps */}
                    <div className="mt-4 pt-4 border-t border-win31-gray-darker/30">
                      {/* Step 1 - One time */}
                      <div className="mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-win31-lime text-xs font-bold text-black">1</span>
                          <span className="text-xs text-win31-gray-darker">Add marketplace (one-time)</span>
                        </div>
                        <div className="flex items-center gap-2 rounded bg-win31-gray-darker px-3 py-1.5">
                          <Terminal className="h-3 w-3 text-win31-gray-light flex-shrink-0" />
                          <code className="flex-1 truncate font-mono text-xs text-win31-gray-light">
                            /plugin marketplace add erichowens/some_claude_skills
                          </code>
                        </div>
                      </div>
                      {/* Step 2 - Install */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-win31-yellow text-xs font-bold text-black">2</span>
                            <span className="text-xs text-win31-gray-darker">Install this skill</span>
                          </div>
                          <div className="flex items-center gap-2 rounded bg-win31-black px-3 py-2">
                            <Terminal className="h-4 w-4 text-win31-lime flex-shrink-0" />
                            <code className="flex-1 truncate font-mono text-sm text-win31-lime">
                              {skill.installCommand}
                            </code>
                          </div>
                        </div>
                        <Button 
                          variant="primary" 
                          size="lg" 
                          onClick={handleCopy}
                          className="flex-shrink-0 mt-auto"
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </BentoCard>
              </div>

              {/* Stats bento column */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {/* Quick stats */}
                <BentoCard>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-win31-gray-darker">
                    <Sparkles className="h-3.5 w-3.5" />
                    Quick Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <StatPill icon={<FileText className="h-3.5 w-3.5" />} label="Lines" value={lineCount} />
                    <StatPill icon={<Layers className="h-3.5 w-3.5" />} label="Sections" value={sections.length} />
                    <StatPill icon={<Terminal className="h-3.5 w-3.5" />} label="Code Blocks" value={Math.floor(codeBlockCount)} />
                    <StatPill icon={<Clock className="h-3.5 w-3.5" />} label="~Read Time" value={`${Math.ceil(wordCount / 200)}m`} />
                  </div>
                </BentoCard>

                {/* References preview */}
                {skill.references && skill.references.length > 0 && (
                  <BentoCard>
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-win31-gray-darker">
                      <Link2 className="h-3.5 w-3.5" />
                      References ({skill.references.length})
                    </h3>
                    <div className="space-y-2">
                      {skill.references.slice(0, 3).map((ref, i) => (
                        <ReferenceChip key={i} reference={ref} onNavigate={onNavigate} />
                      ))}
                      {skill.references.length > 3 && (
                        <p className="text-xs text-win31-gray-darker">
                          +{skill.references.length - 3} more below
                        </p>
                      )}
                    </div>
                  </BentoCard>
                )}

                {/* Related skills placeholder */}
                <BentoCard className="bg-gradient-to-br from-win31-gray to-win31-gray-light">
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-win31-gray-darker">
                    <Zap className="h-3.5 w-3.5" />
                    Works Great With
                  </h3>
                  <p className="text-xs text-win31-gray-darker">
                    Combine with other skills for powerful workflows
                  </p>
                  <Button variant="ghost" size="sm" className="mt-2 w-full justify-between">
                    Explore Bundles
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </BentoCard>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                CONTENT SECTIONS - Progressive Disclosure Wonderland
            ═══════════════════════════════════════════════════════════════ */}
            <div className="space-y-3">
              {sections.map((section, index) => (
                <CollapsibleSection
                  key={index}
                  section={section}
                  defaultOpen={index < 2} // First two sections open by default
                  onSkillClick={handleSkillClick}
                  onReferenceClick={handleReferenceClick}
                />
              ))}
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                BOTTOM BENTO GRID - Additional Resources
            ═══════════════════════════════════════════════════════════════ */}
            {skill.references && skill.references.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-win31-navy">
                  <Book className="h-4 w-4" />
                  All References & Resources
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {skill.references.map((ref, i) => (
                    <ReferenceCard key={i} reference={ref} onNavigate={onNavigate} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reference Viewer Modal */}
      {activeReference && (
        <ReferenceViewer
          skill={skill}
          referencePath={activeReference}
          onClose={() => setActiveReference(null)}
        />
      )}
    </Window>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * REFERENCE VIEWER MODAL
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface ReferenceViewerProps {
  skill: Skill;
  referencePath: string;
  onClose: () => void;
}

function ReferenceViewer({ skill, referencePath, onClose }: ReferenceViewerProps) {
  // Try to find the reference in the skill's references
  const reference = skill.references?.find(ref => 
    ref.title.toLowerCase().includes(referencePath.toLowerCase()) ||
    ref.url.includes(referencePath)
  );

  // Get the reference content (in a real implementation, this would fetch the actual file)
  const referenceContent = reference?.description || 
    `Reference file: ${referencePath}\n\nThis is a reference file included with the ${skill.title} skill. In a full implementation, this would display the actual file contents from the skill's references folder.`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl max-h-[80vh] flex flex-col bg-win31-gray border-4 border-win31-black shadow-[8px_8px_0_rgba(0,0,0,0.5)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="flex items-center justify-between bg-gradient-to-r from-win31-teal to-emerald-600 px-3 py-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-white" />
            <span className="font-mono text-sm font-bold text-white">
              {referencePath}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center border-2 border-win31-black bg-win31-gray text-xs font-bold hover:bg-win31-gray-light"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-white">
          <pre className="whitespace-pre-wrap font-mono text-sm text-win31-black leading-relaxed">
            {referenceContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t-2 border-win31-gray-darker bg-win31-gray px-3 py-2">
          <span className="text-xs text-win31-gray-darker">
            From: {skill.title}/references/
          </span>
          <a
            href={`https://github.com/erichowens/some_claude_skills/tree/main/.claude/skills/${skill.id}/references`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-win31-teal hover:underline"
          >
            View on GitHub
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * BENTO CARD - Reusable container
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'small' | 'medium' | 'large';
  glow?: boolean;
}

function BentoCard({ className, size = 'medium', glow, children, ...props }: BentoCardProps) {
  return (
    <div
      className={cn(
        'rounded-sm border-2 border-win31-black bg-win31-gray p-4',
        'shadow-[inset_1px_1px_0_var(--color-win31-white),inset_-1px_-1px_0_var(--color-win31-gray-darker)]',
        glow && 'ring-2 ring-win31-navy/20',
        size === 'small' && 'p-3',
        size === 'large' && 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * STAT PILL
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface StatPillProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function StatPill({ icon, label, value }: StatPillProps) {
  return (
    <div className="flex items-center gap-2 rounded-sm bg-win31-gray-light px-2 py-1.5 border border-win31-gray-darker/30">
      <span className="text-win31-navy">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="truncate text-xs font-medium text-win31-black">{value}</p>
        <p className="truncate text-[10px] text-win31-gray-darker">{label}</p>
      </div>
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * COLLAPSIBLE SECTION - Progressive Disclosure
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface ContentSection {
  title: string;
  level: number;
  content: string;
  children: ContentSection[];
}

function parseContentSections(content: string): ContentSection[] {
  const lines = content.split('\n');
  const sections: ContentSection[] = [];
  let currentSection: ContentSection | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/);
    const h3Match = line.match(/^### (.+)$/);

    if (h2Match) {
      // Save previous section
      if (currentSection) {
        currentSection.content = currentContent.join('\n').trim();
        sections.push(currentSection);
      }
      currentSection = { title: h2Match[1], level: 2, content: '', children: [] };
      currentContent = [];
    } else if (h3Match && currentSection) {
      // Add h3 as nested content (we'll render it inline for now)
      currentContent.push(line);
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Don't forget the last section
  if (currentSection) {
    currentSection.content = currentContent.join('\n').trim();
    sections.push(currentSection);
  }

  return sections;
}

interface CollapsibleSectionProps {
  section: ContentSection;
  defaultOpen?: boolean;
  onSkillClick?: (skillId: string) => void;
  onReferenceClick?: (refPath: string) => void;
}

function CollapsibleSection({ section, defaultOpen = false, onSkillClick, onReferenceClick }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  // Detect section type for styling
  const sectionType = detectSectionType(section.title);

  return (
    <BentoCard 
      size="small" 
      className={cn(
        'transition-all duration-200',
        !isOpen && 'hover:bg-win31-gray-light cursor-pointer'
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 text-left"
      >
        {/* Section icon based on type */}
        <span className={cn(
          'flex h-8 w-8 items-center justify-center rounded-sm text-white',
          sectionType.bgColor
        )}>
          {sectionType.icon}
        </span>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-win31-navy truncate">{section.title}</h2>
          {!isOpen && (
            <p className="text-xs text-win31-gray-darker truncate mt-0.5">
              {getPreviewText(section.content)}
            </p>
          )}
        </div>

        <span className={cn(
          'flex h-6 w-6 items-center justify-center rounded-sm bg-win31-gray-light transition-transform',
          isOpen && 'rotate-180'
        )}>
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-win31-gray-darker/30">
          <div className="prose-typora">
            <MarkdownContent 
              content={section.content} 
              onSkillClick={onSkillClick}
              onReferenceClick={onReferenceClick}
            />
          </div>
        </div>
      )}
    </BentoCard>
  );
}

function detectSectionType(title: string): { icon: React.ReactNode; bgColor: string } {
  const lower = title.toLowerCase();
  
  if (lower.includes('when to use') || lower.includes('usage')) {
    return { icon: <CheckCircle2 className="h-4 w-4" />, bgColor: 'bg-emerald-600' };
  }
  if (lower.includes('don\'t') || lower.includes('avoid') || lower.includes('anti')) {
    return { icon: <XCircle className="h-4 w-4" />, bgColor: 'bg-red-600' };
  }
  if (lower.includes('important') || lower.includes('critical') || lower.includes('warning')) {
    return { icon: <AlertTriangle className="h-4 w-4" />, bgColor: 'bg-amber-600' };
  }
  if (lower.includes('tip') || lower.includes('best practice')) {
    return { icon: <Lightbulb className="h-4 w-4" />, bgColor: 'bg-blue-600' };
  }
  if (lower.includes('example') || lower.includes('code')) {
    return { icon: <Terminal className="h-4 w-4" />, bgColor: 'bg-slate-700' };
  }
  if (lower.includes('reference') || lower.includes('resource')) {
    return { icon: <Book className="h-4 w-4" />, bgColor: 'bg-purple-600' };
  }
  
  return { icon: <Layers className="h-4 w-4" />, bgColor: 'bg-win31-navy' };
}

function getPreviewText(content: string): string {
  // Get first meaningful line
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('```'));
  const first = lines[0] || '';
  return first.slice(0, 80) + (first.length > 80 ? '...' : '');
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * REFERENCE COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface ReferenceChipProps {
  reference: SkillReference;
  onNavigate?: (skillId: string) => void;
}

function ReferenceChip({ reference, onNavigate }: ReferenceChipProps) {
  const isExternal = reference.url.startsWith('http');
  const isSkill = reference.type === 'related-skill';

  const handleClick = () => {
    if (isSkill && onNavigate) {
      const skillId = reference.url.split('/').pop();
      if (skillId) onNavigate(skillId);
    } else if (isExternal) {
      window.open(reference.url, '_blank', 'noopener,noreferrer');
    }
  };

  const typeIcon = {
    guide: <Book className="h-3 w-3" />,
    example: <FileText className="h-3 w-3" />,
    'related-skill': <Link2 className="h-3 w-3" />,
    external: <ExternalLink className="h-3 w-3" />,
  };

  return (
    <button
      onClick={handleClick}
      className="flex w-full items-center gap-2 rounded-sm bg-win31-gray-light px-2 py-1.5 text-left text-xs hover:bg-win31-navy hover:text-white transition-colors border border-win31-gray-darker/30"
    >
      <span className="flex-shrink-0">{typeIcon[reference.type]}</span>
      <span className="flex-1 truncate font-medium">{reference.title}</span>
      {isExternal && <ExternalLink className="h-2.5 w-2.5 flex-shrink-0 opacity-50" />}
    </button>
  );
}

interface ReferenceCardProps {
  reference: SkillReference;
  onNavigate?: (skillId: string) => void;
}

function ReferenceCard({ reference, onNavigate }: ReferenceCardProps) {
  const isExternal = reference.url.startsWith('http');
  const isSkill = reference.type === 'related-skill';

  const handleClick = () => {
    if (isSkill && onNavigate) {
      const skillId = reference.url.split('/').pop();
      if (skillId) onNavigate(skillId);
    } else if (isExternal) {
      window.open(reference.url, '_blank', 'noopener,noreferrer');
    }
  };

  const typeConfig = {
    guide: { icon: <Book className="h-4 w-4" />, bg: 'bg-blue-600', label: 'Guide' },
    example: { icon: <FileText className="h-4 w-4" />, bg: 'bg-emerald-600', label: 'Example' },
    'related-skill': { icon: <Link2 className="h-4 w-4" />, bg: 'bg-purple-600', label: 'Related' },
    external: { icon: <ExternalLink className="h-4 w-4" />, bg: 'bg-slate-600', label: 'External' },
  };

  const config = typeConfig[reference.type];

  return (
    <button
      onClick={handleClick}
      className="flex items-start gap-3 rounded-sm border-2 border-win31-black bg-win31-gray p-3 text-left transition-all hover:bg-win31-gray-light hover:shadow-md"
    >
      <span className={cn('flex h-8 w-8 items-center justify-center rounded-sm text-white', config.bg)}>
        {config.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-win31-navy truncate">{reference.title}</p>
        {reference.description && (
          <p className="text-xs text-win31-gray-darker mt-0.5 line-clamp-2">{reference.description}</p>
        )}
        <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-win31-gray-darker">
          {config.label}
          {isExternal && <ExternalLink className="h-2.5 w-2.5" />}
        </span>
      </div>
    </button>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * DIFFICULTY BADGE
 * ═══════════════════════════════════════════════════════════════════════════
 */

function DifficultyBadge({ difficulty }: { difficulty: Skill['difficulty'] }) {
  const config = {
    beginner: { bg: 'bg-emerald-500', label: 'Beginner' },
    intermediate: { bg: 'bg-amber-500', label: 'Intermediate' },
    advanced: { bg: 'bg-red-500', label: 'Advanced' },
  };

  const { bg, label } = config[difficulty];

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium text-white', bg)}>
      {label}
    </span>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ENHANCED MARKDOWN RENDERER
 * With syntax highlighting and special callout styling
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Highlight, themes, type Language } from 'prism-react-renderer';

// Language aliases for code blocks
const LANGUAGE_ALIASES: Record<string, Language> = {
  ts: 'typescript',
  js: 'javascript',
  tsx: 'tsx',
  jsx: 'jsx',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  graphql: 'graphql',
  gql: 'graphql',
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
  python: 'python',
  py: 'python',
  sql: 'sql',
  css: 'css',
  html: 'markup',
  xml: 'markup',
  markdown: 'markdown',
  md: 'markdown',
  diff: 'diff',
  rust: 'rust',
  go: 'go',
  swift: 'swift',
};

// Callout detection patterns
type CalloutType = 'do' | 'dont' | 'important' | 'tip' | 'warning' | 'note';

const CALLOUT_CONFIG: Record<CalloutType, {
  patterns: RegExp[];
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  textColor: string;
  label: string;
}> = {
  do: {
    patterns: [/^✅\s*/, /^DO:\s*/i, /^ALWAYS:\s*/i, /^\[x\]\s*/i, /^SHOULD:\s*/i, /^MUST:\s*/i, /^PREFER:\s*/i],
    icon: <CheckCircle2 className="h-4 w-4" />,
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-l-emerald-500',
    textColor: 'text-emerald-700',
    label: 'DO',
  },
  dont: {
    patterns: [/^❌\s*/, /^DON'?T:\s*/i, /^NEVER:\s*/i, /^AVOID:\s*/i, /^\[ \]\s*/i, /^SHOULDN'?T:\s*/i, /^MUST NOT:\s*/i, /^NOT:\s*/i],
    icon: <XCircle className="h-4 w-4" />,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-l-red-500',
    textColor: 'text-red-700',
    label: "DON'T",
  },
  important: {
    patterns: [/^⚠️\s*/, /^IMPORTANT:\s*/i, /^CRITICAL:\s*/i, /^REQUIRED:\s*/i, /^CRUCIAL:\s*/i],
    icon: <AlertTriangle className="h-4 w-4" />,
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-l-amber-500',
    textColor: 'text-amber-700',
    label: 'IMPORTANT',
  },
  warning: {
    patterns: [/^⚡\s*/, /^WARNING:\s*/i, /^CAUTION:\s*/i, /^WATCH OUT:\s*/i],
    icon: <Zap className="h-4 w-4" />,
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-l-orange-500',
    textColor: 'text-orange-700',
    label: 'WARNING',
  },
  tip: {
    patterns: [/^💡\s*/, /^TIP:\s*/i, /^HINT:\s*/i, /^PRO TIP:\s*/i, /^BEST PRACTICE:\s*/i],
    icon: <Lightbulb className="h-4 w-4" />,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-l-blue-500',
    textColor: 'text-blue-700',
    label: 'TIP',
  },
  note: {
    patterns: [/^ℹ️\s*/, /^NOTE:\s*/i, /^INFO:\s*/i, /^FYI:\s*/i],
    icon: <Info className="h-4 w-4" />,
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-l-slate-500',
    textColor: 'text-slate-700',
    label: 'NOTE',
  },
};

function detectCalloutType(text: string): { type: CalloutType; cleanText: string } | null {
  for (const [type, config] of Object.entries(CALLOUT_CONFIG)) {
    for (const pattern of config.patterns) {
      if (pattern.test(text)) {
        return { type: type as CalloutType, cleanText: text.replace(pattern, '').trim() };
      }
    }
  }
  return null;
}

interface MarkdownContentProps {
  content: string;
  onSkillClick?: (skillId: string) => void;
  onReferenceClick?: (refPath: string) => void;
}

function MarkdownContent({ content, onSkillClick, onReferenceClick }: MarkdownContentProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';
  let calloutBuffer: { type: CalloutType; items: string[] } | null = null;

  // Context for inline rendering
  const renderContext: InlineRenderContext = { onSkillClick, onReferenceClick };

  const flushCalloutBuffer = (key: number) => {
    if (calloutBuffer && calloutBuffer.items.length > 0) {
      const config = CALLOUT_CONFIG[calloutBuffer.type];
      elements.push(
        <div key={`callout-${key}`} className={cn('my-4 border-l-4 p-4 rounded-r-sm', config.bgColor, config.borderColor)}>
          <div className={cn('mb-2 flex items-center gap-2 font-semibold text-sm', config.textColor)}>
            {config.icon}
            <span>{config.label}</span>
          </div>
          <ul className="space-y-1 pl-6">
            {calloutBuffer.items.map((item, i) => (
              <li key={i} className="list-disc text-sm">{renderInline(item, renderContext)}</li>
            ))}
          </ul>
        </div>
      );
      calloutBuffer = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      flushCalloutBuffer(i);
      if (inCodeBlock) {
        const langKey = codeBlockLang.toLowerCase();
        const language = LANGUAGE_ALIASES[langKey] || langKey || 'text';
        elements.push(
          <CodeBlock key={i} code={codeBlockContent.join('\n')} language={language as Language} />
        );
        codeBlockContent = [];
        codeBlockLang = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // H3 headers (within sections)
    if (line.startsWith('### ')) {
      flushCalloutBuffer(i);
      elements.push(
        <h3 key={i} className="mb-2 mt-5 text-base font-semibold text-win31-navy flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-win31-gray-darker" />
          {line.slice(4)}
        </h3>
      );
      continue;
    }

    // Lists with callout detection
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const itemText = line.slice(2);
      const callout = detectCalloutType(itemText);

      if (callout) {
        if (calloutBuffer && calloutBuffer.type === callout.type) {
          calloutBuffer.items.push(callout.cleanText);
        } else {
          flushCalloutBuffer(i);
          calloutBuffer = { type: callout.type, items: [callout.cleanText] };
        }
      } else {
        flushCalloutBuffer(i);
        elements.push(
          <li key={i} className="ml-4 list-disc text-sm">{renderInline(itemText, renderContext)}</li>
        );
      }
      continue;
    }

    if (/^\d+\. /.test(line)) {
      flushCalloutBuffer(i);
      elements.push(
        <li key={i} className="ml-4 list-decimal text-sm">{renderInline(line.replace(/^\d+\. /, ''), renderContext)}</li>
      );
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      flushCalloutBuffer(i);
      elements.push(<div key={i} className="h-3" />);
      continue;
    }

    // Tables
    if (line.startsWith('|')) {
      flushCalloutBuffer(i);
      const tableLines: string[] = [line];
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith('|')) {
        tableLines.push(lines[j]);
        j++;
      }
      if (tableLines.length >= 2) {
        elements.push(<MarkdownTable key={i} lines={tableLines} context={renderContext} />);
        i = j - 1;
      }
      continue;
    }

    // Block-level callouts
    const blockCallout = detectCalloutType(line.trim());
    if (blockCallout && !line.startsWith('-') && !line.startsWith('*')) {
      flushCalloutBuffer(i);
      const config = CALLOUT_CONFIG[blockCallout.type];
      elements.push(
        <div key={i} className={cn('my-4 border-l-4 p-4 rounded-r-sm', config.bgColor, config.borderColor)}>
          <div className={cn('flex items-center gap-2 font-semibold text-sm', config.textColor)}>
            {config.icon}
            <span>{renderInline(blockCallout.cleanText, renderContext)}</span>
          </div>
        </div>
      );
      continue;
    }

    // Regular paragraphs
    flushCalloutBuffer(i);
    elements.push(
      <p key={i} className="text-sm leading-relaxed">{renderInline(line, renderContext)}</p>
    );
  }

  flushCalloutBuffer(lines.length);
  return <div className="space-y-1">{elements}</div>;
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CODE BLOCK WITH SYNTAX HIGHLIGHTING
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface CodeBlockProps {
  code: string;
  language: Language;
}

function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const win31Theme = {
    ...themes.vsDark,
    plain: { color: '#00ff00', backgroundColor: '#000000' },
    styles: [
      ...themes.vsDark.styles,
      { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#6A9955' } },
      { types: ['keyword', 'tag', 'operator'], style: { color: '#569CD6' } },
      { types: ['string', 'attr-value'], style: { color: '#CE9178' } },
      { types: ['number', 'boolean'], style: { color: '#B5CEA8' } },
      { types: ['function', 'class-name'], style: { color: '#DCDCAA' } },
      { types: ['property', 'attr-name'], style: { color: '#9CDCFE' } },
      { types: ['punctuation'], style: { color: '#D4D4D4' } },
    ],
  };

  const langColors: Record<string, string> = {
    typescript: 'bg-blue-600', javascript: 'bg-yellow-500', json: 'bg-slate-600',
    yaml: 'bg-red-600', graphql: 'bg-pink-600', bash: 'bg-green-700',
    python: 'bg-blue-400', sql: 'bg-orange-500', css: 'bg-purple-500',
  };

  return (
    <div className="my-4 overflow-hidden rounded-sm border-2 border-win31-black">
      <div className="flex items-center gap-2 bg-win31-gray-darker px-3 py-1.5">
        {language && language !== 'text' && (
          <span className={cn('rounded px-2 py-0.5 text-xs font-medium uppercase text-white', langColors[language] || 'bg-slate-600')}>
            {language}
          </span>
        )}
        <div className="flex-1" />
        <button onClick={handleCopy} className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-win31-gray-light hover:bg-win31-gray hover:text-white">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <Highlight theme={win31Theme} code={code.trim()} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={cn('overflow-x-auto p-4 font-mono text-sm leading-relaxed', className)} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="table-row">
                <span className="table-cell select-none pr-4 text-right text-win31-gray-darker/50">{i + 1}</span>
                <span className="table-cell">{line.map((token, key) => <span key={key} {...getTokenProps({ token })} />)}</span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MARKDOWN TABLE
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface MarkdownTableProps {
  lines: string[];
  context?: InlineRenderContext;
}

function MarkdownTable({ lines, context }: MarkdownTableProps) {
  const parseRow = (line: string) => line.split('|').slice(1, -1).map(cell => cell.trim());
  const headers = parseRow(lines[0]);
  const rows = lines.slice(2).map(parseRow);

  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse border-2 border-win31-black text-sm">
        <thead>
          <tr className="bg-win31-gray">
            {headers.map((header, i) => (
              <th key={i} className="border border-win31-gray-darker px-3 py-2 text-left font-semibold text-win31-navy">
                {renderInline(header, context)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-win31-gray-light/50'}>
              {row.map((cell, j) => (
                <td key={j} className="border border-win31-gray-darker px-3 py-2">{renderInline(cell, context)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * DESIGN TOKEN DETECTION & VISUALIZATION
 * ═══════════════════════════════════════════════════════════════════════════
 */

const COLOR_PATTERNS = {
  hex: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
  rgb: /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([0-9.]+))?\s*\)$/,
  hsl: /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*(?:,\s*([0-9.]+))?\s*\)$/,
  oklch: /^oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)\s*(?:\/\s*([0-9.]+%?))?\s*\)$/i,
};

const SIZE_PATTERN = /^(\d+(?:\.\d+)?)(px|rem|em|%|vw|vh|pt|ch)$/;
const FONT_WEIGHT_PATTERN = /^(100|200|300|400|500|600|700|800|900|thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/i;
const CSS_VAR_PATTERN = /^--[\w-]+$/;

type DesignTokenType = 'color' | 'size' | 'font-weight' | 'css-var' | 'font-family' | null;

function detectDesignToken(value: string): DesignTokenType {
  const trimmed = value.trim();
  if (COLOR_PATTERNS.hex.test(trimmed) || COLOR_PATTERNS.rgb.test(trimmed) || COLOR_PATTERNS.hsl.test(trimmed) || COLOR_PATTERNS.oklch.test(trimmed)) return 'color';
  if (FONT_WEIGHT_PATTERN.test(trimmed)) return 'font-weight';
  if (CSS_VAR_PATTERN.test(trimmed)) return 'css-var';
  if (/^["'].*["']$/.test(trimmed) || /^(sans-serif|serif|monospace|system-ui|Inter|Roboto|Arial|Helvetica)$/i.test(trimmed)) return 'font-family';
  if (SIZE_PATTERN.test(trimmed)) return 'size';
  return null;
}

function ColorSwatch({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1" title={value}>
      <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-win31-gray-darker shadow-sm" style={{ backgroundColor: value }} />
      <code className="rounded-sm bg-win31-gray-light px-1.5 py-0.5 font-mono text-xs text-win31-navy border border-win31-gray-darker">{value}</code>
    </span>
  );
}

function SizeVisualizer({ value }: { value: string }) {
  const match = value.match(SIZE_PATTERN);
  if (!match) return <code className="rounded-sm bg-win31-gray-light px-1.5 py-0.5 font-mono text-xs">{value}</code>;
  const [, num, unit] = match;
  let pxValue = parseFloat(num);
  if (unit === 'rem' || unit === 'em') pxValue = pxValue * 16;
  const visualSize = Math.min(Math.max(pxValue, 4), 48);

  return (
    <span className="inline-flex items-center gap-1.5">
      <code className="rounded-sm bg-win31-gray-light px-1.5 py-0.5 font-mono text-xs text-win31-navy border border-win31-gray-darker">{value}</code>
      <span className="inline-block h-2 bg-win31-navy rounded-sm" style={{ width: `${visualSize}px`, minWidth: '4px', maxWidth: '48px' }} title={`${value}${unit !== 'px' ? ` ≈ ${pxValue.toFixed(0)}px` : ''}`} />
    </span>
  );
}

function FontWeightVisualizer({ value }: { value: string }) {
  const weightMap: Record<string, number> = { thin: 100, extralight: 200, light: 300, normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 };
  const numericWeight = weightMap[value.toLowerCase()] || parseInt(value, 10) || 400;

  return (
    <span className="inline-flex items-center gap-1.5">
      <code className="rounded-sm bg-win31-gray-light px-1.5 py-0.5 font-mono text-xs text-win31-navy border border-win31-gray-darker">{value}</code>
      <span className="inline-block px-1.5 py-0.5 text-xs bg-win31-navy text-white rounded-sm" style={{ fontWeight: numericWeight }}>Aa</span>
    </span>
  );
}

function FontFamilyVisualizer({ value }: { value: string }) {
  const cleanValue = value.replace(/["']/g, '');
  return (
    <span className="inline-flex items-center gap-1.5">
      <code className="rounded-sm bg-win31-gray-light px-1.5 py-0.5 font-mono text-xs text-win31-navy border border-win31-gray-darker">{value}</code>
      <span className="inline-block px-1.5 py-0.5 text-xs bg-win31-gray border border-win31-gray-darker rounded-sm" style={{ fontFamily: cleanValue }}>Sample</span>
    </span>
  );
}

function CssVarVisualizer({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="rounded-sm bg-purple-100 px-1 py-0.5 text-xs text-purple-700 border border-purple-300">var</span>
      <code className="rounded-sm bg-win31-gray-light px-1.5 py-0.5 font-mono text-xs text-purple-700 border border-win31-gray-darker">{value}</code>
    </span>
  );
}

function renderDesignToken(value: string, key: number): React.ReactNode {
  const tokenType = detectDesignToken(value);
  switch (tokenType) {
    case 'color': return <ColorSwatch key={key} value={value} />;
    case 'size': return <SizeVisualizer key={key} value={value} />;
    case 'font-weight': return <FontWeightVisualizer key={key} value={value} />;
    case 'font-family': return <FontFamilyVisualizer key={key} value={value} />;
    case 'css-var': return <CssVarVisualizer key={key} value={value} />;
    default: return <code key={key} className="rounded-sm bg-win31-gray-light px-1.5 py-0.5 font-mono text-xs text-win31-navy border border-win31-gray-darker">{value}</code>;
  }
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SKILL & REFERENCE DETECTION PATTERNS
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Common skill ID pattern: kebab-case identifiers
const SKILL_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/;

/* Reference file patterns - for future use with full reference parsing
const REFERENCE_PATTERNS = [
  /`\.?\/references\/([^`]+)`/g,   // `./references/file.md` or `/references/file.md`
  /`references\/([^`]+)`/g,         // `references/file.md`
  /→\s*See\s+`([^`]+)`/g,           // → See `filename.md`
];
*/

// Check if a code string looks like a skill ID
function isLikelySkillId(value: string): boolean {
  return SKILL_ID_PATTERN.test(value) && value.length > 5 && value.length < 50;
}

// Check if a code string looks like a reference path
function isLikelyReference(value: string): boolean {
  return value.includes('references/') || 
         value.endsWith('.md') || 
         value.endsWith('.yaml') || 
         value.endsWith('.yml') ||
         value.endsWith('.graphql') ||
         value.endsWith('.proto') ||
         value.endsWith('.ts') ||
         value.endsWith('.json');
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * INLINE RENDERING WITH SKILL/REFERENCE DETECTION
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Navigation context for skill/reference clicks
interface InlineRenderContext {
  onSkillClick?: (skillId: string) => void;
  onReferenceClick?: (refPath: string) => void;
}

function renderInline(text: string, context?: InlineRenderContext): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) parts.push(remaining.slice(0, boldMatch.index));
      parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }

    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) parts.push(remaining.slice(0, italicMatch.index));
      parts.push(<em key={key++}>{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
      continue;
    }

    const codeMatch = remaining.match(/`([^`]+)`/);
    if (codeMatch && codeMatch.index !== undefined) {
      if (codeMatch.index > 0) parts.push(remaining.slice(0, codeMatch.index));
      
      const codeValue = codeMatch[1];
      
      // Check if this looks like a reference path
      if (isLikelyReference(codeValue)) {
        const refName = codeValue.replace(/^\.?\/references\//, '').replace(/^references\//, '');
        parts.push(
          <button
            key={key++}
            onClick={() => context?.onReferenceClick?.(refName)}
            className="reference-link"
            title={`Open ${refName}`}
          >
            {refName}
          </button>
        );
      }
      // Check if this looks like a skill ID
      else if (isLikelySkillId(codeValue)) {
        parts.push(
          <button
            key={key++}
            onClick={() => context?.onSkillClick?.(codeValue)}
            className="skill-link"
            title={`View ${codeValue} skill`}
          >
            {codeValue}
          </button>
        );
      }
      // Default: render as design token or plain code
      else {
        parts.push(renderDesignToken(codeValue, key++));
      }
      
      remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
      continue;
    }

    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch && linkMatch.index !== undefined) {
      if (linkMatch.index > 0) parts.push(remaining.slice(0, linkMatch.index));
      const isExternal = linkMatch[2].startsWith('http');
      parts.push(
        <a key={key++} href={linkMatch[2]} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined} className="text-win31-navy underline hover:text-win31-blue">
          {linkMatch[1]}
          {isExternal && <ExternalLink className="ml-0.5 inline h-3 w-3" />}
        </a>
      );
      remaining = remaining.slice(linkMatch.index + linkMatch[0].length);
      continue;
    }

    // Check for arrow references like "→ skill-name" or "use skill-name"
    const arrowRefMatch = remaining.match(/→\s*`?([a-z][a-z0-9-]+)`?|use\s+`?([a-z][a-z0-9-]+)`?/);
    if (arrowRefMatch && arrowRefMatch.index !== undefined) {
      const skillId = arrowRefMatch[1] || arrowRefMatch[2];
      if (isLikelySkillId(skillId)) {
        if (arrowRefMatch.index > 0) parts.push(remaining.slice(0, arrowRefMatch.index));
        parts.push(
          <span key={key++}>
            {arrowRefMatch[0].startsWith('→') ? '→ ' : 'use '}
            <button
              onClick={() => context?.onSkillClick?.(skillId)}
              className="skill-link"
              title={`View ${skillId} skill`}
            >
              {skillId}
            </button>
          </span>
        );
        remaining = remaining.slice(arrowRefMatch.index + arrowRefMatch[0].length);
        continue;
      }
    }

    parts.push(remaining);
    break;
  }

  return parts;
}
