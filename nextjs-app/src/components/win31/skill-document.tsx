'use client';

import * as React from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  FileText,
  Book,
  Link2,
  ChevronRight,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { type Skill, type SkillReference, categoryMeta } from '@/lib/skills';
import { Button } from '@/components/ui/button';
import { Window, WindowContent, WindowStatusBar } from './window';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SKILL DOCUMENT VIEWER
 * Full-page document view for skills - like opening a file in Notepad
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface SkillDocumentProps {
  skill: Skill;
  onClose: () => void;
  onNavigate?: (skillId: string) => void;
}

export function SkillDocument({ skill, onClose, onNavigate }: SkillDocumentProps) {
  const [copied, setCopied] = React.useState(false);
  const category = categoryMeta[skill.category];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(skill.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Window
      title={`${skill.title}.md`}
      icon={<FileText className="h-4 w-4" />}
      onClose={onClose}
      className="mx-auto h-[calc(100dvh-60px)] max-w-4xl animate-fade-in"
      mobile
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-win31-gray-darker bg-win31-gray px-2 py-1">
        <span className="text-xs text-win31-gray-darker">Category:</span>
        <span className="flex items-center gap-1 rounded bg-win31-gray-light px-2 py-0.5 text-xs">
          {category.icon} {category.label}
        </span>
        <span className="mx-2 h-4 w-px bg-win31-gray-darker" />
        <span className="text-xs text-win31-gray-darker">Difficulty:</span>
        <DifficultyBadge difficulty={skill.difficulty} />
        <div className="flex-1" />
        <Button variant="ghost" size="icon-sm" onClick={handleCopy} title="Copy install command">
          {copied ? <Check className="h-4 w-4 text-win31-green" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Document content */}
        <div className="flex-1 overflow-auto">
          <WindowContent className="pb-8">
            {/* Header */}
            <div className="mb-6 border-b border-win31-gray-darker pb-4">
              <div className="mb-2 flex items-center gap-3">
                <span className="text-3xl">{skill.icon}</span>
                <div>
                  <h1 className="text-xl font-semibold text-win31-navy">{skill.title}</h1>
                  <p className="text-sm text-win31-gray-darker">{skill.description}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {skill.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm bg-win31-gray-light px-2 py-0.5 text-xs text-win31-gray-darker"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Install command */}
              <div className="mt-4 flex items-center gap-2">
                <code className="flex-1 rounded-none border border-win31-gray-darker bg-win31-black px-3 py-2 font-mono text-sm text-win31-lime">
                  {skill.installCommand}
                </code>
                <Button variant="primary" size="sm" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            {/* Rendered markdown content */}
            <div className="prose-win31">
              <MarkdownContent content={skill.content} />
            </div>
          </WindowContent>
        </div>

        {/* References sidebar - prominent on desktop, collapsible on mobile */}
        {skill.references && skill.references.length > 0 && (
          <ReferencesSidebar
            references={skill.references}
            onNavigate={onNavigate}
          />
        )}
      </div>

      {/* Status bar */}
      <WindowStatusBar>
        <span className="flex-1">{skill.content.split('\n').length} lines</span>
        <span>Skill v1.0</span>
      </WindowStatusBar>
    </Window>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * REFERENCES SIDEBAR
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface ReferencesSidebarProps {
  references: SkillReference[];
  onNavigate?: (skillId: string) => void;
}

function ReferencesSidebar({ references, onNavigate }: ReferencesSidebarProps) {
  const [expanded, setExpanded] = React.useState(true);

  const grouped = React.useMemo(() => {
    const groups: Record<string, SkillReference[]> = {};
    for (const ref of references) {
      if (!groups[ref.type]) groups[ref.type] = [];
      groups[ref.type].push(ref);
    }
    return groups;
  }, [references]);

  const typeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    guide: { label: 'Guides', icon: <Book className="h-3 w-3" /> },
    example: { label: 'Examples', icon: <FileText className="h-3 w-3" /> },
    'related-skill': { label: 'Related Skills', icon: <Link2 className="h-3 w-3" /> },
    external: { label: 'External', icon: <ExternalLink className="h-3 w-3" /> },
  };

  return (
    <aside
      className={cn(
        'flex-shrink-0 border-l border-win31-gray-darker bg-win31-gray-light',
        'transition-all duration-200',
        expanded ? 'w-64' : 'w-10'
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex h-8 w-full items-center gap-2 border-b border-win31-gray-darker px-2 text-xs font-semibold hover:bg-win31-gray"
      >
        <ChevronRight
          className={cn(
            'h-3 w-3 transition-transform',
            expanded && 'rotate-180'
          )}
        />
        {expanded && <span>References</span>}
      </button>

      {expanded && (
        <div className="overflow-auto p-2">
          {Object.entries(grouped).map(([type, refs]) => (
            <div key={type} className="mb-4">
              <div className="mb-2 flex items-center gap-1 text-xs font-semibold text-win31-gray-darker">
                {typeLabels[type]?.icon}
                <span>{typeLabels[type]?.label || type}</span>
              </div>
              <div className="space-y-1">
                {refs.map((ref, i) => (
                  <ReferenceLink
                    key={i}
                    reference={ref}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

interface ReferenceLinkProps {
  reference: SkillReference;
  onNavigate?: (skillId: string) => void;
}

function ReferenceLink({ reference, onNavigate }: ReferenceLinkProps) {
  const isInternal = reference.url.startsWith('/');
  const isSkill = reference.type === 'related-skill';

  const handleClick = () => {
    if (isSkill && onNavigate) {
      // Extract skill ID from URL like /skills/typescript-developer
      const skillId = reference.url.split('/').pop();
      if (skillId) onNavigate(skillId);
    } else if (!isInternal) {
      window.open(reference.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex w-full items-start gap-2 rounded-sm p-2 text-left text-xs',
        'hover:bg-win31-navy hover:text-white',
        'transition-colors'
      )}
    >
      <span className="flex-1">
        <span className="block font-medium">{reference.title}</span>
        {reference.description && (
          <span className="block text-win31-gray-darker group-hover:text-win31-gray-light">
            {reference.description}
          </span>
        )}
      </span>
      {!isInternal && <ExternalLink className="mt-0.5 h-3 w-3 flex-shrink-0" />}
    </button>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ENHANCED MARKDOWN RENDERER
 * With syntax highlighting and special callout styling
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Highlight, themes, type Language } from 'prism-react-renderer';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Lightbulb,
  Zap,
} from 'lucide-react';

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
    patterns: [
      /^✅\s*/,
      /^DO:\s*/i,
      /^ALWAYS:\s*/i,
      /^\[x\]\s*/i,
      /^SHOULD:\s*/i,
      /^MUST:\s*/i,
      /^PREFER:\s*/i,
    ],
    icon: <CheckCircle2 className="h-4 w-4" />,
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-l-emerald-500',
    textColor: 'text-emerald-700',
    label: 'DO',
  },
  dont: {
    patterns: [
      /^❌\s*/,
      /^DON'?T:\s*/i,
      /^NEVER:\s*/i,
      /^AVOID:\s*/i,
      /^\[ \]\s*/i,
      /^SHOULDN'?T:\s*/i,
      /^MUST NOT:\s*/i,
      /^NOT:\s*/i,
    ],
    icon: <XCircle className="h-4 w-4" />,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-l-red-500',
    textColor: 'text-red-700',
    label: "DON'T",
  },
  important: {
    patterns: [
      /^⚠️\s*/,
      /^IMPORTANT:\s*/i,
      /^CRITICAL:\s*/i,
      /^REQUIRED:\s*/i,
      /^CRUCIAL:\s*/i,
    ],
    icon: <AlertTriangle className="h-4 w-4" />,
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-l-amber-500',
    textColor: 'text-amber-700',
    label: 'IMPORTANT',
  },
  warning: {
    patterns: [
      /^⚡\s*/,
      /^WARNING:\s*/i,
      /^CAUTION:\s*/i,
      /^WATCH OUT:\s*/i,
    ],
    icon: <Zap className="h-4 w-4" />,
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-l-orange-500',
    textColor: 'text-orange-700',
    label: 'WARNING',
  },
  tip: {
    patterns: [
      /^💡\s*/,
      /^TIP:\s*/i,
      /^HINT:\s*/i,
      /^PRO TIP:\s*/i,
      /^BEST PRACTICE:\s*/i,
    ],
    icon: <Lightbulb className="h-4 w-4" />,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-l-blue-500',
    textColor: 'text-blue-700',
    label: 'TIP',
  },
  note: {
    patterns: [
      /^ℹ️\s*/,
      /^NOTE:\s*/i,
      /^INFO:\s*/i,
      /^FYI:\s*/i,
    ],
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
        return {
          type: type as CalloutType,
          cleanText: text.replace(pattern, '').trim(),
        };
      }
    }
  }
  return null;
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';
  let calloutBuffer: { type: CalloutType; items: string[] } | null = null;

  const flushCalloutBuffer = (key: number) => {
    if (calloutBuffer && calloutBuffer.items.length > 0) {
      const config = CALLOUT_CONFIG[calloutBuffer.type];
      elements.push(
        <div
          key={`callout-${key}`}
          className={cn(
            'my-4 border-l-4 p-4',
            config.bgColor,
            config.borderColor
          )}
        >
          <div className={cn('mb-2 flex items-center gap-2 font-semibold text-sm', config.textColor)}>
            {config.icon}
            <span>{config.label}</span>
          </div>
          <ul className="space-y-1 pl-6">
            {calloutBuffer.items.map((item, i) => (
              <li key={i} className="list-disc text-sm">
                {renderInline(item)}
              </li>
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
          <CodeBlock
            key={i}
            code={codeBlockContent.join('\n')}
            language={language as Language}
            filename={codeBlockLang ? `code.${langKey}` : undefined}
          />
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

    // Headers
    if (line.startsWith('# ')) {
      flushCalloutBuffer(i);
      elements.push(
        <h1 key={i} className="mb-4 mt-6 text-xl font-bold text-win31-navy first:mt-0">
          {line.slice(2)}
        </h1>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      flushCalloutBuffer(i);
      elements.push(
        <h2 key={i} className="mb-3 mt-6 text-lg font-semibold text-win31-navy">
          {line.slice(3)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      flushCalloutBuffer(i);
      elements.push(
        <h3 key={i} className="mb-2 mt-4 text-base font-semibold text-win31-gray-darker">
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
        // Start or continue a callout buffer
        if (calloutBuffer && calloutBuffer.type === callout.type) {
          calloutBuffer.items.push(callout.cleanText);
        } else {
          flushCalloutBuffer(i);
          calloutBuffer = { type: callout.type, items: [callout.cleanText] };
        }
      } else {
        flushCalloutBuffer(i);
        elements.push(
          <li key={i} className="ml-4 list-disc text-sm">
            {renderInline(itemText)}
          </li>
        );
      }
      continue;
    }
    if (/^\d+\. /.test(line)) {
      flushCalloutBuffer(i);
      elements.push(
        <li key={i} className="ml-4 list-decimal text-sm">
          {renderInline(line.replace(/^\d+\. /, ''))}
        </li>
      );
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      flushCalloutBuffer(i);
      elements.push(<div key={i} className="h-3" />);
      continue;
    }

    // Tables (enhanced)
    if (line.startsWith('|')) {
      flushCalloutBuffer(i);
      // Collect all table lines
      const tableLines: string[] = [line];
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith('|')) {
        tableLines.push(lines[j]);
        j++;
      }
      
      if (tableLines.length >= 2) {
        elements.push(<MarkdownTable key={i} lines={tableLines} />);
        // Skip processed lines (but the for loop will increment i by 1)
        i = j - 1;
      } else {
        elements.push(
          <div key={i} className="overflow-x-auto text-xs font-mono">
            {line}
          </div>
        );
      }
      continue;
    }

    // Block-level callouts (standalone paragraphs starting with callout patterns)
    const blockCallout = detectCalloutType(line.trim());
    if (blockCallout && !line.startsWith('-') && !line.startsWith('*')) {
      flushCalloutBuffer(i);
      const config = CALLOUT_CONFIG[blockCallout.type];
      elements.push(
        <div
          key={i}
          className={cn(
            'my-4 border-l-4 p-4',
            config.bgColor,
            config.borderColor
          )}
        >
          <div className={cn('flex items-center gap-2 font-semibold text-sm', config.textColor)}>
            {config.icon}
            <span>{renderInline(blockCallout.cleanText)}</span>
          </div>
        </div>
      );
      continue;
    }

    // Regular paragraphs
    flushCalloutBuffer(i);
    elements.push(
      <p key={i} className="text-sm leading-relaxed">
        {renderInline(line)}
      </p>
    );
  }

  // Flush any remaining callout buffer
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
  filename?: string;
}

function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Custom Win31-themed syntax highlighting
  const win31Theme = {
    ...themes.vsDark,
    plain: {
      color: '#00ff00', // Win31 lime green
      backgroundColor: '#000000',
    },
    styles: [
      ...themes.vsDark.styles,
      {
        types: ['comment', 'prolog', 'doctype', 'cdata'],
        style: { color: '#6A9955' }, // Green comments
      },
      {
        types: ['keyword', 'tag', 'operator'],
        style: { color: '#569CD6' }, // Blue keywords
      },
      {
        types: ['string', 'attr-value'],
        style: { color: '#CE9178' }, // Orange strings
      },
      {
        types: ['number', 'boolean'],
        style: { color: '#B5CEA8' }, // Light green numbers
      },
      {
        types: ['function', 'class-name'],
        style: { color: '#DCDCAA' }, // Yellow functions
      },
      {
        types: ['property', 'attr-name'],
        style: { color: '#9CDCFE' }, // Light blue properties
      },
      {
        types: ['punctuation'],
        style: { color: '#D4D4D4' }, // Gray punctuation
      },
    ],
  };

  // Language badge colors
  const langColors: Record<string, string> = {
    typescript: 'bg-blue-600',
    javascript: 'bg-yellow-500',
    json: 'bg-slate-600',
    yaml: 'bg-red-600',
    graphql: 'bg-pink-600',
    bash: 'bg-green-700',
    python: 'bg-blue-400',
    sql: 'bg-orange-500',
    css: 'bg-purple-500',
    html: 'bg-orange-600',
    rust: 'bg-orange-700',
    go: 'bg-cyan-500',
    swift: 'bg-orange-400',
  };

  return (
    <div className="my-4 overflow-hidden border border-win31-gray-darker">
      {/* Title bar */}
      <div className="flex items-center gap-2 bg-win31-gray-darker px-3 py-1.5">
        {language && language !== 'text' && (
          <span
            className={cn(
              'rounded px-2 py-0.5 text-xs font-medium uppercase text-white',
              langColors[language] || 'bg-slate-600'
            )}
          >
            {language}
          </span>
        )}
        {filename && (
          <span className="text-xs text-win31-gray-light">{filename}</span>
        )}
        <div className="flex-1" />
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-win31-gray-light hover:bg-win31-gray hover:text-white"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Code content */}
      <Highlight theme={win31Theme} code={code.trim()} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cn(
              'overflow-x-auto p-4 font-mono text-sm leading-relaxed',
              className
            )}
            style={style}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="table-row">
                <span className="table-cell select-none pr-4 text-right text-win31-gray-darker/50">
                  {i + 1}
                </span>
                <span className="table-cell">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
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

function MarkdownTable({ lines }: { lines: string[] }) {
  const parseRow = (line: string) => {
    return line
      .split('|')
      .slice(1, -1)
      .map(cell => cell.trim());
  };

  const headers = parseRow(lines[0]);
  // Skip the separator line (index 1)
  const rows = lines.slice(2).map(parseRow);

  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse border border-win31-gray-darker text-sm">
        <thead>
          <tr className="bg-win31-gray">
            {headers.map((header, i) => (
              <th
                key={i}
                className="border border-win31-gray-darker px-3 py-2 text-left font-semibold text-win31-navy"
              >
                {renderInline(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-win31-gray-light/50'}>
              {row.map((cell, j) => (
                <td key={j} className="border border-win31-gray-darker px-3 py-2">
                  {renderInline(cell)}
                </td>
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

// Color patterns
const COLOR_PATTERNS = {
  hex: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
  rgb: /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([0-9.]+))?\s*\)$/,
  hsl: /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*(?:,\s*([0-9.]+))?\s*\)$/,
  oklch: /^oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)\s*(?:\/\s*([0-9.]+%?))?\s*\)$/i,
};

// Size patterns
const SIZE_PATTERN = /^(\d+(?:\.\d+)?)(px|rem|em|%|vw|vh|pt|ch)$/;

// Font weight patterns
const FONT_WEIGHT_PATTERN = /^(100|200|300|400|500|600|700|800|900|thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/i;

// CSS variable pattern
const CSS_VAR_PATTERN = /^--[\w-]+$/;

type DesignTokenType = 'color' | 'size' | 'font-weight' | 'border-radius' | 'css-var' | 'font-family' | null;

function detectDesignToken(value: string): DesignTokenType {
  const trimmed = value.trim();
  
  // Check for colors
  if (COLOR_PATTERNS.hex.test(trimmed)) return 'color';
  if (COLOR_PATTERNS.rgb.test(trimmed)) return 'color';
  if (COLOR_PATTERNS.hsl.test(trimmed)) return 'color';
  if (COLOR_PATTERNS.oklch.test(trimmed)) return 'color';
  
  // Check for font weights
  if (FONT_WEIGHT_PATTERN.test(trimmed)) return 'font-weight';
  
  // Check for CSS variables
  if (CSS_VAR_PATTERN.test(trimmed)) return 'css-var';
  
  // Check for font families (quoted or common names)
  if (/^["'].*["']$/.test(trimmed) || /^(sans-serif|serif|monospace|system-ui|Inter|Roboto|Arial|Helvetica)$/i.test(trimmed)) {
    return 'font-family';
  }
  
  // Check for sizes (must be last as it's more generic)
  if (SIZE_PATTERN.test(trimmed)) {
    // Distinguish border-radius context from general size
    return 'size';
  }
  
  return null;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
    hex.length === 4 ? hex.replace(/([a-f\d])/gi, '$1$1') : hex
  );
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

interface ColorSwatchProps {
  value: string;
  showFormats?: boolean;
}

function ColorSwatch({ value, showFormats = true }: ColorSwatchProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [copied, setCopied] = React.useState<string | null>(null);

  // Normalize color for CSS
  const cssColor = value;
  
  // Try to parse hex for format conversion
  const isHex = COLOR_PATTERNS.hex.test(value);
  const rgb = isHex ? hexToRgb(value) : null;
  
  const formats: { label: string; value: string }[] = [
    { label: 'Original', value },
  ];
  
  if (rgb) {
    formats.push({ label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` });
    // Approximate OKLCH (simplified)
    const l = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
    formats.push({ label: 'OKLCH', value: `oklch(${(l * 100).toFixed(1)}% 0.1 0)` });
  }

  const handleCopy = async (format: string) => {
    await navigator.clipboard.writeText(format);
    setCopied(format);
    setTimeout(() => setCopied(null), 1500);
  };

  const contrastColor = isHex ? getContrastColor(value) : '#000';

  return (
    <span 
      className="relative inline-flex items-center gap-1"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Color swatch */}
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded border border-win31-gray-darker shadow-sm"
        style={{ backgroundColor: cssColor }}
        title={value}
      />
      {/* Color value */}
      <code className="rounded-sm bg-win31-gray-light px-1.5 py-0.5 font-mono text-xs text-win31-navy border border-win31-gray-darker">
        {value}
      </code>
      
      {/* Tooltip with formats */}
      {showTooltip && showFormats && (
        <span className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded border border-win31-gray-darker bg-white p-2 shadow-lg">
          <span className="mb-2 block text-xs font-semibold text-win31-navy">Color Formats</span>
          <span className="space-y-1">
            {formats.map(({ label, value: fmt }) => (
              <span 
                key={label} 
                className="flex items-center justify-between gap-2 text-xs cursor-pointer hover:bg-win31-gray-light rounded px-1"
                onClick={() => handleCopy(fmt)}
              >
                <span className="text-win31-gray-darker">{label}:</span>
                <span className="font-mono">{fmt}</span>
                {copied === fmt && <Check className="h-3 w-3 text-emerald-500" />}
              </span>
            ))}
          </span>
          {/* Large preview */}
          <span 
            className="mt-2 flex h-8 w-full items-center justify-center rounded border text-xs font-medium"
            style={{ backgroundColor: cssColor, color: contrastColor }}
          >
            Preview
          </span>
        </span>
      )}
    </span>
  );
}

interface SizeVisualizerProps {
  value: string;
  type?: 'size' | 'border-radius';
}

function SizeVisualizer({ value, type = 'size' }: SizeVisualizerProps) {
  const match = value.match(SIZE_PATTERN);
  if (!match) return <code className="rounded-sm bg-win31-gray-light px-1.5 py-0.5 font-mono text-xs">{value}</code>;
  
  const [, num, unit] = match;
  const numValue = parseFloat(num);
  
  // Convert to pixels for visualization (approximate)
  let pxValue = numValue;
  if (unit === 'rem') pxValue = numValue * 16;
  if (unit === 'em') pxValue = numValue * 16;
  
  // Cap visualization size
  const visualSize = Math.min(Math.max(pxValue, 4), 48);
  
  if (type === 'border-radius') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <code className="rounded-sm bg-win31-gray-light px-1.5 py-0.5 font-mono text-xs text-win31-navy border border-win31-gray-darker">
          {value}
        </code>
        <span 
          className="inline-block h-5 w-5 border-2 border-win31-navy bg-win31-gray-light"
          style={{ borderRadius: `${Math.min(visualSize, 10)}px` }}
          title={`Border radius: ${value}`}
        />
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1.5">
      <code className="rounded-sm bg-win31-gray-light px-1.5 py-0.5 font-mono text-xs text-win31-navy border border-win31-gray-darker">
        {value}
      </code>
      {/* Size bar */}
      <span 
        className="inline-block h-2 bg-win31-navy rounded-sm"
        style={{ width: `${visualSize}px`, minWidth: '4px', maxWidth: '48px' }}
        title={`${value}${unit !== 'px' ? ` ≈ ${pxValue.toFixed(0)}px` : ''}`}
      />
    </span>
  );
}

interface FontWeightVisualizerProps {
  value: string;
}

function FontWeightVisualizer({ value }: FontWeightVisualizerProps) {
  const weightMap: Record<string, number> = {
    thin: 100, extralight: 200, light: 300, normal: 400,
    medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900,
  };
  
  const numericWeight = weightMap[value.toLowerCase()] || parseInt(value, 10) || 400;
  
  return (
    <span className="inline-flex items-center gap-1.5">
      <code className="rounded-sm bg-win31-gray-light px-1.5 py-0.5 font-mono text-xs text-win31-navy border border-win31-gray-darker">
        {value}
      </code>
      <span 
        className="inline-block px-1.5 py-0.5 text-xs bg-win31-navy text-white rounded-sm"
        style={{ fontWeight: numericWeight }}
      >
        Aa
      </span>
    </span>
  );
}

interface FontFamilyVisualizerProps {
  value: string;
}

function FontFamilyVisualizer({ value }: FontFamilyVisualizerProps) {
  const cleanValue = value.replace(/["']/g, '');
  
  return (
    <span className="inline-flex items-center gap-1.5">
      <code className="rounded-sm bg-win31-gray-light px-1.5 py-0.5 font-mono text-xs text-win31-navy border border-win31-gray-darker">
        {value}
      </code>
      <span 
        className="inline-block px-1.5 py-0.5 text-xs bg-win31-gray border border-win31-gray-darker rounded-sm"
        style={{ fontFamily: cleanValue }}
      >
        The quick brown fox
      </span>
    </span>
  );
}

interface CssVarVisualizerProps {
  value: string;
}

function CssVarVisualizer({ value }: CssVarVisualizerProps) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="rounded-sm bg-purple-100 px-1 py-0.5 text-xs text-purple-700 border border-purple-300">
        var
      </span>
      <code className="rounded-sm bg-win31-gray-light px-1.5 py-0.5 font-mono text-xs text-purple-700 border border-win31-gray-darker">
        {value}
      </code>
    </span>
  );
}

function renderDesignToken(value: string, key: number): React.ReactNode {
  const tokenType = detectDesignToken(value);
  
  switch (tokenType) {
    case 'color':
      return <ColorSwatch key={key} value={value} />;
    case 'size':
      return <SizeVisualizer key={key} value={value} />;
    case 'border-radius':
      return <SizeVisualizer key={key} value={value} type="border-radius" />;
    case 'font-weight':
      return <FontWeightVisualizer key={key} value={value} />;
    case 'font-family':
      return <FontFamilyVisualizer key={key} value={value} />;
    case 'css-var':
      return <CssVarVisualizer key={key} value={value} />;
    default:
      return (
        <code
          key={key}
          className="rounded-sm bg-win31-gray-light px-1.5 py-0.5 font-mono text-xs text-win31-navy border border-win31-gray-darker"
        >
          {value}
        </code>
      );
  }
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * INLINE RENDERING
 * ═══════════════════════════════════════════════════════════════════════════
 */

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(remaining.slice(0, boldMatch.index));
      }
      parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }

    // Italic
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) {
        parts.push(remaining.slice(0, italicMatch.index));
      }
      parts.push(<em key={key++}>{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
      continue;
    }

    // Inline code - with design token detection
    const codeMatch = remaining.match(/`([^`]+)`/);
    if (codeMatch && codeMatch.index !== undefined) {
      if (codeMatch.index > 0) {
        parts.push(remaining.slice(0, codeMatch.index));
      }
      // Check if it's a design token
      parts.push(renderDesignToken(codeMatch[1], key++));
      remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
      continue;
    }

    // Links
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch && linkMatch.index !== undefined) {
      if (linkMatch.index > 0) {
        parts.push(remaining.slice(0, linkMatch.index));
      }
      const isExternal = linkMatch[2].startsWith('http');
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-win31-navy underline hover:text-win31-blue"
        >
          {linkMatch[1]}
          {isExternal && <ExternalLink className="ml-0.5 inline h-3 w-3" />}
        </a>
      );
      remaining = remaining.slice(linkMatch.index + linkMatch[0].length);
      continue;
    }

    // No more formatting
    parts.push(remaining);
    break;
  }

  return parts;
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * HELPER COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════
 */

function DifficultyBadge({ difficulty }: { difficulty: Skill['difficulty'] }) {
  const styles = {
    beginner: 'bg-win31-green/20 text-win31-green border-win31-green/40',
    intermediate: 'bg-win31-yellow/20 text-win31-gray-darker border-win31-yellow/40',
    advanced: 'bg-win31-red/20 text-win31-red border-win31-red/40',
  };

  return (
    <span
      className={cn(
        'rounded-sm border px-2 py-0.5 text-xs font-medium capitalize',
        styles[difficulty]
      )}
    >
      {difficulty}
    </span>
  );
}

