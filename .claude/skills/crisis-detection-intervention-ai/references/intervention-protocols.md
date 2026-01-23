# Crisis Intervention Protocols

Evidence-based intervention strategies for mental health crisis response.

## Overview

**Critical Rule**: AI detects, humans intervene.

**Timeline**: From detection to human contact should be &lt;15 minutes for immediate crises.

---

## Severity-Based Response Matrix

| Severity | Response Time | Actions | Human Involvement |
|----------|---------------|---------|-------------------|
| **Immediate** | &lt;5 minutes | 988 modal (blocking), notify on-call, SMS backup | Required immediately |
| **High** | &lt;1 hour | Crisis resources, notify on-call, email backup | Required within 1 hour |
| **Medium** | &lt;24 hours | In-app resources, add to review queue | Review next business day |
| **Low** | &lt;72 hours | Supportive resources, add to queue | Review within 3 days |
| **None** | N/A | No action | No action |

---

## Protocol 1: Immediate Danger (Suicidal Ideation)

**Trigger**: `severity === 'immediate'`

**Automated Actions** (run immediately):

```typescript
async function handleImmediateCrisis(detection: CrisisDetection): Promise<void> {
  // 1. Show 988 modal (blocking, user must acknowledge)
  await show988Modal({
    userId: detection.userId,
    dismissible: false,  // User must click "I understand"
    resources: [
      { name: '988 Suicide & Crisis Lifeline', action: 'tel:988' },
      { name: 'Crisis Text Line', action: 'sms:741741', message: 'HELLO' },
      { name: 'Chat with counselor', action: 'https://988lifeline.org/chat' }
    ]
  });

  // 2. Notify on-call crisis counselor (push notification)
  await notifyOnCallCounselor({
    userId: detection.userId,
    severity: 'immediate',
    text: detection.text,
    signals: detection.signals,
    requiresResponse: 'immediate',
    escalationTime: Date.now()
  });

  // 3. SMS backup if no response in 5 minutes
  setTimeout(async () => {
    const responded = await checkCounselorResponse(detection.id);
    if (!responded) {
      await sendSMSToBackupCounselor({
        message: `IMMEDIATE: ${detection.userId} crisis detected. No primary response in 5 min.`,
        detectionId: detection.id
      });
    }
  }, 5 * 60 * 1000);

  // 4. Log for audit
  await logCrisisEvent({
    detectionId: detection.id,
    severity: 'immediate',
    actions: ['988_modal_shown', 'on_call_notified'],
    timestamp: Date.now()
  });
}
```

**Human Response** (counselor script):

1. **Immediate outreach** (within 5 minutes):
   - "Hi [name], I'm [counselor name], a crisis counselor. I saw your recent message and I'm here to help. Are you safe right now?"

2. **Assess immediate danger**:
   - "Do you have a plan to hurt yourself?"
   - "Are you alone right now?"
   - "Do you have access to means (pills, weapons)?"

3. **Safety planning**:
   - If danger: "Let's call 988 together right now."
   - If no immediate danger: "Can we create a safety plan together?"

4. **Follow-up**:
   - Schedule check-in within 24 hours
   - Connect to ongoing therapy resources

---

## Protocol 2: High Risk (Self-Harm, Suicidal Thoughts)

**Trigger**: `severity === 'high'`

**Automated Actions**:

```typescript
async function handleHighRisk(detection: CrisisDetection): Promise<void> {
  // 1. Show crisis resources (dismissible modal)
  await showCrisisResourcesModal({
    userId: detection.userId,
    dismissible: true,
    resources: [
      { name: '988 Suicide & Crisis Lifeline', action: 'tel:988' },
      { name: 'Crisis Text Line', action: 'sms:741741' },
      { name: 'Chat Now', action: 'https://988lifeline.org/chat' },
      { name: 'Find Therapist', action: '/find-therapist' }
    ],
    message: 'We noticed you might be going through a tough time. Here are resources available 24/7.'
  });

  // 2. Notify on-call counselor (email + push)
  await notifyOnCallCounselor({
    severity: 'high',
    requiresResponse: '1 hour',
    channels: ['email', 'push']
  });

  // 3. Add to urgent review queue
  await addToReviewQueue({
    priority: 'urgent',
    reviewBy: Date.now() + (1 * 60 * 60 * 1000)  // 1 hour
  });
}
```

**Human Response** (within 1 hour):

