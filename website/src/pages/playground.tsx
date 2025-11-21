import React, { useState } from 'react';
import Layout from '@theme/Layout';
import styles from './playground.module.css';

const examplePrompts = {
  'Web Design Expert': [
    'Create a brand identity for a meditation app called "Zenith" for busy professionals.',
    'Design a unique visual style for a sustainable fashion e-commerce platform.',
    'Develop a color palette and typography system for a fintech startup.',
  ],
  'Design System Creator': [
    'Build a comprehensive design system with design tokens and component library.',
    'Create production-ready CSS architecture using BEM methodology.',
    'Document spacing, typography, and color systems for a design team.',
  ],
  'Research Analyst': [
    'Research current trends in AI-powered productivity tools.',
    'Analyze competitive landscape for meditation apps.',
    'Investigate best practices for onboarding flows in SaaS products.',
  ],
  'Orchestrator': [
    'I\'m building a meditation app called "Zenith" for busy professionals. I want a unique design (not cliché), complete design system, and a team plan to build it.',
    'Create a comprehensive strategy for launching a sustainable fashion marketplace.',
    'Design and plan development for an ADHD-friendly productivity app.',
  ],
};

const skills = [
  'Web Design Expert',
  'Design System Creator',
  'Native App Designer',
  'Research Analyst',
  'Team Builder',
  'ADHD Design Expert',
  'Orchestrator',
];

export default function PlaygroundPage(): JSX.Element {
  const [selectedSkill, setSelectedSkill] = useState('Orchestrator');
  const [prompt, setPrompt] = useState(examplePrompts['Orchestrator'][0]);

  const handleSkillChange = (skill: string) => {
    setSelectedSkill(skill);
    if (examplePrompts[skill] && examplePrompts[skill].length > 0) {
      setPrompt(examplePrompts[skill][0]);
    } else {
      setPrompt('');
    }
  };

  const loadExamplePrompt = (example: string) => {
    setPrompt(example);
  };

  return (
    <Layout
      title="Interactive Playground"
      description="Test Claude Skills with example prompts and see how they work">
      <div className={styles.playgroundPage}>
        <div className={styles.hero}>
          <div className="container">
            <h1 className={styles.heroTitle}>Interactive Playground</h1>
            <p className={styles.heroSubtitle}>
              Test Claude Skills with example prompts and learn how to use them effectively
            </p>
          </div>
        </div>

        <div className="container">
          <div className={styles.playgroundContainer}>
            <div className={styles.sidebar}>
              <h3 className={styles.sidebarTitle}>Select a Skill</h3>
              <div className={styles.skillList}>
                {skills.map((skill) => (
                  <button
                    key={skill}
                    className={`${styles.skillButton} ${
                      selectedSkill === skill ? styles.skillButtonActive : ''
                    }`}
                    onClick={() => handleSkillChange(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              {examplePrompts[selectedSkill] && (
                <div className={styles.examplesSection}>
                  <h3 className={styles.sidebarTitle}>Example Prompts</h3>
                  <div className={styles.exampleList}>
                    {examplePrompts[selectedSkill].map((example, index) => (
                      <button
                        key={index}
                        className={styles.exampleButton}
                        onClick={() => loadExamplePrompt(example)}
                      >
                        Example {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.mainContent}>
              <div className={styles.promptSection}>
                <label htmlFor="prompt" className={styles.label}>
                  Your Prompt
                </label>
                <textarea
                  id="prompt"
                  className={styles.promptInput}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Enter your prompt for ${selectedSkill}...`}
                  rows={8}
                />
              </div>

              <div className={styles.infoBox}>
                <h3 className={styles.infoTitle}>💡 How to Use</h3>
                <ol className={styles.infoList}>
                  <li>Select a skill from the sidebar</li>
                  <li>Choose an example prompt or write your own</li>
                  <li>Copy the prompt below</li>
                  <li>
                    Use it in your Claude conversation by referencing the skill file from{' '}
                    <code>.github/agents/</code>
                  </li>
                </ol>
              </div>

              <div className={styles.outputSection}>
                <label className={styles.label}>Formatted Prompt for Claude</label>
                <div className={styles.output}>
                  <div className={styles.outputHeader}>
                    <span className={styles.outputTitle}>📋 Copy this to Claude:</span>
                    <button
                      className={styles.copyButton}
                      onClick={() => {
                        const text = `[Using ${selectedSkill}]\n\n${prompt}`;
                        navigator.clipboard.writeText(text);
                      }}
                    >
                      Copy
                    </button>
                  </div>
                  <pre className={styles.outputContent}>
                    {`[Using ${selectedSkill}]\n\n${prompt}`}
                  </pre>
                </div>
              </div>

              <div className={styles.tipsSection}>
                <h3 className={styles.tipsTitle}>✨ Tips for Best Results</h3>
                <ul className={styles.tipsList}>
                  <li>Be specific about your goals and requirements</li>
                  <li>Provide context about your project or use case</li>
                  <li>Use the Orchestrator for complex, multi-domain problems</li>
                  <li>Combine multiple skills for comprehensive solutions</li>
                  <li>Reference existing work or examples when relevant</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
