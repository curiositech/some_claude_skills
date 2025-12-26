/**
 * Shared Skill type definition - Single Source of Truth
 * All components should import from here to avoid duplicate type definitions
 */
export type SkillBadge = 'NEW' | 'UPDATED';

export interface SkillPairing {
  skill: string;
  reason: string;
}

export interface Skill {
  id: string;
  title: string;
  category: string;
  description: string;
  path: string;
  tags?: string[];
  icon?: string;
  badge?: SkillBadge;
  pairsWith?: SkillPairing[];
}

/**
 * Category options for skill filtering (9-category system)
 */
export const SKILL_CATEGORIES = [
  'all',
  'Orchestration & Meta',
  'Visual Design & UI',
  'Graphics, 3D & Simulation',
  'Audio & Sound Design',
  'Computer Vision & Image AI',
  'Autonomous Systems & Robotics',
  'Conversational AI & Bots',
  'Research & Strategy',
  'Coaching & Personal Development',
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
