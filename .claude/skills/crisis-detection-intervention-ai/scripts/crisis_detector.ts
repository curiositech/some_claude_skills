#!/usr/bin/env node
/**
 * Crisis Detection System
 *
 * Real-time mental health crisis detection using multiple signals.
 *
 * Usage: npx tsx crisis_detector.ts [text]
 *
 * Examples:
 *   npx tsx crisis_detector.ts "I don't want to be here anymore"
 *   npx tsx crisis_detector.ts "Had a tough day at work"
 *
 * Signals:
 *   - NLP model classification
 *   - Keyword pattern matching
 *   - Sentiment + context analysis
 */

interface CrisisSignal {
  type: 'suicidal_ideation' | 'self_harm' | 'substance_relapse' | 'severe_distress';
  confidence: number;
  evidence: string[];
  source: 'nlp' | 'keywords' | 'sentiment' | 'context';
}

interface CrisisDetection {
  isCrisis: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'immediate';
  signals: CrisisSignal[];
  confidence: number;
  recommendations: string[];
}

// Crisis keywords (evidence-based patterns)
const CRISIS_PATTERNS = {
  suicidal_ideation: [
    /\b(kill|end|take)\s+(my|own)\s+life\b/i,
    /\bsuicide\b/i,
    /\bdon'?t\s+want\s+to\s+(live|be here|exist)\b/i,
    /\bbetter off dead\b/i,
    /\bno\s+reason\s+to\s+(live|continue|go on)\b/i,
    /\bcan'?t\s+(take|do)\s+this\s+anymore\b/i
  ],
  self_harm: [
    /\b(cut|cutting|hurt|hurting)\s+(myself|me)\b/i,
    /\bself[- ]harm\b/i,
    /\bburning\s+myself\b/i
  ],
  substance_relapse: [
    /\b(relapsed|used|drank)\s+(again|today|yesterday)\b/i,
    /\bback on\s+(drugs|alcohol|using)\b/i,
    /\bcouldn'?t\s+stay\s+sober\b/i,
    /\b(cravings?|urges?)\s+(are\s+)?too\s+strong\b/i
  ],
  hopelessness: [
    /\bno\s+(hope|point|reason|future)\b/i,
    /\bnothing\s+(matters|helps|works)\b/i,
    /\bcan'?t\s+see\s+a\s+way\s+out\b/i,
    /\ball\s+alone\b/i,
    /\bnobody\s+(cares|understands)\b/i
  ]
};

// Protective factors (reduce crisis severity)
const PROTECTIVE_PATTERNS = [
  /\b(therapist|counselor|support\s+group)\b/i,
  /\b(reaching\s+out|asking\s+for\s+help)\b/i,
  /\b(called|talked\s+to)\s+(friend|family|sponsor)\b/i,
  /\bsafety\s+plan\b/i
];

class CrisisDetector {
  /**
   * Detect crisis signals in text
   */
  detect(text: string): CrisisDetection {
    const signals: CrisisSignal[] = [];

    // Signal 1: Keyword matching
    const keywordSignals = this.detectKeywords(text);
    signals.push(...keywordSignals);

    // Signal 2: Sentiment analysis (simplified)
    const sentimentSignal = this.analyzeSentiment(text);
    if (sentimentSignal) {
      signals.push(sentimentSignal);
    }

    // Signal 3: Context analysis
    const contextSignal = this.analyzeContext(text);
    if (contextSignal) {
      signals.push(contextSignal);
    }

    // Check for protective factors
    const hasProtection = this.hasProtectiveFactors(text);

    // Calculate overall severity
    const severity = this.calculateSeverity(signals, hasProtection);
    const confidence = this.calculateConfidence(signals);

    // Generate recommendations
    const recommendations = this.generateRecommendations(severity, signals);

    return {
      isCrisis: severity !== 'none',
      severity,
      signals,
      confidence,
      recommendations
    };
  }

