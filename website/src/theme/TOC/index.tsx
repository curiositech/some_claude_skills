import React, { useState, useEffect } from 'react';
import TOC from '@theme-original/TOC';
import type TOCType from '@theme/TOC';
import type { WrapperProps } from '@docusaurus/types';
import { useLocation } from '@docusaurus/router';
import type { FileNode } from '../../data/skillFolders/index';

type Props = WrapperProps<typeof TOCType>;

interface ReferenceInfo {
  name: string;
  path: string;
  title: string;
  description: string;
  lineCount: number;
  size: number;
  category: string; // 'references' | 'guides' | etc.
}

// Storage key prefix for visited references
const VISITED_KEY_PREFIX = 'skill-refs-visited-';

/**
 * Get visited references for a skill from localStorage
 */
function getVisitedRefs(skillName: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(VISITED_KEY_PREFIX + skillName);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (e) {
    console.error('Failed to load visited refs:', e);
  }
  return new Set();
}

/**
 * Mark a reference as visited in localStorage
 */
function markRefVisited(skillName: string, refPath: string): void {
  if (typeof window === 'undefined') return;
  try {
    const visited = getVisitedRefs(skillName);
    visited.add(refPath);
    localStorage.setItem(VISITED_KEY_PREFIX + skillName, JSON.stringify([...visited]));
  } catch (e) {
    console.error('Failed to save visited ref:', e);
  }
}

/**
 * Extract first meaningful sentence from markdown content
 */
function extractDescription(content: string): string {
  if (!content) return '';

  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n*/m, '');

  // Remove the first heading (title)
  const withoutTitle = withoutFrontmatter.replace(/^#[^\n]+\n*/m, '');

  // Find first paragraph that isn't a heading or code block
  const lines = withoutTitle.split('\n');
  let description = '';

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines, headings, code blocks, tables, lists
    if (!trimmed ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('```') ||
        trimmed.startsWith('|') ||
        trimmed.startsWith('-') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('>')) {
      continue;
    }
    // Found a paragraph line
    description = trimmed;
    break;
  }

  // Truncate to first sentence or 100 chars
  if (description.length > 100) {
    const sentenceEnd = description.indexOf('. ');
    if (sentenceEnd > 0 && sentenceEnd < 100) {
      return description.substring(0, sentenceEnd + 1);
    }
    return description.substring(0, 97) + '...';
  }

  return description;
}

/**
 * Extract title from markdown content (first H1)
 */
function extractTitle(content: string, filename: string): string {
  if (!content) return formatFilename(filename);

  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n*/m, '');

  // Find first heading
  const match = withoutFrontmatter.match(/^#\s+(.+)$/m);
  if (match) {
    return match[1].trim();
  }

  return formatFilename(filename);
}

/**
 * Convert filename to readable title
 */
