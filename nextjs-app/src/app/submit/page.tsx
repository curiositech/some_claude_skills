'use client';

import { useState, useCallback } from 'react';
import { Window, WindowTitleBar, WindowContent } from '@/components/win31/window';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/ui/stack';
import { Flex } from '@/components/ui/flex';
import { FileText, Send, Copy, Check, RotateCcw, ExternalLink } from 'lucide-react';

// =============================================================================
// CONSTANTS
// =============================================================================

const SKILL_CATEGORIES = [
  'AI & Machine Learning',
  'Code Quality & Testing',
  'Content & Writing',
  'Data & Analytics',
  'Design & Creative',
  'DevOps & Site Reliability',
  'Business & Monetization',
  'Research & Analysis',
  'Productivity & Meta',
  'Lifestyle & Personal',
] as const;

const DEFAULT_TOOLS = 'Read, Write, Edit, Bash, WebSearch';

// =============================================================================
// TYPES
// =============================================================================

interface SkillFormData {
  name: string;
  title: string;
  description: string;
  category: string;
  tags: string;
  allowedTools: string;
  useCases: string;
  antiPatterns: string;
  pairsWith: string;
  submitterName: string;
  submitterGithub: string;
}

interface FormErrors {
  [key: string]: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function toTitleCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function SubmitSkillPage() {
  const [formData, setFormData] = useState<SkillFormData>({
    name: '',
    title: '',
    description: '',
    category: '',
    tags: '',
    allowedTools: DEFAULT_TOOLS,
    useCases: '',
    antiPatterns: '',
    pairsWith: '',
    submitterName: '',
    submitterGithub: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'name') {
        updated.title = toTitleCase(value);
      }
      return updated;
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Skill name is required';
    } else if (!/^[a-zA-Z0-9\s-]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain letters, numbers, spaces, and hyphens';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description should be at least 50 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.tags.trim()) {
      newErrors.tags = 'At least one tag is required';
    }

    if (!formData.useCases.trim()) {
      newErrors.useCases = 'Please describe when to use this skill';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const generateSkillYaml = useCallback((): string => {
    const skillId = toKebabCase(formData.name);
    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    const tools = formData.allowedTools.split(',').map(t => t.trim()).filter(Boolean);

    let yaml = `---
name: ${skillId}
description: ${formData.description.replace(/\n/g, ' ').trim()}
allowed-tools: ${tools.join(', ')}
category: ${formData.category}
tags:
${tags.map(t => `  - ${t}`).join('\n')}
---

# ${formData.title}

${formData.description}

## When to Use

${formData.useCases}
`;

    if (formData.antiPatterns.trim()) {
      yaml += `
## When NOT to Use

${formData.antiPatterns}
`;
    }

    if (formData.pairsWith.trim()) {
      yaml += `
## Works Well With

${formData.pairsWith}
`;
    }

    return yaml;
  }, [formData]);

  const generateGitHubIssueUrl = useCallback((): string => {
    const skillId = toKebabCase(formData.name);
    const yaml = generateSkillYaml();

    const title = encodeURIComponent(`[Skill Submission] ${formData.title}`);
    const body = encodeURIComponent(`## Skill Submission

**Skill Name:** ${formData.title}
**Skill ID:** ${skillId}
**Category:** ${formData.category}
**Tags:** ${formData.tags}

${formData.submitterName ? `**Submitted by:** ${formData.submitterName}` : ''}
${formData.submitterGithub ? `**GitHub:** @${formData.submitterGithub.replace('@', '')}` : ''}

---

## SKILL.md Content

\`\`\`yaml
${yaml}
\`\`\`

---

## Additional Context

_Add any additional context, examples, or references here._
`);

    return `https://github.com/erichowens/some_claude_skills/issues/new?title=${title}&body=${body}&labels=skill-submission`;
  }, [formData, generateSkillYaml]);

  const handlePreview = useCallback(() => {
    if (validate()) {
      setShowPreview(true);
    }
  }, [validate]);

  const handleCopyYaml = useCallback(async () => {
    const yaml = generateSkillYaml();
    try {
      await navigator.clipboard.writeText(yaml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [generateSkillYaml]);

  const handleSubmitToGitHub = useCallback(() => {
    const url = generateGitHubIssueUrl();
    window.open(url, '_blank');
    setSubmitted(true);
  }, [generateGitHubIssueUrl]);

  const handleReset = useCallback(() => {
    setFormData({
      name: '',
      title: '',
      description: '',
      category: '',
      tags: '',
      allowedTools: DEFAULT_TOOLS,
      useCases: '',
      antiPatterns: '',
      pairsWith: '',
      submitterName: '',
      submitterGithub: '',
    });
    setErrors({});
    setShowPreview(false);
    setSubmitted(false);
    setCopied(false);
  }, []);

  // ---------------------------------------------------------------------------
  // SUCCESS STATE
  // ---------------------------------------------------------------------------

  if (submitted) {
    return (
      <div className="min-h-screen bg-win-desktop p-4 sm:p-8">
        <div className="mx-auto max-w-2xl">
          <Window>
            <WindowTitleBar title="SUBMISSION_SUCCESS.EXE" />
            <WindowContent className="p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-win-navy mb-4">
                Skill Submitted!
              </h1>
              <p className="text-gray-600 mb-6">
                Your skill idea has been submitted as a GitHub Issue.
                The maintainers will review it and may reach out for clarification.
              </p>
              <Flex gap="sm" justify="center" wrap="wrap">
                <Button variant="win31" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Submit Another
                </Button>
                <Button variant="win31" asChild>
                  <a href="/skills">Browse Skills</a>
                </Button>
                <Button variant="win31" asChild>
                  <a 
                    href="https://github.com/erichowens/some_claude_skills/issues?q=is%3Aissue+label%3Askill-submission"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Submissions
                  </a>
                </Button>
              </Flex>
            </WindowContent>
          </Window>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-win-desktop p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        
        {/* Header */}
        <Window>
          <WindowTitleBar title="SUBMIT_SKILL.EXE" />
          <WindowContent className="p-6 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-win-navy" />
            <h1 className="text-2xl font-bold text-win-navy mb-2">
              Submit a Skill Idea
            </h1>
            <p className="text-gray-600 text-sm max-w-lg mx-auto">
              Have an idea for a useful Claude skill? Submit it here and we&apos;ll review it 
              for inclusion. Good skills are specific, actionable, and help Claude do 
              something it couldn&apos;t do well without guidance.
            </p>
          </WindowContent>
        </Window>

        {/* Form */}
        <Window>
          <WindowTitleBar title="SKILL_DETAILS.FRM" />
          <WindowContent className="p-6">
            <Stack gap="md">
              
              {/* Skill Name */}
              <div>
                <label className="block text-sm font-bold text-win-navy mb-1">
                  Skill Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., api-architect, code-necromancer"
                  className="w-full px-3 py-2 border-2 border-inset bg-white font-mono text-sm"
                />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                <p className="text-gray-500 text-xs mt-1">
                  Will become: <code className="bg-gray-100 px-1">{toKebabCase(formData.name) || 'skill-name'}</code>
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-win-navy mb-1">
                  Display Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Human-readable title"
                  className="w-full px-3 py-2 border-2 border-inset bg-white font-mono text-sm"
                />
                <p className="text-gray-500 text-xs mt-1">Auto-generated from name, but you can customize</p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-win-navy mb-1">
                  Category <span className="text-red-600">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-inset bg-white font-mono text-sm"
                >
                  <option value="">-- Select a category --</option>
                  {SKILL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-600 text-xs mt-1">{errors.category}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-win-navy mb-1">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="A concise description of what this skill does. Include activation phrases and clarify what it's NOT for."
                  className="w-full px-3 py-2 border-2 border-inset bg-white font-mono text-sm resize-y"
                />
                {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
                <p className="text-gray-500 text-xs mt-1">
                  {formData.description.length} characters (min 50)
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-bold text-win-navy mb-1">
                  Tags <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="api, rest, graphql, microservices"
                  className="w-full px-3 py-2 border-2 border-inset bg-white font-mono text-sm"
                />
                {errors.tags && <p className="text-red-600 text-xs mt-1">{errors.tags}</p>}
                <p className="text-gray-500 text-xs mt-1">Comma-separated list (3-5 recommended)</p>
              </div>

              {/* Allowed Tools */}
              <div>
                <label className="block text-sm font-bold text-win-navy mb-1">
                  Allowed Tools
                </label>
                <input
                  type="text"
                  name="allowedTools"
                  value={formData.allowedTools}
                  onChange={handleChange}
                  placeholder="Read, Write, Edit, Bash, WebSearch"
                  className="w-full px-3 py-2 border-2 border-inset bg-white font-mono text-sm"
                />
                <p className="text-gray-500 text-xs mt-1">Claude tools this skill needs access to</p>
              </div>

              {/* Use Cases */}
              <div>
                <label className="block text-sm font-bold text-win-navy mb-1">
                  When to Use <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="useCases"
                  value={formData.useCases}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe specific scenarios when this skill should be activated. Include example user prompts."
                  className="w-full px-3 py-2 border-2 border-inset bg-white font-mono text-sm resize-y"
                />
                {errors.useCases && <p className="text-red-600 text-xs mt-1">{errors.useCases}</p>}
              </div>

              {/* Anti-patterns */}
              <div>
                <label className="block text-sm font-bold text-win-navy mb-1">
                  When NOT to Use (Optional)
                </label>
                <textarea
                  name="antiPatterns"
                  value={formData.antiPatterns}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Situations where this skill should NOT be used, or common mistakes to avoid."
                  className="w-full px-3 py-2 border-2 border-inset bg-white font-mono text-sm resize-y"
                />
              </div>

              {/* Pairs With */}
              <div>
                <label className="block text-sm font-bold text-win-navy mb-1">
                  Works Well With (Optional)
                </label>
                <textarea
                  name="pairsWith"
                  value={formData.pairsWith}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Other skills this pairs well with, e.g., 'career-biographer for data'"
                  className="w-full px-3 py-2 border-2 border-inset bg-white font-mono text-sm resize-y"
                />
              </div>

              {/* Submitter Info */}
              <div className="bg-gray-100 border border-gray-300 p-4 mt-4">
                <h3 className="text-sm font-bold text-win-navy mb-3">Submitter Info (Optional)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Your Name</label>
                    <input
                      type="text"
                      name="submitterName"
                      value={formData.submitterName}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className="w-full px-3 py-2 border-2 border-inset bg-white font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">GitHub Username</label>
                    <input
                      type="text"
                      name="submitterGithub"
                      value={formData.submitterGithub}
                      onChange={handleChange}
                      placeholder="@janedoe"
                      className="w-full px-3 py-2 border-2 border-inset bg-white font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <Flex gap="sm" justify="end" className="pt-4 border-t-2 border-gray-300">
                <Button variant="win31" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button variant="win31Primary" onClick={handlePreview}>
                  Preview & Submit →
                </Button>
              </Flex>
            </Stack>
          </WindowContent>
        </Window>

        {/* Guidelines */}
        <Window>
          <WindowTitleBar title="GUIDELINES.TXT" />
          <WindowContent className="p-5">
            <h3 className="text-sm font-bold text-win-navy mb-3">What Makes a Good Skill?</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside mb-4">
              <li><strong>Specific:</strong> Targets a particular domain or task type</li>
              <li><strong>Actionable:</strong> Provides clear guidance Claude can follow</li>
              <li><strong>Bounded:</strong> Knows what it&apos;s NOT for (avoids scope creep)</li>
              <li><strong>Unique:</strong> Doesn&apos;t duplicate existing skills</li>
              <li><strong>Tested:</strong> You&apos;ve tried the approach and it works</li>
            </ul>
            <p className="text-xs text-gray-500">
              See existing skills like <a href="/skills/cv-creator" className="text-win-navy underline">cv-creator</a> or{' '}
              <a href="/skills/drone-cv-expert" className="text-win-navy underline">drone-cv-expert</a> for inspiration.
            </p>
          </WindowContent>
        </Window>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div onClick={e => e.stopPropagation()} className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <Window>
              <WindowTitleBar 
                title="SKILL_PREVIEW.MD" 
                onClose={() => setShowPreview(false)}
              />
              <WindowContent className="p-5">
                <h3 className="text-sm font-bold text-win-navy mb-3">Generated SKILL.md Preview</h3>
                <pre className="bg-gray-900 text-green-400 p-4 text-xs font-mono overflow-auto max-h-80 border-2 border-inset">
                  {generateSkillYaml()}
                </pre>

                <Flex gap="sm" justify="center" wrap="wrap" className="mt-5">
                  <Button variant="win31" onClick={handleCopyYaml}>
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy YAML'}
                  </Button>
                  <Button variant="win31Primary" onClick={handleSubmitToGitHub}>
                    <Send className="w-4 h-4 mr-2" />
                    Submit to GitHub
                  </Button>
                  <Button variant="win31" onClick={() => setShowPreview(false)}>
                    ← Back to Edit
                  </Button>
                </Flex>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Clicking &quot;Submit to GitHub&quot; opens a new issue with your skill pre-filled.
                  You&apos;ll need a GitHub account to complete the submission.
                </p>
              </WindowContent>
            </Window>
          </div>
        </div>
      )}
    </div>
  );
}
