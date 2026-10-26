import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './ErrorShowcase.module.css';

interface ErrorExample {
  id: string;
  name: string;
  before: string;
  after: string;
  errorLine: number;
  fixLine: number;
  validationOutput: string;
}

const errorExamples: ErrorExample[] = [
  {
    id: 'liquid',
    name: 'Liquid Template Syntax',
    before: `<template>
  <li>{{ item.title }}</li>
</template>`,
    after: `<template>
  <li>{\`{{ item.title }}\`}</li>
</template>`,
    errorLine: 2,
    fixLine: 2,
    validationOutput: `❌ native_app_designer.md:
   Line 2: "{{ item.title }}"
   Fix: {\`{{ item.title }}\`}`
  },
  {
    id: 'brackets',
    name: 'Angle Brackets',
    before: `❌ Include massive binary files (>10MB)
❌ Submit without testing preview locally`,
    after: `❌ Include massive binary files (&gt;10MB)
❌ Submit without testing preview locally`,
    errorLine: 1,
    fixLine: 1,
    validationOutput: `❌ artifact-contribution-guide.md:
   Line 660: ">10" → "&gt;10"

Replace < with &lt; and > with &gt; in markdown text`
  },
  {
    id: 'props',
    name: 'SkillHeader Props',
    before: `<SkillHeader
  skillName="CV Creator"
  skillId="cv-creator"
  description="Professional resume builder..."
/>`,
    after: `<SkillHeader
  skillName="CV Creator"
  fileName="cv-creator"
  description="Professional resume builder..."
/>`,
    errorLine: 3,
    fixLine: 3,
    validationOutput: `❌ cv_creator.md:
   Line 13: Uses "skillId" prop instead of "fileName"
   Fix: Change skillId="..." to fileName="..."`
  }
];

export default function ErrorShowcase(): JSX.Element {
  const [selectedExample, setSelectedExample] = useState<ErrorExample>(errorExamples[0]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Error Showcase: Before & After</h2>
        <p className={styles.subtitle}>Real errors caught by the validation system with fixes applied.</p>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        {errorExamples.map((example) => (
          <button
            key={example.id}
            onClick={() => setSelectedExample(example)}
            className={`${styles.tabButton} ${selectedExample.id === example.id ? styles.active : ''}`}
          >
            {example.name}
          </button>
        ))}
      </div>

      {/* Before/After Comparison */}
      <div className={styles.comparison}>
        {/* Before */}
        <div className={styles.comparePanel}>
          <div className={`${styles.panelHeader} ${styles.beforeHeader}`}>
            <span className={styles.errorIcon}>❌</span>
            Before (Error)
          </div>
          <div className={styles.codeContainer}>
            <SyntaxHighlighter
              language="jsx"
              style={prism}
              className={styles.codeBlock}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: "var(--theme-elevated)",
                borderRadius: 0
              }}
            >
              {selectedExample.before}
            </SyntaxHighlighter>
            <div
              className={`${styles.lineHighlight} ${styles.errorLine}`}
              style={{
                top: `${selectedExample.errorLine * 24 + 16}px`
              }}
            />
          </div>
        </div>

        {/* After */}
        <div className={styles.comparePanel}>
          <div className={`${styles.panelHeader} ${styles.afterHeader}`}>
            <span className={styles.successIcon}>✅</span>
            After (Fixed)
          </div>
          <div className={styles.codeContainer}>
            <SyntaxHighlighter
              language="jsx"
              style={prism}
              className={styles.codeBlock}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: "var(--theme-elevated)",
                borderRadius: 0
              }}
            >
              {selectedExample.after}
            </SyntaxHighlighter>
            <div
              className={`${styles.lineHighlight} ${styles.fixLine}`}
              style={{
                top: `${selectedExample.fixLine * 24 + 16}px`
              }}
            />
          </div>
        </div>
      </div>

      {/* Validation Output */}
      <div className={styles.validationSection}>
        <h3 className={styles.sectionTitle}>Validation Output</h3>
        <div className={styles.validationOutput}>
          {selectedExample.validationOutput}
        </div>
      </div>

      {/* Try It Section */}
      <div className={styles.tryItSection}>
        <h3 className={styles.tryItTitle}>Try It Yourself</h3>
        <p className={styles.tryItText}>
          Install the pre-commit hook to catch these errors automatically:
        </p>
        <div className={styles.commandBlock}>
          cd website<br/>
          npm run install-hooks
        </div>
        <p className={styles.tryItText}>
          Now when you commit, the validation will run automatically and prevent these errors from breaking your build!
        </p>
      </div>
    </div>
  );
}
