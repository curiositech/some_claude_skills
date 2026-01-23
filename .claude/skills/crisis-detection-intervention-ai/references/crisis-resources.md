# Crisis Resources

Comprehensive directory of crisis hotlines, support services, and integration patterns.

## Primary Crisis Resources (United States)

### 988 Suicide & Crisis Lifeline

**Phone**: 988 (available 24/7)
**Website**: https://988lifeline.org/
**Chat**: https://988lifeline.org/chat
**Languages**: English, Spanish (press 2)

**What they provide**:
- Immediate crisis counseling
- Suicide prevention
- Emotional support
- Local resource referrals

**Response time**: &lt;1 minute

**Integration**:
```typescript
// Modal display
const crisis988Modal = {
  title: '988 Suicide & Crisis Lifeline',
  message: 'Free, confidential support 24/7 for people in distress.',
  actions: [
    { label: 'Call 988', action: 'tel:988', primary: true },
    { label: 'Chat Online', action: 'https://988lifeline.org/chat' },
    { label: 'Text Support', action: 'sms:988' }
  ]
};
```

---

### Crisis Text Line

**Text**: Text "HELLO" to 741741
**Website**: https://www.crisistextline.org/
**Available**: 24/7 in US, Canada, UK, Ireland

**What they provide**:
- Text-based crisis support
- Trained crisis counselors
- De-escalation techniques
- Resource referrals

**Response time**: &lt;5 minutes

**Integration**:
```typescript
// Direct SMS link
<a href="sms:741741&body=HELLO">Text Crisis Line</a>

// Or programmatic
window.location.href = 'sms:741741&body=HELLO';
```

---

### SAMHSA National Helpline (Substance Abuse)

**Phone**: 1-800-662-HELP (4357)
**Website**: https://www.samhsa.gov/find-help/national-helpline
**Available**: 24/7, 365 days/year
**Languages**: English, Spanish

**What they provide**:
- Treatment referrals
- Information services
- Support groups
- Local resources for substance abuse and mental health

**Integration**:
```typescript
const samhsaResource = {
  name: 'SAMHSA National Helpline',
  description: 'Free, confidential help for substance abuse 24/7',
  phone: '1-800-662-4357',
  action: 'tel:+18006624357',
  useCase: 'substance_relapse'
};
```

---

### National Domestic Violence Hotline

**Phone**: 1-800-799-SAFE (7233)
**Website**: https://www.thehotline.org/
**Chat**: Available on website
**Text**: Text "START" to 88788

**What they provide**:
- Safety planning
- Crisis intervention
- Local shelter referrals
- Legal advocacy information

---

### Veterans Crisis Line

**Phone**: 988, then press 1
**Text**: 838255
**Chat**: https://www.veteranscrisisline.net/

**What they provide**:
- Crisis support for veterans
- Military-specific counseling
- Family support
- VA resource connection

---

### LGBTQ+ Specific

**Trevor Project** (LGBTQ+ youth under 25):
- Phone: 1-866-488-7386
- Text: Text "START" to 678678
- Chat: https://www.thetrevorproject.org/

**Trans Lifeline**:
- US: 1-877-565-8860
- Canada: 1-877-330-6366

---

## International Crisis Resources

### Canada

**Crisis Services Canada**:
- Phone: 1-833-456-4566
- Text: 45645
- Website: https://www.crisisservicescanada.ca/

**Kids Help Phone** (youth):
- Phone: 1-800-668-6868
- Text: 686868

---

### United Kingdom

**Samaritans**:
- Phone: 116 123
- Email: jo@samaritans.org
- Website: https://www.samaritans.org/

**Shout** (text):
- Text: 85258

---

### Australia

**Lifeline**:
- Phone: 13 11 14
- Chat: https://www.lifeline.org.au/

**Beyond Blue**:
- Phone: 1300 22 4636

---

### Europe

**Befrienders Worldwide**:
- International directory: https://www.befrienders.org/

**Specific Countries**:
- Germany: 0800 111 0 111
- France: 01 45 39 40 00
- Spain: 91 459 00 50
- Italy: 800 86 00 22

---

## Specialized Resources

### Eating Disorders

**National Eating Disorders Association (NEDA)**:
- Helpline: 1-800-931-2237
- Text: Text "NEDA" to 741741
- Website: https://www.nationaleatingdisorders.org/

---

### Postpartum Depression

**Postpartum Support International**:
- Helpline: 1-800-944-4773
- Website: https://www.postpartum.net/

---

### Disaster Distress

**SAMHSA Disaster Distress Helpline**:
- Phone: 1-800-985-5990
- Text: "TalkWithUs" to 66746

---

### Youth/Children

**Boys Town National Hotline**:
- Phone: 1-800-448-3809
- Available: 24/7

**National Runaway Safeline**:
- Phone: 1-800-786-2929
- Text: 66008

---

## Integration Patterns

### Pattern 1: Contextual Resource Display

**Show relevant resources based on detected signal**:

