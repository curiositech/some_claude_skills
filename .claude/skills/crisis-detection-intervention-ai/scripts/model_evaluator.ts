#!/usr/bin/env node
/**
 * Crisis Detection Model Evaluator
 *
 * Evaluates crisis detection accuracy using test cases with ground truth labels.
 *
 * Usage: npx tsx model_evaluator.ts [test-cases.json]
 *
 * Test Case Format:
 * [
 *   {
 *     "text": "I don't want to be here anymore",
 *     "expected_severity": "high",
 *     "expected_signals": ["suicidal_ideation"]
 *   }
 * ]
 *
 * Metrics:
 *   - Precision: Of all detected crises, how many were actual crises?
 *   - Recall: Of all actual crises, how many did we detect?
 *   - F1 Score: Harmonic mean of precision and recall
 *   - Confusion Matrix: True/false positives/negatives
 */

import { CrisisDetector, CrisisDetection, CrisisSignal } from './crisis_detector';
import * as fs from 'fs';

interface TestCase {
  text: string;
  expected_severity: 'none' | 'low' | 'medium' | 'high' | 'immediate';
  expected_signals: string[];
  description?: string;
}

interface EvaluationResult {
  testCase: TestCase;
  detection: CrisisDetection;
  severityMatch: boolean;
  signalsMatch: boolean;
  truePositive: boolean;
  falsePositive: boolean;
  trueNegative: boolean;
  falseNegative: boolean;
}

interface Metrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
  };
  severityAccuracy: number;
  signalAccuracy: number;
}

class ModelEvaluator {
  private detector: CrisisDetector;

  constructor() {
    this.detector = new CrisisDetector();
  }

  /**
   * Load test cases from JSON file
   */
  loadTestCases(filePath: string): TestCase[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Evaluate model on test cases
   */
  evaluate(testCases: TestCase[]): EvaluationResult[] {
    const results: EvaluationResult[] = [];

    for (const testCase of testCases) {
      const detection = this.detector.detect(testCase.text);

      const severityMatch = detection.severity === testCase.expected_severity;

      // Check if detected signals match expected signals
      const detectedTypes = new Set(detection.signals.map(s => s.type));
      const expectedTypes = new Set(testCase.expected_signals);
      const signalsMatch = this.setsEqual(detectedTypes, expectedTypes);

      // Classify result for confusion matrix
      const actualCrisis = testCase.expected_severity !== 'none';
      const detectedCrisis = detection.isCrisis;

      const truePositive = actualCrisis && detectedCrisis;
      const falsePositive = !actualCrisis && detectedCrisis;
      const trueNegative = !actualCrisis && !detectedCrisis;
      const falseNegative = actualCrisis && !detectedCrisis;

      results.push({
        testCase,
        detection,
        severityMatch,
        signalsMatch,
        truePositive,
        falsePositive,
        trueNegative,
        falseNegative
      });
    }

    return results;
  }

  /**
   * Calculate metrics from evaluation results
   */
  calculateMetrics(results: EvaluationResult[]): Metrics {
    const tp = results.filter(r => r.truePositive).length;
    const fp = results.filter(r => r.falsePositive).length;
    const tn = results.filter(r => r.trueNegative).length;
    const fn = results.filter(r => r.falseNegative).length;

    const accuracy = (tp + tn) / results.length;
    const precision = tp > 0 ? tp / (tp + fp) : 0;
    const recall = tp > 0 ? tp / (tp + fn) : 0;
    const f1Score = precision + recall > 0
      ? 2 * (precision * recall) / (precision + recall)
      : 0;

    const severityMatches = results.filter(r => r.severityMatch).length;
    const severityAccuracy = severityMatches / results.length;

    const signalMatches = results.filter(r => r.signalsMatch).length;
    const signalAccuracy = signalMatches / results.length;

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      confusionMatrix: {
        truePositives: tp,
        falsePositives: fp,
        trueNegatives: tn,
        falseNegatives: fn
      },
      severityAccuracy,
      signalAccuracy
    };
  }

