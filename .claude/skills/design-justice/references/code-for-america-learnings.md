# Code for America Learnings

## Who is Code for America?

Code for America is a nonprofit that partners with governments to improve services for the public. Their criminal justice work has directly influenced best practices for expungement technology.

**Key Projects:**
- Clear My Record (California) - Automated record clearance
- GetCalFresh - Benefits enrollment
- ClientComm - Communication between public defenders and clients

## The 6 Principles

### 1. Automatic > Petition-Based

**The Problem:**
Traditional expungement requires individuals to:
- Know they're eligible
- Find the right forms
- Fill them out correctly
- Pay filing fees
- Navigate court procedures
- Wait months for processing

**The Solution:**
Governments should automatically clear eligible records without requiring action from individuals.

**Implementation Examples:**

```
California Prop 64 (Marijuana):
- State reviews ALL marijuana convictions
- Automatically reduces/dismisses eligible cases
- No petition required from individual
- Processed 230,000+ cases in first 2 years

Utah Clean Slate:
- Automatic expungement for qualifying misdemeanors
- System checks eligibility automatically
- Records cleared without individual action
- Expected to help 480,000 people
```

**For Apps (When Full Automation Isn't Possible):**

```typescript
// Minimize burden on individuals
const designPrinciples = {
  // Don't make them prove eligibility
  eligibilityCheck: "Automatic - we check based on minimal info",

  // Don't make them find forms
  forms: "Pre-filled and auto-populated",

  // Don't make them track status
  statusUpdates: "Proactive notifications",

  // Don't make them figure out next steps
  guidance: "One clear action at a time"
};
```

### 2. No-Cost by Default

**The Problem:**
Filing fees create barriers:
- Expungement fees range from $50-$500
- Fee waiver applications are separate processes
- Many people don't know waivers exist
- Fees punish poverty

**The Principle:**
Fee waivers should be the default path, not an exception to apply for.

**Implementation:**

```tsx
// WRONG: Fee waiver as afterthought
function FilingFeeSection() {
  return (
    <div>
      <h2>Filing Fee: $150</h2>
      <p>Payment methods: Credit card, money order</p>
      <small>
        <a href="/fee-waiver">Can't afford this? Learn about fee waivers</a>
      </small>
    </div>
  );
}

// RIGHT: Fee waiver as primary path
function FilingFeeSection() {
  return (
    <div>
      <h2>Filing Fee</h2>

      <div className="primary-option">
        <h3>Option 1: Fee Waiver (Recommended)</h3>
        <p>
          If your income is below ${threshold}, you likely qualify
          to have the $150 fee waived.
        </p>
        <button>Check If You Qualify →</button>
      </div>

      <div className="secondary-option">
        <h3>Option 2: Pay Filing Fee</h3>
        <p>$150 by credit card or money order</p>
      </div>
    </div>
  );
}
```

### 3. Government Does the Work

**The Problem:**
Current systems shift burden to individuals:
- Gathering documents from multiple agencies
- Tracking their own cases
- Following up repeatedly
- Understanding complex procedures

**The Principle:**
Government agencies should do the administrative work, not individuals.

**Implementation for Apps:**

When full government automation isn't available, apps should minimize individual burden:

```
Instead of:                    Do:
─────────────────────────────────────────────────────────
"Get a copy of your           "We'll look up your case
 court record"                 number for you"

"Calculate your               "Based on your info, you're
 waiting period"               eligible on [DATE]"

"Find the right form"         "Here's the form you need,
                               pre-filled with your info"

"Track your case status"      "We'll notify you when
                               there's an update"

"Follow up with clerk"        "If we don't hear back in
                               30 days, we'll remind you
                               to follow up"
```

### 4. Co-Design with Impacted People

**The Problem:**
Services designed without input from users:
- Make wrong assumptions about needs
- Use inaccessible language
- Create flows that don't match real life
- Miss critical barriers

**The Principle:**
People with records should be involved in designing services for people with records.

**Implementation:**

```
Research Methods:
- Shadow court self-help centers
- Interview people mid-process
- Observe public defender interactions
- Partner with reentry organizations
- Hire people with lived experience

Testing Requirements:
- Test with low-literacy users
- Test on older smartphones
- Test with limited data plans
- Test in low-trust scenarios
- Test with people who've been denied before
```

**Questions to Ask:**
1. "What was the hardest part of this process?"
2. "Where did you get stuck?"
3. "What information was hardest to find?"
4. "What would have helped you trust this more?"
5. "What happened that surprised you?"

### 5. Assume Gaps in Data

**The Problem:**
Systems expect complete, consistent data:
- Case numbers from 20 years ago
- Exact dates of conviction
- Complete address history
- Documents that were never provided

**Reality:**
- Records are incomplete
- Data doesn't match across systems
- People don't remember details from years ago
- Documents get lost

**Implementation:**

```typescript
// WRONG: Requiring exact data
const form = {
  caseNumber: { required: true, format: 'YYYY-CR-NNNNN' },
  convictionDate: { required: true, format: 'MM/DD/YYYY' },
  courtAddress: { required: true },
};

// RIGHT: Accepting uncertainty
const form = {
  caseNumber: {
    required: false,
    alternatives: ['dontKnow', 'needHelp'],
    helpText: "If you don't know, we can help you find it"
  },
  convictionDate: {
    required: true,
    allowApproximate: true,
    formats: ['exact', 'month-year', 'year-only'],
    helpText: "Your best estimate is fine"
  },
  courtLocation: {
    required: true,
    options: 'county-list',
    helpText: "Select the county where your case was heard"
  }
};
```

**"I Don't Know" as Valid Answer:**

```tsx
function CaseNumberInput() {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'known' | 'unknown' | 'needHelp'>('known');

  return (
    <div>
      <label>Case Number</label>

      {status === 'known' && (
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="e.g., 2019-CR-12345"
        />
      )}

      <div className="options">
        <button onClick={() => setStatus('unknown')}>
          I don't remember
        </button>
        <button onClick={() => setStatus('needHelp')}>
          Help me find it
        </button>
      </div>

      {status === 'unknown' && (
        <p>
          That's okay. We can still proceed with the information you have.
          The court may be able to look it up.
        </p>
      )}

      {status === 'needHelp' && (
        <CaseNumberLookup />
      )}
    </div>
  );
}
```

### 6. Backend Automation, Minimal Staff Time

**The Problem:**
Manual review bottlenecks:
- Limited staff reviewing applications
- Inconsistent decisions
- Months-long backlogs
- High error rates

**The Principle:**
Automate eligibility determination; reserve human review for edge cases.

**Implementation:**

```
Automation Tiers:

Tier 1: Fully Automated
- Clear eligibility criteria
- Complete data available
- No discretionary factors
→ Auto-approve/deny with explanation

Tier 2: Assisted Decision
- Mostly clear criteria
- Some missing data
- Minor discretionary factors
→ System recommends, human confirms

Tier 3: Human Review
- Complex eligibility
- Significant discretion required
- Incomplete records
→ Human decision with system support
```

## Case Study: Clear My Record

### Background
Code for America's Clear My Record helps Californians clear eligible marijuana convictions under Prop 64.

### Results
- 144,000+ convictions cleared
- Average processing time: weeks (vs. years manually)
- Cost: ~$10/case (vs. $1,500+ for attorney)

### Key Design Decisions

**1. Start with eligibility, not personal info**
Users see "You may be eligible" before entering any personal data.

**2. Partner with Public Defenders**
System designed to work with existing legal aid workflows.

**3. Proactive outreach**
Don't wait for people to find the service - go to them.

**4. No account required for basic info**
Eligibility checker works without signup.

**5. Mobile-first design**
Most users access via smartphone.

### Lessons Learned

```
What Worked:
✓ Automatic eligibility determination
✓ Pre-filled petition forms
✓ Partnership with DA offices
✓ Text message updates
✓ Simple, calm UI

What Was Hard:
✗ Data quality from court systems
✗ Variation across 58 counties
✗ Reaching eligible people who don't know
✗ Trust barriers (why is this free?)
✗ Keeping up with law changes
```

## Implementation Checklist

For expungement/record clearance apps:

```
ELIGIBILITY
□ Checker works without signup
□ Uses plain language questions
□ Handles "I don't know" answers
□ Explains WHY for each question
□ Shows results before collecting personal info

FORMS
□ Pre-fills everything possible
□ Fee waiver is default/prominent path
□ Accepts approximate dates
□ Provides "help me find this" for case numbers
□ Allows save and resume

PROCESS
□ Clear timeline expectations
□ Proactive status updates (don't make them check)
□ Explains each step before asking for action
□ Provides next steps even for denials

TRUST
□ Explains what happens with their data
□ No required account for basic features
□ Works on older phones
□ Works with slow/intermittent internet
□ Designed with impacted people
```

## Resources

- Code for America: codeforamerica.org
- Clear My Record: clearmyrecord.org
- GetCalFresh: getcalfresh.org
- Delivery-Driven Government (book): codeforamerica.org/delivery-driven-government
- Civic Tech Movement: civictech.guide

## Academic Research

Key papers on criminal record clearance:

1. **Prescott & Starr (2020)** - "Expungement of Criminal Convictions: An Empirical Study"
   - First rigorous study of expungement effects
   - Found significant wage increases post-expungement
   - Documented low uptake rates (6.5% of eligible)

2. **Lageson (2020)** - "Digital Punishment"
   - Documents persistence of records online even after expungement
   - Highlights need for comprehensive data removal

3. **Collateral Consequences Resource Center**
   - Tracks state-by-state policy changes
   - Documents Clean Slate movement progress