function formatFilename(filename: string): string {
  return filename
    .replace(/\.md$/, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Count lines in content
 */
function countLines(content: string): number {
  if (!content) return 0;
  return content.split('\n').length;
}

/**
 * Process file nodes to extract reference info
 */
function extractReferences(children: FileNode[], parentCategory: string = ''): ReferenceInfo[] {
  const references: ReferenceInfo[] = [];

  for (const node of children) {
    if (node.type === 'folder') {
      // Process subfolders (references, guides, etc.)
      if (node.children) {
        const folderRefs = extractReferences(node.children, node.name);
        references.push(...folderRefs);
      }
    } else if (node.type === 'file' && node.name.endsWith('.md')) {
      // Skip SKILL.md, CHANGELOG.md, index.md, _category_.json
      if (node.name === 'SKILL.md' ||
          node.name === 'CHANGELOG.md' ||
          node.name === 'index.md' ||
          node.name.startsWith('_')) {
        continue;
      }

      // Determine category - root level files get special categories
      let category = parentCategory;
      if (!parentCategory) {
        // Root level files - categorize by name
        const lowerName = node.name.toLowerCase();
        if (lowerName === 'overview.md' || lowerName === 'readme.md') {
          category = 'overview';
        } else {
          category = 'other';
        }
      }

      references.push({
        name: node.name,
        path: node.path,
        title: extractTitle(node.content || '', node.name),
        description: extractDescription(node.content || ''),
        lineCount: countLines(node.content || ''),
        size: node.size || 0,
        category: category,
      });
    }
  }

  return references;
}

/**
 * Format line count with color indicator
 */
function getLineBadgeClass(lineCount: number): string {
  if (lineCount > 400) return 'skill-ref-badge-large';
  if (lineCount > 150) return 'skill-ref-badge-medium';
  return 'skill-ref-badge-small';
}

/**
 * SkillReferences component - Shows above TOC for skill pages and subpages
 */
function SkillReferences({
  skillName,
  currentPath
}: {
  skillName: string;
  currentPath: string;
}) {
  const [references, setReferences] = useState<ReferenceInfo[]>([]);
  const [visitedRefs, setVisitedRefs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert underscore to dash for URL paths and JSON filename
  const urlSkillName = skillName.replace(/_/g, '-');

  useEffect(() => {
    async function loadSkillData() {
      try {
        // Convert underscore to dash for JSON filename
        const jsonSkillName = skillName.replace(/_/g, '-');

        // Dynamic import of skill folder data
        const module = await import(`../../data/skillFolders/${jsonSkillName}.json`);
        const data: FileNode = module.default;

        if (data && data.children) {
          const refs = extractReferences(data.children);
          setReferences(refs);
        }

        // Load visited refs from localStorage
        setVisitedRefs(getVisitedRefs(skillName));

        setLoading(false);
      } catch (err) {
        console.error('Failed to load skill references:', err);
        setError('Could not load references');
        setLoading(false);
      }
    }

    loadSkillData();
  }, [skillName]);

  // Mark current page as visited when it changes
  useEffect(() => {
    if (currentPath && skillName) {
      markRefVisited(skillName, currentPath);
      setVisitedRefs(prev => new Set([...prev, currentPath]));
    }
  }, [currentPath, skillName]);

  if (loading || error || references.length === 0) {
    return null;
  }

  // Group references by category
  const grouped = references.reduce((acc, ref) => {
    const cat = ref.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ref);
    return acc;
  }, {} as Record<string, ReferenceInfo[]>);

  // Sort categories: overview first, then alphabetically, 'other' last
  const categoryOrder = (cat: string): number => {
    if (cat === 'overview') return 0;
    if (cat === 'other') return 999;
    return 1;
  };
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const orderDiff = categoryOrder(a) - categoryOrder(b);
    if (orderDiff !== 0) return orderDiff;
    return a.localeCompare(b);
  });

  // Check if we're on the main skill page or a subpage
  const isMainPage = currentPath === `/docs/skills/${skillName}` ||
                     currentPath === `/docs/skills/${skillName}/`;

  return (
    <div className="skill-references-toc">
      <div className="skill-references-header">
        <span className="skill-references-icon">📚</span>
        <span>Skill References</span>
        {!isMainPage && (
          <a
            href={`/docs/skills/${skillName}`}
            className="skill-references-back"
            title="Back to skill overview"
          >
            ← Overview
          </a>
        )}
      </div>
      <div className="skill-references-list">
        {sortedCategories.map((category) => (
          <div key={category} className="skill-references-category">
            {sortedCategories.length > 1 && (
              <div className="skill-references-category-label">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </div>
            )}
            {grouped[category].map((ref) => {
              // Build the doc URL - convert filename to doc path
              const docPath = ref.path
                .replace(/\.md$/, '')
                .replace(urlSkillName + '/', '');
              const href = `/docs/skills/${skillName}/${docPath}`;

              // Check if this is the current page
              const isCurrent = currentPath.includes(docPath.replace(/\//g, '/'));

              // Check if visited (but not current)
              const isVisited = visitedRefs.has(href) && !isCurrent;

              return (
                <a
                  key={ref.path}
                  href={href}
                  className={`skill-reference-item ${isCurrent ? 'skill-reference-current' : ''} ${isVisited ? 'skill-reference-visited' : ''} ${!isVisited && !isCurrent ? 'skill-reference-new' : ''}`}
                >
                  <div className="skill-reference-title">
                    {isCurrent && <span className="skill-reference-indicator">▶</span>}
                    {ref.title}
                    {!isVisited && !isCurrent && (
                      <span className="skill-reference-new-badge">NEW</span>
                    )}
                  </div>
                  <div className="skill-reference-meta">
                    <span className={`skill-ref-badge ${getLineBadgeClass(ref.lineCount)}`}>
                      {ref.lineCount} lines
                    </span>
                  </div>
                  {ref.description && (
                    <div className="skill-reference-desc">
                      {ref.description}
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TOCWrapper(props: Props): JSX.Element {
  const location = useLocation();

  // Check if we're on any skill page (main or subpage)
  // Match: /docs/skills/{skill-name} or /docs/skills/{skill-name}/...
  const skillMatch = location.pathname.match(/^\/docs\/skills\/([^/]+)/);
  const isSkillPage = !!skillMatch;
  const skillName = skillMatch ? skillMatch[1] : null;

  return (
    <div className="toc-wrapper-with-references">
      {isSkillPage && skillName && (
        <SkillReferences
          skillName={skillName}
          currentPath={location.pathname}
        />
      )}
      <TOC {...props} />
    </div>
  );
}
