"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WorkflowTimeline;
var react_1 = require("react");
var WorkflowTimeline_module_css_1 = require("./WorkflowTimeline.module.css");
var phases = [
    {
        phase: 1,
        skill: 'skill-documentarian',
        role: 'Quality Assurance',
        duration: '~15 minutes',
        outcome: 'Reviewed cv-creator skill and found 3 critical issues',
        actions: [
            'Verified SkillHeader component usage',
            'Generated hero image via Ideogram (Windows 3.1/vaporwave, 16:9, 1.0MB)',
            'Created skill ZIP download (8.5KB)',
            'Added cv-creator to skills.ts registry line 65'
        ],
        metrics: {
            filesModified: 3,
            issuesFound: 3,
            issuesFixed: 3
        }
    },
    {
        phase: 2,
        skill: 'skill-coach',
        role: 'Skill Architect',
        duration: '~30 minutes',
        outcome: 'Built site-reliability-engineer skill with shibboleths and anti-patterns',
        actions: [
            'Designed skill with shibboleths encoding expert vs novice knowledge',
            'Created validate-liquid.js (detects unescaped {{ ... }} in MDX)',
            'Created validate-brackets.js (finds unescaped <digit and >digit)',
            'Created validate-skill-props.js (validates SkillHeader props)',
            'Wrote 789-line SKILL.md with decision trees and activation keywords',
            'Documented anti-patterns: full build validation, manual cache clearing'
        ],
        metrics: {
            filesCreated: 4,
            linesOfCode: 789
        }
    },
    {
        phase: 3,
        skill: 'site-reliability-engineer',
        role: 'Validation Guardian',
        duration: '~10 minutes',
        outcome: 'Integrated validation into git hooks and prebuild workflow',
        actions: [
            'Copied validation scripts to website/scripts/',
            'Updated package.json with validation scripts',
            'Created install-git-hooks.js script to generate pre-commit hook',
            'Installed pre-commit hook at .git/hooks/pre-commit',
            'Integrated validate:all into prebuild workflow',
            'Caught and fixed >10MB angle bracket in artifact-contribution-guide.md',
            'Validated all 45 skill documentation files successfully'
        ],
        metrics: {
            errorsDetected: 1,
            filesValidated: 45
        }
    }
];
function WorkflowTimeline() {
    return (<div className={WorkflowTimeline_module_css_1.default.container}>
      <div className={WorkflowTimeline_module_css_1.default.header}>
        <h2 className={WorkflowTimeline_module_css_1.default.title}>
          <span className={WorkflowTimeline_module_css_1.default.titleGradient}>Multi-Skill Orchestration</span>
        </h2>
        <p className={WorkflowTimeline_module_css_1.default.subtitle}>
          Three skills working together to build reliable deployments
        </p>
      </div>

      <div className={WorkflowTimeline_module_css_1.default.timeline}>
        {phases.map(function (phase, index) { return (<div key={phase.phase} className={WorkflowTimeline_module_css_1.default.phaseContainer}>
            {/* Connecting Line */}
            {index < phases.length - 1 && (<div className={WorkflowTimeline_module_css_1.default.connector}/>)}

            {/* Phase Card - Static, always expanded */}
            <div className={WorkflowTimeline_module_css_1.default.phaseCard}>
              {/* Header */}
              <div className={WorkflowTimeline_module_css_1.default.phaseHeader}>
                <div className={WorkflowTimeline_module_css_1.default.phaseNumber}>
                  <span className={WorkflowTimeline_module_css_1.default.phaseNumberText}>Phase {phase.phase}</span>
                </div>

                <div className={WorkflowTimeline_module_css_1.default.phaseInfo}>
                  <div className={WorkflowTimeline_module_css_1.default.skillName}>{phase.skill}</div>
                  <div className={WorkflowTimeline_module_css_1.default.role}>{phase.role}</div>
                </div>

                <div className={WorkflowTimeline_module_css_1.default.duration}>
                  <span className={WorkflowTimeline_module_css_1.default.durationIcon}>⏱</span>
                  {phase.duration}
                </div>
              </div>

              {/* Outcome Summary */}
              <div className={WorkflowTimeline_module_css_1.default.outcome}>
                <div className={WorkflowTimeline_module_css_1.default.outcomeIcon}>✓</div>
                <div className={WorkflowTimeline_module_css_1.default.outcomeText}>{phase.outcome}</div>
              </div>

              {/* Metrics */}
              {phase.metrics && (<div className={WorkflowTimeline_module_css_1.default.metrics}>
                  {Object.entries(phase.metrics).map(function (_a) {
                    var key = _a[0], value = _a[1];
                    return (<div key={key} className={WorkflowTimeline_module_css_1.default.metric}>
                      <div className={WorkflowTimeline_module_css_1.default.metricValue}>{value}</div>
                      <div className={WorkflowTimeline_module_css_1.default.metricLabel}>
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </div>
                    </div>);
                })}
                </div>)}

              {/* Details - Always shown */}
              <div className={WorkflowTimeline_module_css_1.default.details}>
                <div className={WorkflowTimeline_module_css_1.default.actionsHeader}>Actions Taken:</div>
                <ul className={WorkflowTimeline_module_css_1.default.actionsList}>
                  {phase.actions.map(function (action, i) { return (<li key={i} className={WorkflowTimeline_module_css_1.default.action}>
                      <span className={WorkflowTimeline_module_css_1.default.actionBullet}>▸</span>
                      <span className={WorkflowTimeline_module_css_1.default.actionText}>{action}</span>
                    </li>); })}
                </ul>
              </div>
            </div>
          </div>); })}
      </div>

      {/* Summary Stats */}
      <div className={WorkflowTimeline_module_css_1.default.summary}>
        <div className={WorkflowTimeline_module_css_1.default.summaryCard}>
          <div className={WorkflowTimeline_module_css_1.default.summaryTitle}>Total Impact</div>
          <div className={WorkflowTimeline_module_css_1.default.summaryStats}>
            <div className={WorkflowTimeline_module_css_1.default.summaryStat}>
              <div className={WorkflowTimeline_module_css_1.default.summaryStatValue}>~55 min</div>
              <div className={WorkflowTimeline_module_css_1.default.summaryStatLabel}>Duration</div>
            </div>
            <div className={WorkflowTimeline_module_css_1.default.summaryStat}>
              <div className={WorkflowTimeline_module_css_1.default.summaryStatValue}>3</div>
              <div className={WorkflowTimeline_module_css_1.default.summaryStatLabel}>Skills</div>
            </div>
            <div className={WorkflowTimeline_module_css_1.default.summaryStat}>
              <div className={WorkflowTimeline_module_css_1.default.summaryStatValue}>3</div>
              <div className={WorkflowTimeline_module_css_1.default.summaryStatLabel}>Validators</div>
            </div>
            <div className={WorkflowTimeline_module_css_1.default.summaryStat}>
              <div className={WorkflowTimeline_module_css_1.default.summaryStatValue}>100%</div>
              <div className={WorkflowTimeline_module_css_1.default.summaryStatLabel}>Prevention</div>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