```typescript
function getRelevantResources(signals: CrisisSignal[]): Resource[] {
  const resources: Resource[] = [];

  // Always include 988
  resources.push({
    name: '988 Suicide & Crisis Lifeline',
    phone: '988',
    description: 'Free, confidential support 24/7',
    action: 'tel:988',
    priority: 1
  });

  // Add signal-specific resources
  if (signals.some(s => s.type === 'substance_relapse')) {
    resources.push({
      name: 'SAMHSA National Helpline',
      phone: '1-800-662-4357',
      description: 'Substance abuse support',
      action: 'tel:+18006624357',
      priority: 2
    });
  }

  if (signals.some(s => s.type === 'suicidal_ideation')) {
    resources.push({
      name: 'Crisis Text Line',
      description: 'Text support with trained counselor',
      action: 'sms:741741&body=HELLO',
      priority: 2
    });
  }

  return resources.sort((a, b) => a.priority - b.priority);
}
```

---

### Pattern 2: Location-Based Resources

**Show local resources based on user location**:

```typescript
interface LocalResource {
  name: string;
  phone: string;
  address: string;
  hours: string;
  services: string[];
  distance?: number;
}

async function getLocalResources(
  zipCode: string,
  serviceType: 'crisis' | 'therapy' | 'substance_abuse'
): Promise<LocalResource[]> {
  // Use SAMHSA Treatment Locator API
  const response = await fetch(
    `https://findtreatment.samhsa.gov/locator/api/v1/facilities?zip=${zipCode}&type=${serviceType}`
  );

  const facilities = await response.json();

  return facilities.map(f => ({
    name: f.name,
    phone: f.phone,
    address: f.address,
    hours: f.hours,
    services: f.services,
    distance: f.distance
  }));
}
```

**SAMHSA API**: https://findtreatment.samhsa.gov/locator/api

---

### Pattern 3: Multi-Channel Support

**Allow users to choose their preferred contact method**:

```typescript
interface ContactMethod {
  type: 'phone' | 'text' | 'chat' | 'email';
  label: string;
  action: string;
  responseTime: string;
}

const crisis988Channels: ContactMethod[] = [
  {
    type: 'phone',
    label: 'Call 988',
    action: 'tel:988',
    responseTime: '&lt;1 minute'
  },
  {
    type: 'text',
    label: 'Text 988',
    action: 'sms:988',
    responseTime: '&lt;5 minutes'
  },
  {
    type: 'chat',
    label: 'Chat Online',
    action: 'https://988lifeline.org/chat',
    responseTime: '&lt;5 minutes'
  }
];

// Display as user preference
function ResourceModal({ channels }: { channels: ContactMethod[] }) {
  return (
    <div>
      <h2>How would you like to connect?</h2>
      {channels.map(channel => (
        <button key={channel.type} onClick={() => window.location.href = channel.action}>
          {channel.label}
          <span className="response-time">{channel.responseTime}</span>
        </button>
      ))}
    </div>
  );
}
```

---

### Pattern 4: Resource Tracking

**Track which resources users engage with**:

```typescript
interface ResourceEngagement {
  userId: string;
  resourceName: string;
  contactMethod: 'phone' | 'text' | 'chat';
  timestamp: Date;
  fromDetection?: string;  // Detection ID if from crisis detection
}

async function trackResourceEngagement(
  userId: string,
  resource: Resource,
  detectionId?: string
): Promise<void> {
  await db.resource_engagement.insert({
    user_id: userId,
    resource_name: resource.name,
    contact_method: resource.type,
    timestamp: new Date(),
    from_detection: detectionId
  });

  // Update crisis detection record
  if (detectionId) {
    await db.crisis_detections.update(detectionId, {
      resource_engaged: true,
      resource_name: resource.name,
      engaged_at: new Date()
    });
  }
}
```

**Benefits**:
- Measure resource effectiveness
- Identify which resources users prefer
- Correlate resource use with outcomes

---

### Pattern 5: Offline Support (For App Downtime)

**Cache resources locally for offline access**:

```typescript
// Service Worker caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('crisis-resources-v1').then(cache => {
      return cache.addAll([
        '/crisis-resources.html',
        '/crisis-resources.json'
      ]);
    })
  );
});

// Static crisis resources page (always available)
const offlineResources = `
<!DOCTYPE html>
<html>
<head>
  <title>Crisis Resources</title>
</head>
<body>
  <h1>🆘 Crisis Resources Available 24/7</h1>

  <section>
    <h2&gt;988 Suicide & Crisis Lifeline</h2>
    <a href="tel:988" class="primary-action">Call 988</a>
    <p>Free, confidential support 24/7</p>
  </section>

  <section>
    <h2>Crisis Text Line</h2>
    <a href="sms:741741&body=HELLO">Text HELLO to 741741</a>
    <p>Text support with trained counselor</p>
  </section>

  <!-- More resources -->
</body>
</html>
`;
```

---

## Mobile App Integration

### Deep Linking

**Allow direct app-to-app communication**:

```typescript
// iOS
const iosDeepLinks = {
  phone: 'tel:988',
  messages: 'sms:741741&body=HELLO',
  safari: 'https://988lifeline.org/chat'
};

