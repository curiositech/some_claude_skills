export type ArtifactType = 'single-skill' | 'multi-skill' | 'comparison';
export type ArtifactCategory = 'design' | 'development' | 'ai-ml' | 'research' | 'writing' | 'meta' | 'lifestyle' | 'relationships' | 'recovery';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface SkillInvolvement {
  name: string;
  role: string;
  activatedAt?: number;
}

export interface Phase {
  name: string;
  skills: string[];
  duration?: string;
  outcome: string;
}

export interface Metric {
  label: string;
  value: string;
}

export interface Outcome {
  summary: string;
  metrics?: Metric[];
  learned?: string[];
}

export interface ArtifactFiles {
  transcript?: string;
  before?: string[];
  after?: string[];
  assets?: string[];
}

export interface Screenshot {
  src: string;
  alt: string;
  caption?: string;
}

export interface AlbumArt {
  src: string;
  title: string;
  artist: string;
  style: string;
}

export interface Artifact {
  id: string;
  title: string;
  description: string;
  type: ArtifactType;
  skills: SkillInvolvement[];
  category: ArtifactCategory;
  tags?: string[];
  difficulty?: Difficulty;
  phases?: Phase[];
  outcome: Outcome;
  files: ArtifactFiles;
  heroImage?: string;  // Path to hero image (e.g., '/img/artifacts/skill-coach-hero.png')
  screenshots?: Screenshot[]; // Additional screenshots with captions
  albumArt?: AlbumArt[]; // AI-generated album art for music-related artifacts
  createdAt: string;
  featured?: boolean;
  viewCount?: number;
  interactiveDemo?: string; // Component identifier for interactive demos (e.g., 'vaporwave-midi-player')
  narrative?: string[]; // Array of narrative paragraphs for "What Happened Here" section
}

export interface ArtifactCardProps {
  artifact: Artifact;
  onClick?: () => void;
}

export interface ArtifactViewerProps {
  artifact: Artifact;
  basePath: string; // Base path to artifact directory
}