  /**
   * Generate evaluation report
   */
  generateReport(results: EvaluationResult[], metrics: Metrics): string {
    let report = '\n📊 Crisis Detection Model Evaluation\n';
    report += '═'.repeat(80) + '\n\n';

    // Overall Metrics
    report += '## Overall Metrics\n\n';
    report += `Accuracy:  ${(metrics.accuracy * 100).toFixed(1)}%\n`;
    report += `Precision: ${(metrics.precision * 100).toFixed(1)}%\n`;
    report += `Recall:    ${(metrics.recall * 100).toFixed(1)}%\n`;
    report += `F1 Score:  ${(metrics.f1Score * 100).toFixed(1)}%\n\n`;

    // Confusion Matrix
    report += '## Confusion Matrix\n\n';
    report += '                Predicted\n';
    report += '              Crisis  Safe\n';
    report += `Actual Crisis   ${metrics.confusionMatrix.truePositives.toString().padStart(3)}    ${metrics.confusionMatrix.falseNegatives.toString().padStart(3)}\n`;
    report += `       Safe     ${metrics.confusionMatrix.falsePositives.toString().padStart(3)}    ${metrics.confusionMatrix.trueNegatives.toString().padStart(3)}\n\n`;

    // Detailed Metrics
    report += '## Detailed Metrics\n\n';
    report += `Severity Accuracy: ${(metrics.severityAccuracy * 100).toFixed(1)}%\n`;
    report += `Signal Accuracy:   ${(metrics.signalAccuracy * 100).toFixed(1)}%\n\n`;

    // False Negatives (Most Critical)
    report += '## ⚠️  False Negatives (Missed Crises)\n\n';
    const falseNegatives = results.filter(r => r.falseNegative);
    if (falseNegatives.length > 0) {
      falseNegatives.forEach((result, i) => {
        report += `${i + 1}. "${result.testCase.text}"\n`;
        report += `   Expected: ${result.testCase.expected_severity} | Detected: ${result.detection.severity}\n`;
        report += `   Expected Signals: ${result.testCase.expected_signals.join(', ')}\n`;
        report += `   Detected Signals: ${result.detection.signals.map(s => s.type).join(', ') || 'none'}\n\n`;
      });
    } else {
      report += 'None ✅\n\n';
    }

    // False Positives
    report += '## 🚨 False Positives (False Alarms)\n\n';
    const falsePositives = results.filter(r => r.falsePositive);
    if (falsePositives.length > 0) {
      falsePositives.forEach((result, i) => {
        report += `${i + 1}. "${result.testCase.text}"\n`;
        report += `   Expected: ${result.testCase.expected_severity} | Detected: ${result.detection.severity}\n`;
        report += `   Confidence: ${(result.detection.confidence * 100).toFixed(1)}%\n\n`;
      });
    } else {
      report += 'None ✅\n\n';
    }

    // Severity Breakdown
    report += '## Severity Level Performance\n\n';
    const severityLevels: Array<'none' | 'low' | 'medium' | 'high' | 'immediate'> =
      ['none', 'low', 'medium', 'high', 'immediate'];

    severityLevels.forEach(level => {
      const casesAtLevel = results.filter(r => r.testCase.expected_severity === level);
      if (casesAtLevel.length > 0) {
        const correctAtLevel = casesAtLevel.filter(r => r.severityMatch).length;
        const accuracy = (correctAtLevel / casesAtLevel.length * 100).toFixed(1);
        report += `${level.toUpperCase().padEnd(10)} ${correctAtLevel}/${casesAtLevel.length} (${accuracy}%)\n`;
      }
    });

    report += '\n';

    // Recommendations
    report += '## 💡 Recommendations\n\n';

    if (metrics.recall < 0.9) {
      report += '• ⚠️  CRITICAL: Recall is below 90%. Missing real crises.\n';
      report += '  → Lower detection threshold or add more keyword patterns\n\n';
    }

    if (metrics.precision < 0.7) {
      report += '• False positive rate is high (>30%)\n';
      report += '  → Increase confidence threshold or refine keyword patterns\n\n';
    }

    if (falseNegatives.length > 0) {
      report += `• Review ${falseNegatives.length} false negative(s) and add missing patterns\n\n`;
    }

    if (metrics.severityAccuracy < 0.8) {
      report += '• Severity classification needs improvement\n';
      report += '  → Review severity calculation logic\n\n';
    }

    return report;
  }

