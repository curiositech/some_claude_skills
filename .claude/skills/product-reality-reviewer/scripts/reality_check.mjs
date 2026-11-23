#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function getPath(object, path) {
  return path.split('.').reduce((current, part) => (current ? current[part] : undefined), object);
}

function finding(id, severity, question, path, recommendation) {
  return { id, severity, question, path, recommendation };
}

const CHECKS = [
  ['target-users', 'must-fix-before-build', 'Who is the product for?', 'targetUsers', 'Name primary users and excluded users.'],
  ['first-value', 'must-fix-before-build', 'What value appears before perfect setup?', 'firstRun.firstValue', 'Add a first-value moment before advanced configuration.'],
  ['empty-state', 'can-build-with-risk', 'What does the empty state teach?', 'firstRun.emptyState', 'Define the empty state and next action.'],
  ['account-creation', 'must-fix-before-build', 'How do users create an account?', 'account.creation', 'Define signup, signin, recovery, deletion, and team invite paths.'],
  ['provider-fallback', 'must-fix-before-build', 'What if the user has no Claude Max, OpenAI Pro, local model, or MCP?', 'providerAccess.fallback', 'Add demo, mock, routed-provider, local, or bring-your-own-key fallback.'],
  ['credential-ux', 'can-build-with-risk', 'How does the user connect credentials without terminal work?', 'providerAccess.credentialUx', 'Add guided credential UI or deeplinked setup.'],
  ['permissions', 'must-fix-before-build', 'What can the agent touch?', 'trust.permissions', 'Name permissions and human approval boundaries.'],
  ['receipts', 'must-fix-before-build', 'Where are receipts, transcripts, diffs, and costs?', 'trust.receipts', 'Add user-visible receipts and audit artifacts.'],
  ['support', 'can-build-with-risk', 'How does support diagnose a failed run?', 'support.path', 'Add transcript export, feedback, or incident capture.'],
  ['pricing-cost', 'can-build-with-risk', 'How are pricing and model costs explained?', 'business.pricing', 'State pricing, budget, or spend-control assumptions.'],
];

function checkIsMissing(manifest, id, path) {
  const value = getPath(manifest, path);
  if (id === 'target-users') {
    return !Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== 'string' || item.trim() === '');
  }
  return !hasValue(value);
}

export function reviewProductReality(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error('product reality manifest must be an object');
  }
  if (!manifest.name) {
    throw new Error('manifest.name is required');
  }

  const findings = CHECKS.filter(([id, , , path]) => checkIsMissing(manifest, id, path)).map(([id, severity, question, path, recommendation]) =>
    finding(id, severity, question, path, recommendation),
  );

  const agentFindings = [];
  const agentActions = Array.isArray(manifest.agentActions) ? manifest.agentActions : [];
  agentActions.forEach((action, index) => {
    if (!hasValue(action.approval)) {
      agentFindings.push(finding(`agent-${index}-approval`, 'must-fix-before-build', 'Who approves this agent action?', `agentActions[${index}].approval`, 'Add human gate or scoped automatic permission.'));
    }
    if (!hasValue(action.rollback)) {
      agentFindings.push(finding(`agent-${index}-rollback`, 'must-fix-before-build', 'How does the user undo this agent action?', `agentActions[${index}].rollback`, 'Add rollback, revert, or sandbox discard path.'));
    }
  });

  const allFindings = [...findings, ...agentFindings];
  const mustFix = allFindings.filter((item) => item.severity === 'must-fix-before-build');
  const canBuildWithRisk = allFindings.filter((item) => item.severity === 'can-build-with-risk');
  const verdict = mustFix.length > 0 ? 'not-ready' : canBuildWithRisk.length > 0 ? 'build-with-risk' : 'build-ready';

  return {
    name: manifest.name,
    verdict,
    summary: {
      findingCount: allFindings.length,
      mustFixCount: mustFix.length,
      riskCount: canBuildWithRisk.length,
    },
    mustFix,
    canBuildWithRisk,
    watchAfterLaunch: allFindings.filter((item) => item.severity === 'watch-after-launch'),
    missingQuestions: allFindings.map((item) => item.question),
  };
}

function parseArgs(argv) {
  const inputIndex = argv.indexOf('--input');
  if (inputIndex === -1 || !argv[inputIndex + 1]) {
    throw new Error('usage: reality_check.mjs --input product.json');
  }
  return { input: argv[inputIndex + 1] };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const { input } = parseArgs(process.argv.slice(2));
  const manifest = JSON.parse(readFileSync(input, 'utf8'));
  process.stdout.write(`${JSON.stringify(reviewProductReality(manifest), null, 2)}\n`);
}