  private detectKeywords(text: string): CrisisSignal[] {
    const signals: CrisisSignal[] = [];

    for (const [type, patterns] of Object.entries(CRISIS_PATTERNS)) {
      const matches: string[] = [];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          matches.push(match[0]);
        }
      }

      if (matches.length > 0) {
        signals.push({
          type: type as CrisisSignal['type'],
          confidence: Math.min(0.6 + (matches.length * 0.1), 0.9),
          evidence: matches,
          source: 'keywords'
        });
      }
    }

    return signals;
  }

  private analyzeSentiment(text: string): CrisisSignal | null {
    // Simplified sentiment analysis
    const negativeWords = ['hate', 'pain', 'hurt', 'sad', 'miserable', 'awful', 'terrible'];
    const negativeCount = negativeWords.filter(word =>
      new RegExp(`\\b${word}\\b`, 'i').test(text)
    ).length;

    const totalWords = text.split(/\s+/).length;
    const negativeRatio = negativeCount / totalWords;

    if (negativeRatio > 0.2) {
      return {
        type: 'severe_distress',
        confidence: Math.min(negativeRatio * 3, 0.8),
        evidence: [`High negative sentiment: ${(negativeRatio * 100).toFixed(1)}%`],
        source: 'sentiment'
      };
    }

    return null;
  }

  private analyzeContext(text: string): CrisisSignal | null {
    // Check for hopelessness + negative sentiment
    const hasHopelessness = CRISIS_PATTERNS.hopelessness.some(pattern =>
      pattern.test(text)
    );

    const hasNegativeFuture = /\b(never|won'?t|can'?t)\s+(get|be)\s+better\b/i.test(text);

    if (hasHopelessness && hasNegativeFuture) {
      return {
        type: 'severe_distress',
        confidence: 0.75,
        evidence: ['Hopelessness + negative future outlook'],
        source: 'context'
      };
    }

    return null;
  }

  private hasProtectiveFactors(text: string): boolean {
    return PROTECTIVE_PATTERNS.some(pattern => pattern.test(text));
  }

  private calculateSeverity(
    signals: CrisisSignal[],
    hasProtection: boolean
  ): CrisisDetection['severity'] {
    if (signals.length === 0) {
      return 'none';
    }

    // Check for high-risk signals
    const hasSuicidalIdeation = signals.some(s =>
      s.type === 'suicidal_ideation' && s.confidence > 0.7
    );

    const hasSelfHarm = signals.some(s =>
      s.type === 'self_harm' && s.confidence > 0.6
    );

    const maxConfidence = Math.max(...signals.map(s => s.confidence));

    if (hasSuicidalIdeation && !hasProtection) {
      return maxConfidence > 0.85 ? 'immediate' : 'high';
    }

    if (hasSelfHarm || hasSuicidalIdeation) {
      return 'high';
    }

    if (signals.some(s => s.type === 'substance_relapse')) {
      return 'medium';
    }

    if (signals.some(s => s.type === 'severe_distress')) {
      return hasProtection ? 'low' : 'medium';
    }

    return 'low';
  }

  private calculateConfidence(signals: CrisisSignal[]): number {
    if (signals.length === 0) return 0;

    // Average confidence across all signals
    const avgConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;

    // Boost confidence if multiple signals agree
    const uniqueTypes = new Set(signals.map(s => s.type));
    const agreementBoost = signals.length > 1 ? 0.1 : 0;

    return Math.min(avgConfidence + agreementBoost, 1.0);
  }

  private generateRecommendations(
    severity: CrisisDetection['severity'],
    signals: CrisisSignal[]
  ): string[] {
    const recommendations: string[] = [];

    switch (severity) {
      case 'immediate':
      case 'high':
        recommendations.push('IMMEDIATE: Show 988 Suicide & Crisis Lifeline modal');
        recommendations.push('IMMEDIATE: Notify on-call crisis counselor');
        recommendations.push('IMMEDIATE: Log for urgent review');
        recommendations.push('Provide Crisis Text Line: 741741');
        break;

      case 'medium':
        recommendations.push('Show crisis resources in-app');
        recommendations.push('Flag for counselor review within 24 hours');
        recommendations.push('Suggest self-help coping strategies');
        break;

      case 'low':
        recommendations.push('Add to review queue (normal priority)');
        recommendations.push('Offer supportive resources');
        break;

      case 'none':
        recommendations.push('No action needed');
        break;
    }

    // Add signal-specific recommendations
    if (signals.some(s => s.type === 'substance_relapse')) {
      recommendations.push('Connect user to sponsor contact');
      recommendations.push('Suggest attending a meeting');
    }

    if (signals.some(s => s.type === 'self_harm')) {
      recommendations.push('Provide grounding techniques');
      recommendations.push('Suggest harm reduction resources');
    }

    return recommendations;
  }

  /**
   * Format detection result for display
   */
  format(detection: CrisisDetection): string {
    const severityEmoji = {
      none: '✅',
      low: '💛',
      medium: '🟠',
      high: '🔴',
      immediate: '🚨'
    };

    let output = `\n${severityEmoji[detection.severity]} Crisis Detection Result\n\n`;
    output += `Severity: ${detection.severity.toUpperCase()}\n`;
    output += `Confidence: ${(detection.confidence * 100).toFixed(1)}%\n`;
    output += `Is Crisis: ${detection.isCrisis ? 'YES' : 'NO'}\n\n`;

    if (detection.signals.length > 0) {
      output += 'Detected Signals:\n';
      detection.signals.forEach(signal => {
        output += `\n  • ${signal.type.replace(/_/g, ' ').toUpperCase()}\n`;
        output += `    Confidence: ${(signal.confidence * 100).toFixed(1)}%\n`;
        output += `    Source: ${signal.source}\n`;
        output += `    Evidence: ${signal.evidence.join(', ')}\n`;
      });
    }

    output += '\n─'.repeat(80) + '\n';
    output += '\nRecommended Actions:\n';
    detection.recommendations.forEach(rec => {
      output += `\n  ${rec}`;
    });

    output += '\n\n🔒 Privacy Note: All crisis detections must be:\n';
    output += '  • Stored encrypted\n';
    output += '  • Access-logged\n';
    output += '  • Auto-deleted after 30 days\n';
    output += '  • Reviewed by licensed professionals only\n';

    output += '\n';
    return output;
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: npx tsx crisis_detector.ts [text]');
    console.log('\nExamples:');
    console.log('  npx tsx crisis_detector.ts "I don\'t want to be here anymore"');
    console.log('  npx tsx crisis_detector.ts "Had a tough day at work"');
    console.log('  npx tsx crisis_detector.ts "I relapsed today, feeling awful"');
    console.log('\n⚠️  This is a detection tool, NOT a substitute for professional help.');
    console.log('Always consult licensed mental health professionals.');
    process.exit(1);
  }

  const text = args.join(' ');

  console.log('\n📝 Analyzing text:');
  console.log(`"${text}"\n`);

  const detector = new CrisisDetector();
  const result = detector.detect(text);

  console.log(detector.format(result));

  // Show crisis resources for any detected crisis
  if (result.isCrisis) {
    console.log('═'.repeat(80));
    console.log('\n🆘 CRISIS RESOURCES AVAILABLE 24/7:\n');
    console.log('  • 988 Suicide & Crisis Lifeline');
    console.log('    Phone: 988');
    console.log('    Chat: https://988lifeline.org/chat');
    console.log('\n  • Crisis Text Line');
    console.log('    Text "HELLO" to 741741');
    console.log('\n  • SAMHSA National Helpline (Substance Abuse)');
    console.log('    Phone: 1-800-662-4357');
    console.log('\n═'.repeat(80) + '\n');
  }
}

export { CrisisDetector, CrisisDetection, CrisisSignal };
