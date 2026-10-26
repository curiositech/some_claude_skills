import React, { useState, useEffect } from 'react';
import styles from './ValidationDemo.module.css';

type ValidationType = 'liquid' | 'brackets' | 'props';

interface ValidationError {
  line: number;
  message: string;
  fix?: string;
}

const examples = {
  liquid: `# Native App Designer

Create beautiful mobile experiences with Vue syntax:

<template>
  <li>{{ item.title }}</li>
</template>

This will break MDX parsing!`,

  brackets: `# Artifact Contribution Guide

## Best Practices

❌ Include massive binary files (>10MB)
❌ Submit without testing (success rate <60%)
✅ Keep images optimized (<500KB)

Quick wins take <70 characters!`,

  props: `---
title: CV Creator
---

<SkillHeader
  skillName="CV Creator"
  skillId="cv-creator"
  description="Professional resume builder"
/>

This component expects \`fileName\` not \`skillId\`!`
};

export default function ValidationDemo(): JSX.Element {
  const [validationType, setValidationType] = useState<ValidationType>('liquid');
  const [code, setCode] = useState(examples.liquid);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Validation functions
  const validateLiquid = (text: string): ValidationError[] => {
    const errors: ValidationError[] = [];
    const lines = text.split('\n');

    lines.forEach((line, idx) => {
      const match = line.match(/\{\{[^`].*?\}\}/);
      if (match && !line.includes('{`{{')) {
        errors.push({
          line: idx + 1,
          message: `Unescaped Liquid syntax: "${match[0]}"`,
          fix: `Wrap in MDX expression: {\`${match[0]}\`}`
        });
      }
    });

    return errors;
  };

  const validateBrackets = (text: string): ValidationError[] => {
    const errors: ValidationError[] = [];
    const lines = text.split('\n');

    lines.forEach((line, idx) => {
      const lessThanMatch = line.match(/<(\d+)/);
      const greaterThanMatch = line.match(/>(\d+)/);

      if (lessThanMatch && !line.includes('&lt;')) {
        errors.push({
          line: idx + 1,
          message: `Unescaped angle bracket: "${lessThanMatch[0]}"`,
          fix: lessThanMatch[0].replace('<', '&lt;')
        });
      }

      if (greaterThanMatch && !line.includes('&gt;')) {
        errors.push({
          line: idx + 1,
          message: `Unescaped angle bracket: "${greaterThanMatch[0]}"`,
          fix: greaterThanMatch[0].replace('>', '&gt;')
        });
      }
    });

    return errors;
  };

  const validateProps = (text: string): ValidationError[] => {
    const errors: ValidationError[] = [];
    const headerMatch = text.match(/<SkillHeader[\s\S]*?\/>/);

    if (headerMatch) {
      const headerText = headerMatch[0];
      const lines = text.split('\n');
      const lineNum = lines.findIndex(l => l.includes('<SkillHeader')) + 1;

      if (headerText.includes('skillId=')) {
        errors.push({
          line: lineNum,
          message: 'Uses "skillId" prop instead of "fileName"',
          fix: 'Change skillId="..." to fileName="..."'
        });
      }
    }

    return errors;
  };

  // Run validation on code change
  useEffect(() => {
    setIsValidating(true);
    const timer = setTimeout(() => {
      let newErrors: ValidationError[] = [];

      switch (validationType) {
        case 'liquid':
          newErrors = validateLiquid(code);
          break;
        case 'brackets':
          newErrors = validateBrackets(code);
          break;
        case 'props':
          newErrors = validateProps(code);
          break;
      }

      setErrors(newErrors);
      setIsValidating(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [code, validationType]);

  const changeValidationType = (type: ValidationType) => {
    setValidationType(type);
    setCode(examples[type]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.titleGradient}>Live Validation Demo</span>
        </h2>
        <p className={styles.subtitle}>
          Edit the code below and see real-time validation feedback
        </p>
      </div>

      {/* Validation Type Selector */}
      <div className={styles.validationTypes}>
        <button
          className={`${styles.typeButton} ${validationType === 'liquid' ? styles.active : ''}`}
          onClick={() => changeValidationType('liquid')}
        >
          <span className={styles.typeIcon}>💧</span>
          Liquid Syntax
        </button>
        <button
          className={`${styles.typeButton} ${validationType === 'brackets' ? styles.active : ''}`}
          onClick={() => changeValidationType('brackets')}
        >
          <span className={styles.typeIcon}>⟨⟩</span>
          Angle Brackets
        </button>
        <button
          className={`${styles.typeButton} ${validationType === 'props' ? styles.active : ''}`}
          onClick={() => changeValidationType('props')}
        >
          <span className={styles.typeIcon}>⚙️</span>
          Component Props
        </button>
      </div>

      {/* Editor and Output */}
      <div className={styles.editorContainer}>
        {/* Code Editor */}
        <div className={styles.editorPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Editor</span>
            <span className={styles.statusBadge}>
              {isValidating ? '⏳ Validating...' : errors.length === 0 ? '✅ Valid' : `❌ ${errors.length} Error${errors.length > 1 ? 's' : ''}`}
            </span>
          </div>
          <textarea aria-label="Configuration to validate"
            className={styles.codeEditor}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Validation Output */}
        <div className={styles.outputPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Validation Output</span>
          </div>
          <div className={styles.outputConsole}>
            {errors.length === 0 ? (
              <div className={styles.successMessage}>
                <span className={styles.successIcon}>✅</span>
                <span>No errors found! Code is valid.</span>
              </div>
            ) : (
              <div className={styles.errorsList}>
                {errors.map((error, idx) => (
                  <div key={idx} className={styles.error}>
                    <div className={styles.errorHeader}>
                      <span className={styles.errorIcon}>❌</span>
                      <span className={styles.errorLine}>Line {error.line}</span>
                    </div>
                    <div className={styles.errorMessage}>{error.message}</div>
                    {error.fix && (
                      <div className={styles.errorFix}>
                        <span className={styles.fixLabel}>Fix:</span> {error.fix}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Installation CTA */}
      <div className={styles.installSection}>
        <h3 className={styles.installTitle}>Try It in Your Project</h3>
        <p className={styles.installText}>
          Install the pre-commit hook to get this validation automatically:
        </p>
        <div className={styles.codeBlock}>
          <code>cd website && npm run install-hooks</code>
        </div>
        <p className={styles.installNote}>
          Now these errors will be caught before you even commit! 🎉
        </p>
      </div>
    </div>
  );
}