  /**
   * Helper: Check if two sets are equal
   */
  private setsEqual<T>(set1: Set<T>, set2: Set<T>): boolean {
    if (set1.size !== set2.size) return false;
    for (const item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  }

  /**
   * Export results to JSON
   */
  exportResults(results: EvaluationResult[], outputPath: string): void {
    const output = {
      timestamp: new Date().toISOString(),
      total_cases: results.length,
      results: results.map(r => ({
        text: r.testCase.text,
        expected: {
          severity: r.testCase.expected_severity,
          signals: r.testCase.expected_signals
        },
        detected: {
          severity: r.detection.severity,
          signals: r.detection.signals.map(s => s.type),
          confidence: r.detection.confidence
        },
        correct: r.severityMatch && r.signalsMatch
      }))
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\n✅ Results exported to ${outputPath}`);
  }
}

// Default test cases
const DEFAULT_TEST_CASES: TestCase[] = [
  // Suicidal ideation - high severity
  {
    text: "I don't want to be here anymore",
    expected_severity: 'high',
    expected_signals: ['suicidal_ideation'],
    description: 'Clear suicidal ideation'
  },
  {
    text: "I'm thinking about ending it all",
    expected_severity: 'high',
    expected_signals: ['suicidal_ideation'],
    description: 'Explicit suicidal thoughts'
  },
  {
    text: "Everyone would be better off without me",
    expected_severity: 'high',
    expected_signals: ['suicidal_ideation'],
    description: 'Suicidal ideation with perceived burden'
  },

  // Self-harm
  {
    text: "I cut myself last night",
    expected_severity: 'high',
    expected_signals: ['self_harm'],
    description: 'Self-harm disclosure'
  },

  // Substance relapse
  {
    text: "I relapsed today after 6 months sober",
    expected_severity: 'medium',
    expected_signals: ['substance_relapse'],
    description: 'Substance relapse'
  },
  {
    text: "The cravings are too strong, I can't resist",
    expected_severity: 'medium',
    expected_signals: ['substance_relapse'],
    description: 'Strong cravings indicating risk'
  },

  // Severe distress (no specific crisis)
  {
    text: "I feel so hopeless and alone, nothing matters anymore",
    expected_severity: 'medium',
    expected_signals: ['severe_distress'],
    description: 'Severe distress with hopelessness'
  },

  // Normal distress - should NOT trigger crisis
  {
    text: "Had a tough day at work, feeling stressed",
    expected_severity: 'none',
    expected_signals: [],
    description: 'Normal work stress'
  },
  {
    text: "Feeling a bit down today",
    expected_severity: 'none',
    expected_signals: [],
    description: 'Mild sadness'
  },
  {
    text: "I'm tired of this project, it's taking forever",
    expected_severity: 'none',
    expected_signals: [],
    description: 'Frustration (not crisis)'
  },

  // Edge cases
  {
    text: "I want to kill this bug in my code",
    expected_severity: 'none',
    expected_signals: [],
    description: 'False positive test: coding language'
  },
  {
    text: "This movie is killing me, so funny!",
    expected_severity: 'none',
    expected_signals: [],
    description: 'False positive test: figurative language'
  },

  // With protective factors
  {
    text: "Having dark thoughts but I called my therapist and have a safety plan",
    expected_severity: 'low',
    expected_signals: ['severe_distress'],
    description: 'Crisis with protective factors'
  }
];

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);

  let testCases: TestCase[];
  const evaluator = new ModelEvaluator();

  if (args.length > 0) {
    // Load test cases from file
    const filePath = args[0];
    console.log(`\n📂 Loading test cases from ${filePath}...`);
    testCases = evaluator.loadTestCases(filePath);
  } else {
    // Use default test cases
    console.log('\n📝 Using default test cases...');
    testCases = DEFAULT_TEST_CASES;
  }

  console.log(`\n🧪 Evaluating model on ${testCases.length} test cases...\n`);

  // Run evaluation
  const results = evaluator.evaluate(testCases);
  const metrics = evaluator.calculateMetrics(results);

  // Generate and display report
  const report = evaluator.generateReport(results, metrics);
  console.log(report);

  // Export results if requested
  if (args.includes('--export')) {
    const outputPath = args.includes('--output')
      ? args[args.indexOf('--output') + 1]
      : 'evaluation-results.json';
    evaluator.exportResults(results, outputPath);
  }

  // Exit with error code if recall is too low (missing real crises)
  if (metrics.recall < 0.9) {
    console.log('❌ CRITICAL: Recall below 90%. Model is missing real crises.\n');
    process.exit(1);
  }

  console.log('✅ Evaluation complete.\n');
}

export { ModelEvaluator, TestCase, EvaluationResult, Metrics };
