#!/usr/bin/env node
/**
 * Zod Schema Linter - Detects common issues in Zod schemas
 *
 * Usage: npx tsx validate_schemas.ts <schema-dir>
 *
 * Checks for:
 * - Missing error messages
 * - Inconsistent error message styles
 * - Overly permissive validations
 * - Missing optional() on nullable fields
 * - Regex without examples/comments
 * - No min/max constraints on strings
 *
 * Dependencies: npm install zod typescript
 */

import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

interface LintIssue {
  file: string;
  line?: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

class SchemaLinter {
  private issues: LintIssue[] = [];

  /**
   * Lint a Zod schema definition (source code analysis)
   */
  lintSchemaFile(filePath: string): void {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Check 1: String validation without error message
      if (line.match(/z\.string\(\)\.email\(\)(?!\()/)) {
        this.issues.push({
          file: filePath,
          line: lineNumber,
          severity: 'warning',
          message: 'email() validation missing custom error message',
          suggestion: ".email('Invalid email address')"
        });
      }

      if (line.match(/z\.string\(\)\.min\(\d+\)(?!\()/)) {
        this.issues.push({
          file: filePath,
          line: lineNumber,
          severity: 'warning',
          message: 'min() validation missing custom error message',
          suggestion: ".min(8, 'Must be at least 8 characters')"
        });
      }

      // Check 2: Regex without comment
      if (line.match(/\.regex\(\/.*\//) && !lines[index - 1]?.includes('//')) {
        this.issues.push({
          file: filePath,
          line: lineNumber,
          severity: 'info',
          message: 'Complex regex should have explanatory comment',
          suggestion: 'Add comment above explaining what the regex validates'
        });
      }

      // Check 3: String without constraints
      if (line.match(/:\s*z\.string\(\),?\s*$/) && !line.includes('optional')) {
        this.issues.push({
          file: filePath,
          line: lineNumber,
          severity: 'info',
          message: 'String field without min/max constraints',
          suggestion: 'Consider adding .min() or .max() for data integrity'
        });
      }

      // Check 4: Number without constraints
      if (line.match(/:\s*z\.number\(\),?\s*$/) && !line.includes('optional')) {
        this.issues.push({
          file: filePath,
          line: lineNumber,
          severity: 'info',
          message: 'Number field without min/max constraints',
          suggestion: 'Consider adding .min() or .max() for validation'
        });
      }

      // Check 5: Nullable without optional
      if (line.includes('.nullable()') && !line.includes('.optional()')) {
        this.issues.push({
          file: filePath,
          line: lineNumber,
          severity: 'warning',
          message: 'nullable() without optional() - may cause confusion',
          suggestion: 'Use .optional() for optional fields, .nullable() for null values'
        });
      }

      // Check 6: Array without min constraint
      if (line.match(/z\.array\(/) && !content.slice(content.indexOf(line)).match(/\.min\(\d+\)/)) {
        this.issues.push({
          file: filePath,
          line: lineNumber,
          severity: 'info',
          message: 'Array without minimum length validation',
          suggestion: "Consider .min(1, 'At least one item required')"
        });
      }

      // Check 7: Password field without length requirement
      if (line.includes('password') && line.match(/z\.string\(\)/) && !line.includes('.min(')) {
        this.issues.push({
          file: filePath,
          line: lineNumber,
          severity: 'error',
          message: 'Password field without minimum length requirement',
          suggestion: ".min(8, 'Password must be at least 8 characters')"
        });
      }

      // Check 8: Email field not using .email()
      if (line.includes('email') && line.match(/z\.string\(\)/) && !line.includes('.email()')) {
        this.issues.push({
          file: filePath,
          line: lineNumber,
          severity: 'error',
          message: 'Email field not using .email() validation',
          suggestion: '.email() for built-in email validation'
        });
      }
    });
  }

  /**
   * Scan directory for schema files
   */
  lintDirectory(dirPath: string): void {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        this.lintDirectory(fullPath);
      } else if (file.endsWith('.ts') && (file.includes('schema') || file.includes('validation'))) {
        this.lintSchemaFile(fullPath);
      }
    });
  }

  /**
   * Print results
   */
  report(): void {
    if (this.issues.length === 0) {
      console.log('✅ No issues found! Schemas look good.');
      return;
    }

    const errors = this.issues.filter(i => i.severity === 'error');
    const warnings = this.issues.filter(i => i.severity === 'warning');
    const info = this.issues.filter(i => i.severity === 'info');

    console.log(`\n📋 Schema Validation Report\n`);
    console.log(`Found ${errors.length} errors, ${warnings.length} warnings, ${info.length} suggestions\n`);

    const printIssues = (issues: LintIssue[], icon: string, color: string) => {
      if (issues.length === 0) return;

      issues.forEach(issue => {
        console.log(`${icon} ${issue.file}:${issue.line || '?'}`);
        console.log(`  ${issue.message}`);
        if (issue.suggestion) {
          console.log(`  💡 ${issue.suggestion}`);
        }
        console.log('');
      });
    };

    if (errors.length > 0) {
      console.log('🚨 Errors:\n');
      printIssues(errors, '❌', 'red');
    }

    if (warnings.length > 0) {
      console.log('⚠️  Warnings:\n');
      printIssues(warnings, '⚠️ ', 'yellow');
    }

    if (info.length > 0) {
      console.log('💡 Suggestions:\n');
      printIssues(info, 'ℹ️ ', 'blue');
    }

    if (errors.length > 0) {
      process.exit(1);
    }
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: npx tsx validate_schemas.ts <schema-directory>');
    console.log('Example: npx tsx validate_schemas.ts ./src/schemas');
    process.exit(1);
  }

  const dirPath = args[0];

  if (!fs.existsSync(dirPath)) {
    console.error(`❌ Directory not found: ${dirPath}`);
    process.exit(1);
  }

  const linter = new SchemaLinter();
  linter.lintDirectory(dirPath);
  linter.report();
}

export { SchemaLinter };