// Android
const androidDeepLinks = {
  phone: 'tel:988',
  messages: 'sms:741741?body=HELLO',
  browser: 'https://988lifeline.org/chat'
};

// React Native
import { Linking } from 'react-native';

function callCrisisLine() {
  Linking.openURL('tel:988');
}

function textCrisisLine() {
  const url = Platform.OS === 'ios'
    ? 'sms:741741&body=HELLO'
    : 'sms:741741?body=HELLO';
  Linking.openURL(url);
}
```

---

### Push Notifications

**Proactive check-ins for high-risk users**:

```typescript
// Schedule check-in notification
async function scheduleCheckIn(userId: string, hoursFromNow: number): Promise<void> {
  await scheduleNotification({
    userId,
    title: 'Quick Check-In',
    body: 'How are you feeling today? We\'re here if you need support.',
    scheduledFor: new Date(Date.now() + hoursFromNow * 60 * 60 * 1000),
    actions: [
      { id: 'talk', title: 'I\'d like to talk' },
      { id: 'resources', title: 'Show resources' },
      { id: 'dismiss', title: 'I\'m doing okay' }
    ]
  });
}

// Handle notification response
notificationHandler.on('action', async (action, notification) => {
  switch (action.id) {
    case 'talk':
      // Connect to crisis counselor
      await connectToCounselor(notification.userId);
      break;
    case 'resources':
      // Show crisis resources
      showCrisisResources(notification.userId);
      break;
    case 'dismiss':
      // Log as positive check-in
      await logCheckIn(notification.userId, 'positive');
      break;
  }
});
```

---

## Resource Effectiveness Metrics

**Track outcomes to improve resource recommendations**:

```sql
-- Resource engagement tracking
CREATE TABLE resource_engagements (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  resource_name VARCHAR(255),
  contact_method VARCHAR(50),
  engaged_at TIMESTAMP,
  from_detection_id UUID,  -- Link to crisis detection

  -- Outcome tracking
  followed_up BOOLEAN,  -- Did user follow up with counselor?
  helpful_rating INTEGER,  -- 1-5 scale
  outcome_notes TEXT
);

-- Query: Which resources are most effective?
SELECT
  resource_name,
  contact_method,
  COUNT(*) as engagements,
  AVG(helpful_rating) as avg_rating,
  SUM(CASE WHEN followed_up THEN 1 ELSE 0 END) as follow_ups
FROM resource_engagements
WHERE engaged_at > NOW() - INTERVAL '30 days'
GROUP BY resource_name, contact_method
ORDER BY avg_rating DESC, engagements DESC;
```

---

## Accessibility Considerations

### Language Support

```typescript
const resources988ByLanguage = {
  en: {
    phone: '988',
    description: 'Free, confidential support 24/7'
  },
  es: {
    phone: '988',
    instructions: 'Press 2 for Spanish',
    description: 'Apoyo gratuito y confidencial 24/7'
  },
  zh: {
    // Chinese language resources
    phone: '1-800-273-8255',  // Alternate number with Chinese support
    description: '免费、保密的支持 24/7'
  }
};
```

### Disability Access

- **Screen reader compatible**: All resources have alt text
- **TTY/TDD**: 1-800-799-4889 (Deaf/Hard of Hearing)
- **Video relay**: Available through 988 website

---

## Privacy & Security

**Resource engagement is PHI**:

```typescript
// Encrypt resource engagement data
const encryptedEngagement = await encrypt({
  userId: hashUserId(user.id),  // Hash, not plain ID
  resourceName: resource.name,
  timestamp: Date.now()
}, process.env.CRISIS_DATA_KEY);

// Log access
await logAccess({
  resourceId: resource.id,
  accessedBy: 'system',
  accessType: 'engagement_tracking',
  timestamp: Date.now()
});

// Auto-delete after 30 days
await scheduleDelete({
  table: 'resource_engagements',
  recordId: engagement.id,
  deleteAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
});
```

---

## Testing Resource Integration

```typescript
describe('Crisis Resources', () => {
  it('shows 988 for all crisis severities', () => {
    const resources = getRelevantResources([
      { type: 'suicidal_ideation', confidence: 0.9 }
    ]);

    expect(resources[0].phone).toBe('988');
  });

  it('includes SAMHSA for substance relapse', () => {
    const resources = getRelevantResources([
      { type: 'substance_relapse', confidence: 0.8 }
    ]);

    expect(resources.some(r => r.name.includes('SAMHSA'))).toBe(true);
  });

  it('tracks resource engagement', async () => {
    await trackResourceEngagement('user-123', {
      name: '988 Lifeline',
      type: 'phone'
    });

    const engagements = await db.resource_engagements.find({ user_id: 'user-123' });
    expect(engagements.length).toBe(1);
  });
});
```

---

## Resources

- [988 Lifeline](https://988lifeline.org/)
- [SAMHSA Treatment Locator](https://findtreatment.samhsa.gov/)
- [Crisis Text Line](https://www.crisistextline.org/)
- [Befrienders Worldwide](https://www.befrienders.org/) (International)
