#!/usr/bin/env node
/**
 * GitHub Actions Usage Analyzer
 *
 * Analyzes workflows to find outdated actions and suggest updates.
 *
 * Usage: npx tsx action_usage_analyzer.ts [workflow-dir]
 *
 * Examples:
 *   npx tsx action_usage_analyzer.ts .github/workflows
 *
 * Dependencies: npm install yaml
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'yaml';

interface ActionUsage {
  action: string;
  version: string;
  file: string;
  count: number;
}

interface UpdateSuggestion {
  action: string;
  currentVersion: string;
  latestVersion: string;
  breaking: boolean;
  notes?: string;
}

// Known action versions (as of Jan 2024)
const LATEST_VERSIONS: Record<string, { version: string; breaking?: boolean; notes?: string }> = {
  'actions/checkout': {
    version: 'v4',
    breaking: false,
    notes: 'v4 uses Node.js 20'
  },
  'actions/setup-node': {
    version: 'v4',
    breaking: false,
    notes: 'v4 uses Node.js 20'
  },
  'actions/setup-python': {
    version: 'v5',
    breaking: false
  },
  'actions/cache': {
    version: 'v4',
    breaking: false
  },
  'actions/upload-artifact': {
    version: 'v4',
    breaking: true,
    notes: 'v4 changes artifact retention and download behavior'
  },
  'actions/download-artifact': {
    version: 'v4',
    breaking: true,
    notes: 'v4 changes download location and naming'
  },
  'docker/build-push-action': {
    version: 'v5',
    breaking: false
  },
  'docker/login-action': {
    version: 'v3',
    breaking: false
  },
  'codecov/codecov-action': {
    version: 'v4',
    breaking: false
  },
  'slackapi/slack-github-action': {
    version: 'v1.25',
    breaking: false
  }
};

class ActionUsageAnalyzer {
  private usages: Map<string, ActionUsage[]> = new Map();
  private suggestions: UpdateSuggestion[] = [];

  analyzeDirectory(dir: string): void {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      if (file.endsWith('.yml') || file.endsWith('.yaml')) {
        this.analyzeFile(path.join(dir, file));
      }
    });
  }

  analyzeFile(filePath: string): void {
    const content = fs.readFileSync(filePath, 'utf-8');

    try {
      const workflow = parse(content);

      if (!workflow?.jobs) return;

      Object.entries(workflow.jobs).forEach(([_, job]: [string, any]) => {
        job.steps?.forEach((step: any) => {
          if (step.uses) {
            this.recordAction(step.uses, filePath);
          }
        });
      });
    } catch (error) {
      console.error(`Failed to parse ${filePath}:`, error);
    }
  }

  private recordAction(usesString: string, file: string): void {
    // Parse action@version format
    const match = usesString.match(/^([^@]+)@(.+)$/);
    if (!match) return;

    const [, action, version] = match;

    if (!this.usages.has(action)) {
      this.usages.set(action, []);
    }

    const existing = this.usages.get(action)!.find(
      u => u.version === version && u.file === file
    );

    if (existing) {
      existing.count++;
    } else {
      this.usages.get(action)!.push({
        action,
        version,
        file,
        count: 1
      });
    }

    // Check if update available
    const latest = LATEST_VERSIONS[action];
    if (latest && version !== latest.version) {
      const existingSuggestion = this.suggestions.find(
        s => s.action === action && s.currentVersion === version
      );

      if (!existingSuggestion) {
        this.suggestions.push({
          action,
          currentVersion: version,
          latestVersion: latest.version,
          breaking: latest.breaking || false,
          notes: latest.notes
        });
      }
    }
  }

  report(): void {
    console.log('\n📊 GitHub Actions Usage Report\n');
    console.log('─'.repeat(70));

    // Group by action
    const actions = Array.from(this.usages.keys()).sort();

    if (actions.length === 0) {
      console.log('No actions found in workflows.');
      return;
    }

    console.log('\nActions Used:\n');

    actions.forEach(action => {
      const usages = this.usages.get(action)!;
      const totalCount = usages.reduce((sum, u) => sum + u.count, 0);

      console.log(`📦 ${action}`);

      // Group by version
      const versionMap = new Map<string, number>();
      usages.forEach(u => {
        versionMap.set(u.version, (versionMap.get(u.version) || 0) + u.count);
      });

      versionMap.forEach((count, version) => {
        const latest = LATEST_VERSIONS[action];
        const isLatest = latest && version === latest.version;
        const icon = isLatest ? '✅' : '⚠️ ';
        console.log(`  ${icon} ${version} (${count} usage${count > 1 ? 's' : ''})`);
      });

      console.log('');
    });

    // Update suggestions
    if (this.suggestions.length > 0) {
      console.log('─'.repeat(70));
      console.log('\n💡 Update Suggestions:\n');

      this.suggestions.forEach(suggestion => {
        const icon = suggestion.breaking ? '🔴' : '🟢';
        console.log(`${icon} ${suggestion.action}`);
        console.log(`  Current: ${suggestion.currentVersion}`);
        console.log(`  Latest:  ${suggestion.latestVersion}`);

        if (suggestion.breaking) {
          console.log('  ⚠️  Breaking changes - review migration guide');
        }

        if (suggestion.notes) {
          console.log(`  ℹ️  ${suggestion.notes}`);
        }

        console.log('');
      });

      console.log('─'.repeat(70));
      console.log('\nTo update an action:');
      console.log('  Replace: uses: actions/checkout@v3');
      console.log('  With:    uses: actions/checkout@v4');
    } else {
      console.log('✅ All actions are up to date!\n');
    }

    // Security notes
    console.log('\n🔒 Security Best Practices:\n');
    console.log('  • Pin actions to specific SHA for security:');
    console.log('    uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1');
    console.log('  • Use Dependabot to auto-update actions:');
    console.log('    Create .github/dependabot.yml with github-actions ecosystem');
    console.log('');
  }

  generateDependabotConfig(): string {
    return `# .github/dependabot.yml
# Auto-update GitHub Actions

version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "github-actions"
`;
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const dir = args[0] || '.github/workflows';

  if (!fs.existsSync(dir)) {
    console.error(`❌ Directory not found: ${dir}`);
    console.error('\nUsage: npx tsx action_usage_analyzer.ts [workflow-dir]');
    console.error('Example: npx tsx action_usage_analyzer.ts .github/workflows');
    process.exit(1);
  }

  const analyzer = new ActionUsageAnalyzer();
  analyzer.analyzeDirectory(dir);
  analyzer.report();

  // Offer to create Dependabot config
  if (args.includes('--create-dependabot')) {
    const config = analyzer.generateDependabotConfig();
    const configPath = '.github/dependabot.yml';

    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, config);

    console.log(`✅ Created ${configPath}`);
  }
}

export { ActionUsageAnalyzer };