1. **Empathetic outreach**:
   - "Hi [name], I'm checking in because I care about how you're doing. How are you feeling right now?"

2. **Non-judgmental listening**:
   - Validate feelings: "It sounds like you're going through a really difficult time."
   - Ask open-ended questions: "What's been happening that's making you feel this way?"

3. **Risk assessment**:
   - "Have you thought about hurting yourself?"
   - "What's stopped you so far?" (identify protective factors)

4. **Resource connection**:
   - Offer to help schedule therapy appointment
   - Provide crisis line info if not already provided
   - Create safety plan if appropriate

---

## Protocol 3: Medium Risk (Substance Relapse)

**Trigger**: `severity === 'medium'`

**Automated Actions**:

```typescript
async function handleMediumRisk(detection: CrisisDetection): Promise<void> {
  // 1. Show in-app resources (non-blocking)
  await showInAppResources({
    userId: detection.userId,
    type: 'supportive',
    resources: [
      { name: 'Talk to Sponsor', action: '/contacts/sponsor' },
      { name: 'Find a Meeting', action: '/meetings/nearby' },
      { name: 'Call Support Line', action: 'tel:1-800-662-4357' },  // SAMHSA
      { name: 'Coping Strategies', action: '/resources/coping' }
    ]
  });

  // 2. Flag for review (next business day)
  await addToReviewQueue({
    priority: 'high',
    reviewBy: getNextBusinessDay()
  });

  // 3. Suggest self-help actions
  await suggestActions({
    userId: detection.userId,
    actions: [
      'Reach out to your sponsor',
      'Attend a meeting today',
      'Practice grounding techniques',
      'Call a supportive friend'
    ]
  });
}
```

**Human Response** (within 24 hours):

1. **Supportive check-in**:
   - "Hi [name], how are you doing today?"

2. **Assess situation**:
   - "I saw you mentioned [relapse/cravings]. Want to talk about it?"
   - "What triggered this?"

3. **Action planning**:
   - "What's one thing you can do today to support your recovery?"
   - "Have you been to a meeting recently?"
   - "Is your sponsor aware?"

4. **Resource connection**:
   - Remind about support group schedule
   - Share coping strategies
   - Schedule follow-up

---

## Protocol 4: Low Risk (General Distress)

**Trigger**: `severity === 'low'`

**Automated Actions**:

```typescript
async function handleLowRisk(detection: CrisisDetection): Promise<void> {
  // 1. Offer supportive resources (subtle, non-intrusive)
  await showResources({
    userId: detection.userId,
    placement: 'sidebar',  // Not blocking
    resources: [
      { name: 'Self-Care Tips', action: '/resources/self-care' },
      { name: 'Mindfulness Exercises', action: '/resources/mindfulness' },
      { name: 'Community Support', action: '/community' }
    ]
  });

  // 2. Add to review queue (normal priority)
  await addToReviewQueue({
    priority: 'normal',
    reviewBy: Date.now() + (3 * 24 * 60 * 60 * 1000)  // 3 days
  });
}
```

**Human Response** (within 72 hours):

1. **Casual check-in**:
   - "Hey [name], just checking in. How's your week going?"

2. **Light conversation**:
   - Listen without pushing for crisis disclosure
   - Offer general support

3. **Resource awareness**:
   - "Just wanted to remind you we have [resource] available if you ever need it."

---

## Special Protocol: Substance Relapse

**Unique considerations**: Shame, guilt, fear of judgment

**DO**:
- ✅ Normalize relapse as part of recovery journey
- ✅ Focus on getting back on track, not dwelling on slip
- ✅ Connect to sponsor/support group immediately
- ✅ Celebrate previous sobriety streak (e.g., "6 months is amazing!")

**DON'T**:
- ❌ Express disappointment or judgment
- ❌ Ask "why did you do it?" (increases shame)
- ❌ Minimize: "It's just one slip"

**Script**:
```
"Hey [name], I saw you mentioned using again. First, I want you to know
that reaching out takes courage. Relapse is a part of recovery for many
people, and it doesn't erase the progress you've made.

[6 months sober] is a huge accomplishment. That shows you have the
strength to do this.

What can we do right now to support you? Would it help to:
- Call your sponsor?
- Find a meeting today?
- Talk through what triggered this?

You're not alone in this."
```

---

## Escalation Chain

**If primary on-call counselor doesn't respond**:

```
0-5 min:   Primary on-call notified (push notification)
5-10 min:  Backup on-call notified (SMS)
10-15 min: Clinical supervisor notified (phone call)
15+ min:   Emergency protocol (suggest user call 988 directly)
```

**Implementation**:

```typescript
async function escalateIfNoResponse(detection: CrisisDetection): Promise<void> {
  const escalationSteps = [
    { delay: 0, action: () => notifyPrimaryOnCall(detection) },
    { delay: 5 * 60 * 1000, action: () => notifyBackupOnCall(detection) },
    { delay: 10 * 60 * 1000, action: () => notifySupervisor(detection) },
    { delay: 15 * 60 * 1000, action: () => showEmergencyModal(detection.userId) }
  ];

  for (const step of escalationSteps) {
    setTimeout(async () => {
      const responded = await checkResponse(detection.id);
      if (!responded) {
        await step.action();
      }
    }, step.delay);
  }
}
```

---

## Documentation Requirements

**For every crisis intervention**:

1. **Detection Record**:
   - Timestamp
   - Detected signals
   - Severity level
   - Confidence score

2. **Action Log**:
   - Resources shown
   - Who was notified
   - When they responded
   - What actions were taken

3. **Outcome**:
   - User status after intervention
   - Follow-up scheduled?
   - Escalation needed?

4. **Compliance**:
   - Access logged (who viewed crisis content)
   - Auto-delete scheduled (30 days)
   - Encryption verified

**Sample Documentation**:
```json
{
  "detection_id": "crisis-123",
  "user_id": "user-456",
  "detected_at": "2024-01-15T14:32:00Z",
  "severity": "high",
  "signals": ["suicidal_ideation"],
  "confidence": 0.92,
  "actions_taken": [
    {
      "action": "988_modal_shown",
      "timestamp": "2024-01-15T14:32:01Z"
    },
    {
      "action": "on_call_notified",
      "timestamp": "2024-01-15T14:32:02Z",
      "counselor_id": "counselor-789"
    },
    {
      "action": "counselor_responded",
      "timestamp": "2024-01-15T14:34:15Z",
      "response_time_seconds": 133
    }
  ],
  "outcome": {
    "user_safe": true,
    "follow_up_scheduled": "2024-01-16T10:00:00Z",
    "notes": "User connected with counselor, safety plan created"
  },
  "auto_delete_at": "2024-02-14T14:32:00Z"
}
```

---

## Training Materials

**For crisis counselors**:

1. **Understanding AI Detection**:
   - How the system works (multi-signal detection)
   - What triggers each severity level
   - False positive handling

2. **Response Protocols**:
   - Scripts for each severity level
   - Escalation procedures
   - Documentation requirements

3. **Crisis Resources**:
   - 988 Suicide & Crisis Lifeline
   - Crisis Text Line (741741)
   - SAMHSA National Helpline (1-800-662-4357)
   - Local emergency resources

4. **Self-Care**:
   - Secondary trauma awareness
   - Counselor support resources
   - Burnout prevention

---

## Quality Assurance

**Regular review**:
- ✅ Weekly: Review all immediate/high severity interventions
- ✅ Monthly: Analyze false positive/negative rates
- ✅ Quarterly: Update keyword patterns based on missed cases
- ✅ Annually: Full protocol review with clinical team

**Metrics to track**:
- Response time (goal: &lt;5 min for immediate)
- False positive rate (goal: &lt;10%)
- False negative rate (goal: &lt;5%)
- User outcome (did intervention help?)
- Counselor satisfaction

---

## Legal & Ethical Considerations

**Informed Consent**:
- Users must consent to crisis monitoring
- Clear explanation of how detection works
- Opt-out option (with strong warning)

**Mandatory Reporting**:
- Imminent danger to self: Report to emergency services
- Imminent danger to others: Report to authorities
- Child abuse: Report to authorities (per jurisdiction)

**Confidentiality**:
- Crisis content is PHI (HIPAA applies)
- Only licensed professionals can access
- Access is logged and audited
- Auto-deleted after retention period

**Liability**:
- AI is assistive tool, not replacement for professional judgment
- Counselors make final decisions
- Clear disclaimers in app
- Professional liability insurance required

---

## Resources

- [988 Suicide & Crisis Lifeline](https://988lifeline.org/)
- [Crisis Text Line](https://www.crisistextline.org/)
- [SAMHSA Treatment Locator](https://findtreatment.samhsa.gov/)
- [National Alliance on Mental Illness](https://www.nami.org/)
