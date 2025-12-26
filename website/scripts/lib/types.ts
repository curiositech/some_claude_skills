/**
 * Skill Management System - Type Definitions
 */

// =============================================================================
// SKILL FRONTMATTER (from SKILL.md files)
// =============================================================================

export interface SkillFrontmatter {
  // Required fields
  name: string;
  description: string;
  'allowed-tools': string;

  // Optional fields
  title?: string;
  category?: string;
  tags?: string[];
  badge?: SkillBadge;
  'pairs-with'?: SkillPairing[];  // Skill synergy recommendations

  // Auto-generated (from git/file metadata)
  version?: string;
  lastUpdated?: string;
}

export interface SkillPairing {
  skill: string;        // skill ID
  reason: string;       // Why they pair well together
}

export type SkillBadge = 'NEW' | 'HOT' | 'ADVANCED' | 'EXPERIMENTAL';

// =============================================================================
// PARSED SKILL (full skill data after processing)
// =============================================================================

export interface ParsedSkill {
  // Identity
  id: string;                    // kebab-case, from folder name
  name: string;                  // from frontmatter
  title: string;                 // Human readable

  // Content
  description: string;           // Full description
  shortDescription: string;      // Truncated for cards (max 200 chars)
  content: string;               // Full markdown content (without frontmatter)

  // Classification
  category: string;
  tags: string[];
  badge?: SkillBadge;
  pairsWith: SkillPairing[];  // Skill synergy recommendations

  // Tools
  allowedTools: string[];

  // Paths
  sourcePath: string;            // Path to SKILL.md
  docPath: string;               // Website doc path
  urlPath: string;               // URL path on website

  // Metadata
  source: SkillSource;
  lastUpdated?: string;

  // References (subfolders)
  references: SkillReference[];
  scripts: SkillScript[];
}

export type SkillSource =
  | { type: 'local'; path: string }
  | { type: 'remote'; repo: string; branch: string; path: string }
  | { type: 'submission'; issueNumber: number };

export interface SkillReference {
  name: string;
  path: string;
  title: string;
}

export interface SkillScript {
  name: string;
  path: string;
  description?: string;
}

// =============================================================================
// REMOTE SKILL SOURCES (skill-sources.yaml)
// =============================================================================

export interface SkillSourcesConfig {
  version: number;
  sources: RemoteSkillSource[];
}

export interface RemoteSkillSource {
  repo: string;                  // e.g., "github.com/org/repo"
  branch?: string;               // default: "main"
  path?: string;                 // default: ".claude/skills/"
  include: string | string[];    // "*" for all, or specific skill names/patterns
  exclude?: string[];            // Skills to exclude
  trusted?: boolean;             // If true, skip some validation
}

// =============================================================================
// SKILL SUBMISSIONS (from GitHub Issues)
// =============================================================================

export interface SkillSubmission {
  // Issue metadata
  issueNumber: number;
  issueUrl: string;

  // Submission content
  name: string;
  title: string;
  description: string;
  category: string;

  // Optional details
  useCases?: string[];
  suggestedTools?: string[];
  references?: string[];

  // Submitter info
  submittedBy: string;
  submittedAt: string;

  // Status
  status: SubmissionStatus;
  statusUpdatedAt?: string;
  statusUpdatedBy?: string;

  // Processing
  implementedSkillId?: string;   // If implemented, the skill ID
}

export type SubmissionStatus =
  | 'pending'      // Awaiting review
  | 'approved'     // Ready to implement
  | 'rejected'     // Not accepted
  | 'implemented'  // Converted to skill
  | 'duplicate';   // Already exists

// =============================================================================
// CATEGORIES
// =============================================================================

export interface CategoryDefinition {
  icon: string;
  description: string;
  color?: string;
}

export const SKILL_CATEGORIES: Record<string, CategoryDefinition> = {
  'AI & Machine Learning': {
    icon: '🤖',
    description: 'Skills for AI/ML development, prompting, and model integration',
  },
  'Code Quality & Testing': {
    icon: '✅',
    description: 'Testing, code review, refactoring, and quality assurance',
  },
  'Content & Writing': {
    icon: '✍️',
    description: 'Documentation, copywriting, and content creation',
  },
  'Data & Analytics': {
    icon: '📊',
    description: 'Data processing, visualization, and analysis',
  },
  'Design & Creative': {
    icon: '🎨',
    description: 'UI/UX design, graphics, and creative work',
  },
  'DevOps & Site Reliability': {
    icon: '⚙️',
    description: 'Infrastructure, deployment, and reliability engineering',
  },
  'Business & Monetization': {
    icon: '💰',
    description: 'Marketing, strategy, and business development',
  },
  'Research & Analysis': {
    icon: '🔬',
    description: 'Research, competitive analysis, and investigation',
  },
  'Productivity & Meta': {
    icon: '🚀',
    description: 'Workflow optimization and Claude-specific skills',
  },
  'Lifestyle & Personal': {
    icon: '🏠',
    description: 'Personal development, wellness, and life skills',
  },
};

// =============================================================================
// GENERATION OPTIONS
// =============================================================================

export interface GenerationOptions {
  // Paths
  skillsSourceDir: string;       // Default: ../../.claude/skills
  skillsOutputFile: string;      // Default: ../src/data/skills.ts
  docsOutputDir: string;         // Default: ../docs/skills
  skillSourcesFile?: string;     // Default: ../skill-sources.yaml

  // Behavior
  validateOnly?: boolean;        // Don't write files, just validate
  verbose?: boolean;             // Extra logging
  watch?: boolean;               // Watch for changes
  includeRemote?: boolean;       // Fetch remote skills

  // Filtering
  categories?: string[];         // Only process these categories
  skipSkills?: string[];         // Skip these skill IDs
}

export interface GenerationResult {
  success: boolean;
  skills: ParsedSkill[];
  errors: GenerationError[];
  warnings: GenerationWarning[];
  stats: GenerationStats;
}

export interface GenerationError {
  skillId?: string;
  file?: string;
  message: string;
  details?: string;
}

export interface GenerationWarning {
  skillId?: string;
  file?: string;
  message: string;
  suggestion?: string;
}

export interface GenerationStats {
  totalSkills: number;
  localSkills: number;
  remoteSkills: number;
  submissionSkills: number;
  categoryCounts: Record<string, number>;
  generatedDocs: number;
  skippedSkills: number;
  processingTimeMs: number;
}

// =============================================================================
// VALIDATION
// =============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}
