#!/usr/bin/env node
/**
 * GitHub Actions Workflow Validator
 *
 * Validates workflow YAML files for syntax errors and common issues.
 *
 * Usage: npx tsx workflow_validator.ts [workflow-file]
 *
 * Examples:
 *   npx tsx workflow_validator.ts .github/workflows/ci.yml
 *   npx tsx workflow_validator.ts .github/workflows/*.yml
 *
 * Dependencies: npm install yaml
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'yaml';

interface ValidationIssue {
  file: string;
  line?: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

class WorkflowValidator {
  private issues: ValidationIssue[] = [];

  validateFile(filePath: string): void {
    const content = fs.readFileSync(filePath, 'utf-8');

    try {
      const workflow = parse(content);

      if (!workflow) {
        this.addIssue(filePath, 'error', 'Empty or invalid YAML file');
        return;
      }

      // Required fields
      if (!workflow.name) {
        this.addIssue(filePath, 'warning', 'Missing workflow name');
      }

      if (!workflow.on) {
        this.addIssue(filePath, 'error', 'Missing trigger (on:)');
      }

      if (!workflow.jobs) {
        this.addIssue(filePath, 'error', 'No jobs defined');
        return;
      }

      // Check each job
      Object.entries(workflow.jobs).forEach(([jobName, job]: [string, any]) => {
        this.validateJob(filePath, jobName, job);
      });

      // Check for common issues
      this.checkCommonIssues(filePath, workflow);

    } catch (error: any) {
      this.addIssue(filePath, 'error', `YAML parse error: ${error.message}`);
    }
  }

  private validateJob(file: string, name: string, job: any): void {
    if (!job['runs-on']) {
      this.addIssue(file, 'error', `Job '${name}' missing runs-on`);
    }

    if (!job.steps || job.steps.length === 0) {
      this.addIssue(file, 'error', `Job '${name}' has no steps`);
    }

    // Check each step
    job.steps?.forEach((step: any, index: number) => {
      if (!step.uses && !step.run) {
        this.addIssue(
          file,
          'error',
          `Job '${name}', step ${index + 1}: Must have 'uses' or 'run'`
        );
      }

      if (!step.name) {
        this.addIssue(
          file,
          'info',
          `Job '${name}', step ${index + 1}: Consider adding a name for clarity`
        );
      }
    });
  }

  private checkCommonIssues(file: string, workflow: any): void {
    const content = JSON.stringify(workflow);

    // Check for missing caching
    if (content.includes('npm install') && !content.includes('cache')) {
      this.addIssue(
        file,
        'warning',
        'Using npm install without caching',
        'Add cache: "npm" to actions/setup-node or use actions/cache'
      );
    }

    // Check for hardcoded secrets
    if (content.match(/['\"]?[A-Za-z0-9]{20,}['\"]?/) && !content.includes('secrets.')) {
      this.addIssue(
        file,
        'warning',
        'Possible hardcoded secret detected',
        'Use ${{ secrets.SECRET_NAME }} instead'
      );
    }

    // Check for npm install vs npm ci
    if (content.includes('npm install') && !content.includes('npm ci')) {
      this.addIssue(
        file,
        'info',
        'Consider using npm ci instead of npm install',
        'npm ci is faster and more reliable in CI environments'
      );
    }

    // Check for checkout action version
    if (content.includes('actions/checkout@v1') || content.includes('actions/checkout@v2')) {
      this.addIssue(
        file,
        'warning',
        'Using outdated actions/checkout version',
        'Update to actions/checkout@v3 or later'
      );
    }

    // Check for missing dependency on job
    Object.entries(workflow.jobs).forEach(([jobName, job]: [string, any]) => {
      if (job.needs && !Array.isArray(job.needs)) {
        const dependency = job.needs as string;
        if (!workflow.jobs[dependency]) {
          this.addIssue(
            file,
            'error',
            `Job '${jobName}' depends on non-existent job '${dependency}'`
          );
        }
      }
    });

    // Check for matrix without strategy
    if (content.includes('matrix.') && !content.includes('strategy:')) {
      this.addIssue(
        file,
        'error',
        'Using matrix variable without strategy.matrix defined'
      );
    }

    // Check for environment secrets without environment
    Object.entries(workflow.jobs).forEach(([jobName, job]: [string, any]) => {
      const jobStr = JSON.stringify(job);
      if (jobStr.includes('secrets.') && !job.environment) {
        this.addIssue(
          file,
          'info',
          `Job '${jobName}' uses secrets but no environment specified`,
          'Consider using environment for better secret management'
        );
      }
    });
  }

  private addIssue(
    file: string,
    severity: ValidationIssue['severity'],
    message: string,
    suggestion?: string
  ): void {
    this.issues.push({ file, severity, message, suggestion });
  }

  report(): void {
    if (this.issues.length === 0) {
      console.log('✅ No issues found!');
      return;
    }

    const errors = this.issues.filter(i => i.severity === 'error');
    const warnings = this.issues.filter(i => i.severity === 'warning');
    const info = this.issues.filter(i => i.severity === 'info');

    console.log(`\n📋 Workflow Validation Report\n`);
    console.log(`Found ${errors.length} errors, ${warnings.length} warnings, ${info.length} suggestions\n`);

    const printIssues = (issues: ValidationIssue[], icon: string) => {
      if (issues.length === 0) return;

      issues.forEach(issue => {
        console.log(`${icon} ${issue.file}`);
        console.log(`  ${issue.message}`);
        if (issue.suggestion) {
          console.log(`  💡 ${issue.suggestion}`);
        }
        console.log('');
      });
    };

    if (errors.length > 0) {
      console.log('🚨 Errors:\n');
      printIssues(errors, '❌');
    }

    if (warnings.length > 0) {
      console.log('⚠️  Warnings:\n');
      printIssues(warnings, '⚠️ ');
    }

    if (info.length > 0) {
      console.log('💡 Suggestions:\n');
      printIssues(info, 'ℹ️ ');
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
    console.log('Usage: npx tsx workflow_validator.ts <workflow-file>');
    console.log('\nExamples:');
    console.log('  npx tsx workflow_validator.ts .github/workflows/ci.yml');
    console.log('  npx tsx workflow_validator.ts .github/workflows/*.yml');
    process.exit(1);
  }

  const validator = new WorkflowValidator();

  args.forEach(pattern => {
    // Handle glob patterns
    if (pattern.includes('*')) {
      const dir = path.dirname(pattern);
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
      files.forEach(file => {
        validator.validateFile(path.join(dir, file));
      });
    } else {
      if (!fs.existsSync(pattern)) {
        console.error(`❌ File not found: ${pattern}`);
        process.exit(1);
      }
      validator.validateFile(pattern);
    }
  });

  validator.report();
}

export { WorkflowValidator };
