import React, { useState, useCallback } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import '../css/win31.css';

// Categories from types.ts
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

const initialFormData: SkillFormData = {
  name: '',
  title: '',
  description: '',
  category: '',
  tags: '',
  allowedTools: 'Read, Write, Edit, Bash, WebSearch',
  useCases: '',
  antiPatterns: '',
  pairsWith: '',
  submitterName: '',
  submitterGithub: '',
};

interface FormErrors {
  [key: string]: string;
}

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

export default function SubmitSkill(): JSX.Element {
  const [formData, setFormData] = useState<SkillFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-generate title from name
      if (name === 'name') {
        updated.title = toTitleCase(value);
      }
      return updated;
    });
    // Clear error when field is edited
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

    return `https://github.com/curiositech/some_claude_skills/issues/new?title=${title}&body=${body}&labels=skill-submission`;
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
    setFormData(initialFormData);
    setErrors({});
    setShowPreview(false);
    setSubmitted(false);
    setCopied(false);
  }, []);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    fontFamily: 'var(--font-code)',
    border: '2px inset #808080',
    background: 'white',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 'bold',
    fontSize: '13px',
    color: '#000080',
  };

  const errorStyle: React.CSSProperties = {
    color: '#c00',
    fontSize: '12px',
    marginTop: '4px',
  };

  const fieldGroupStyle: React.CSSProperties = {
    marginBottom: '16px',
  };

  if (submitted) {
    return (
      <Layout
        title="Skill Submitted"
        description="Thank you for submitting a skill idea"
      >
        <div className="skills-page-bg page-backsplash page-backsplash--submit-skill page-backsplash--medium">
          <div className="skills-container" style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }}>
            <div className="win31-window">
              <div className="win31-titlebar">
                <div className="win31-titlebar__left">
                  <div className="win31-btn-3d win31-btn-3d--small">-</div>
                </div>
                <span className="win31-title-text">SUBMISSION_SUCCESS.EXE</span>
                <div className="win31-titlebar__right">
                  <div className="win31-btn-3d win31-btn-3d--small">[]</div>
                </div>
              </div>
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                <h1 style={{ marginTop: 0, fontSize: '28px', color: '#000080' }}>
                  Skill Submitted!
                </h1>
                <p style={{ fontSize: '15px', color: '#333', marginBottom: '24px', lineHeight: '1.6' }}>
                  Your skill idea has been submitted as a GitHub Issue.
                  The maintainers will review it and may reach out for clarification.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    className="win31-btn-3d"
                    onClick={handleReset}
                    style={{ padding: '12px 24px', fontWeight: 'bold' }}
                  >
                    Submit Another
                  </button>
                  <Link
                    to="/skills"
                    className="win31-btn-3d"
                    style={{ padding: '12px 24px', fontWeight: 'bold', textDecoration: 'none' }}
                  >
                    Browse Skills
                  </Link>
                  <a
                    href="https://github.com/curiositech/some_claude_skills/issues?q=is%3Aissue+label%3Askill-submission"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="win31-btn-3d"
                    style={{ padding: '12px 24px', fontWeight: 'bold', textDecoration: 'none' }}
                  >
                    View All Submissions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Submit a Skill"
      description="Submit your Claude skill idea to the community collection"
    >
      <div className="skills-page-bg page-backsplash page-backsplash--submit-skill page-backsplash--medium">
        <div className="skills-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>

          {/* Header */}
          <div className="win31-window">
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">-</div>
              </div>
              <span className="win31-title-text">SUBMIT_SKILL.EXE</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">[]</div>
              </div>
            </div>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <h1 style={{ marginTop: 0, fontSize: '28px', marginBottom: '12px', color: '#000080' }}>
                Submit a Skill Idea
              </h1>
              <p style={{ fontSize: '14px', color: '#555', marginBottom: 0, lineHeight: '1.6' }}>
                Have an idea for a useful Claude skill? Submit it here and we'll review it for inclusion
                in the collection. Good skills are specific, actionable, and help Claude do something it
                couldn't do well without guidance.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="win31-window" style={{ marginTop: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">-</div>
              </div>
              <span className="win31-title-text">SKILL_DETAILS.FRM</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">[]</div>
              </div>
            </div>
            <div style={{ padding: '24px' }}>

              {/* Skill Name */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>
                  Skill Name <span style={{ color: '#c00' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., api-architect, code-necromancer"
                  style={inputStyle}
                />
                {errors.name && <div style={errorStyle}>{errors.name}</div>}
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Will become: <code>{toKebabCase(formData.name) || 'skill-name'}</code>
                </div>
              </div>

              {/* Title (auto-generated) */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Display Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Human-readable title"
                  style={inputStyle}
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Auto-generated from name, but you can customize it
                </div>
              </div>

              {/* Category */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>
                  Category <span style={{ color: '#c00' }}>*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">-- Select a category --</option>
                  {SKILL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <div style={errorStyle}>{errors.category}</div>}
              </div>

              {/* Description */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>
                  Description <span style={{ color: '#c00' }}>*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="A concise description of what this skill does. Include activation phrases like 'Activate on: X, Y, Z' and clarify what it's NOT for."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                {errors.description && <div style={errorStyle}>{errors.description}</div>}
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {formData.description.length} characters (min 50)
                </div>
              </div>

              {/* Tags */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>
                  Tags <span style={{ color: '#c00' }}>*</span>
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="api, rest, graphql, microservices"
                  style={inputStyle}
                />
                {errors.tags && <div style={errorStyle}>{errors.tags}</div>}
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Comma-separated list of relevant tags (aim for 3-5)
                </div>
              </div>

              {/* Allowed Tools */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Allowed Tools</label>
                <input
                  type="text"
                  name="allowedTools"
                  value={formData.allowedTools}
                  onChange={handleChange}
                  placeholder="Read, Write, Edit, Bash, WebSearch"
                  style={inputStyle}
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Comma-separated Claude tools this skill needs access to
                </div>
              </div>

              {/* Use Cases */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>
                  When to Use <span style={{ color: '#c00' }}>*</span>
                </label>
                <textarea
                  name="useCases"
                  value={formData.useCases}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe specific scenarios when this skill should be activated. Include example user prompts or situations."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                {errors.useCases && <div style={errorStyle}>{errors.useCases}</div>}
              </div>

              {/* Anti-patterns */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>When NOT to Use (Optional)</label>
                <textarea
                  name="antiPatterns"
                  value={formData.antiPatterns}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe situations where this skill should NOT be used, or common mistakes to avoid."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Pairs With */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Works Well With (Optional)</label>
                <textarea
                  name="pairsWith"
                  value={formData.pairsWith}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Other skills this pairs well with, e.g., 'career-biographer for data, competitive-cartographer for positioning'"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Submitter Info */}
              <div style={{
                background: '#f5f5f5',
                border: '1px solid #ddd',
                padding: '16px',
                marginTop: '24px',
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#000080', fontSize: '14px' }}>
                  Submitter Info (Optional)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ ...labelStyle, color: '#555' }}>Your Name</label>
                    <input
                      type="text"
                      name="submitterName"
                      value={formData.submitterName}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, color: '#555' }}>GitHub Username</label>
                    <input
                      type="text"
                      name="submitterGithub"
                      value={formData.submitterGithub}
                      onChange={handleChange}
                      placeholder="@janedoe"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '2px groove #ccc',
              }}>
                <button
                  type="button"
                  className="win31-btn-3d"
                  onClick={handleReset}
                  style={{ padding: '10px 20px' }}
                >
                  Reset Form
                </button>
                <button
                  type="button"
                  className="win31-btn-3d"
                  onClick={handlePreview}
                  style={{ padding: '10px 20px', background: '#000080', color: 'white', fontWeight: 'bold' }}
                >
                  Preview & Submit →
                </button>
              </div>
            </div>
          </div>

          {/* Preview Modal */}
          {showPreview && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '20px',
              }}
              onClick={() => setShowPreview(false)}
            >
              <div
                className="win31-window"
                style={{
                  maxWidth: '700px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflow: 'auto',
                }}
                onClick={e => e.stopPropagation()}
              >
                <div className="win31-titlebar">
                  <div className="win31-titlebar__left">
                    <div className="win31-btn-3d win31-btn-3d--small">-</div>
                  </div>
                  <span className="win31-title-text">SKILL_PREVIEW.MD</span>
                  <div className="win31-titlebar__right">
                    <button
                      className="win31-btn-3d win31-btn-3d--small"
                      onClick={() => setShowPreview(false)}
                      style={{ cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      X
                    </button>
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ marginTop: 0, color: '#000080' }}>Generated SKILL.md Preview</h3>
                  <pre style={{
                    background: '#1a1a2e',
                    color: '#0f0',
                    padding: '16px',
                    fontSize: '12px',
                    overflow: 'auto',
                    maxHeight: '400px',
                    border: '2px inset #000',
                    fontFamily: 'Consolas, Monaco, monospace',
                    lineHeight: '1.4',
                  }}>
                    {generateSkillYaml()}
                  </pre>

                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center',
                    marginTop: '20px',
                    flexWrap: 'wrap',
                  }}>
                    <button
                      className="win31-btn-3d"
                      onClick={handleCopyYaml}
                      style={{ padding: '12px 24px' }}
                    >
                      {copied ? '✓ Copied!' : '📋 Copy YAML'}
                    </button>
                    <button
                      className="win31-btn-3d"
                      onClick={handleSubmitToGitHub}
                      style={{
                        padding: '12px 24px',
                        background: '#000080',
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    >
                      🚀 Submit to GitHub
                    </button>
                    <button
                      className="win31-btn-3d"
                      onClick={() => setShowPreview(false)}
                      style={{ padding: '12px 24px' }}
                    >
                      ← Back to Edit
                    </button>
                  </div>

                  <p style={{
                    fontSize: '12px',
                    color: '#666',
                    textAlign: 'center',
                    marginTop: '16px',
                    marginBottom: 0,
                  }}>
                    Clicking "Submit to GitHub" will open a new issue with your skill pre-filled.
                    You'll need a GitHub account to complete the submission.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="win31-window" style={{ marginTop: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">-</div>
              </div>
              <span className="win31-title-text">GUIDELINES.TXT</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">[]</div>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <h3 style={{ marginTop: 0, fontSize: '16px', color: '#000080' }}>What Makes a Good Skill?</h3>
              <ul style={{ lineHeight: '1.7', marginBottom: 0 }}>
                <li><strong>Specific:</strong> Targets a particular domain or task type</li>
                <li><strong>Actionable:</strong> Provides clear guidance Claude can follow</li>
                <li><strong>Bounded:</strong> Knows what it's NOT for (avoids scope creep)</li>
                <li><strong>Unique:</strong> Doesn't duplicate existing skills</li>
                <li><strong>Tested:</strong> You've tried the approach and it works</li>
              </ul>

              <h3 style={{ fontSize: '16px', color: '#000080', marginTop: '20px' }}>Examples of Good Skills</h3>
              <ul style={{ lineHeight: '1.7', marginBottom: 0 }}>
                <li><Link to="/docs/skills/cv_creator">cv-creator</Link> - Specific (resumes), bounded (not cover letters), has anti-patterns</li>
                <li><Link to="/docs/skills/drone_cv_expert">drone-cv-expert</Link> - Domain expertise, pairs with inspection specialist</li>
                <li><Link to="/docs/skills/diagramming_expert">diagramming-expert</Link> - Clear activation triggers, output format guidance</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
