# Authentication Patterns for Unstable Phone Access

## The Problem

Traditional authentication assumes:
- Stable phone number
- Consistent device access
- Reliable SMS delivery
- Ability to install authenticator apps

Reality for recovery/reentry populations:
- Phone numbers change with housing changes
- Prepaid phones disconnect for non-payment
- Devices are lost, stolen, or pawned
- Shared phones among family/friends
- No consistent access to same device

## Pattern: Email-First Authentication

### Implementation

```typescript
// Schema: Phone is OPTIONAL
interface User {
  email: string;           // Required, primary identifier
  phone?: string;          // Optional
  backupCodes: string[];   // Always generated
  trustedContacts?: {      // Case worker recovery
    email: string;
    relationship: string;
    verified: boolean;
  }[];
}

// Signup flow
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(), // Explicitly optional
});
```

### Recovery Pathways (Multiple Required)

1. **Email recovery** (always available)
2. **Backup codes** (printable, one-time use)
3. **Trusted contact verification** (case worker)
4. **Security questions** (as last resort)

Never have SMS as the ONLY path.

## Pattern: Printable Backup Codes

### Generation

```typescript
function generateBackupCodes(count: number = 10): string[] {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
}

// Display format for printing
function formatForPrint(codes: string[]): string {
  return codes.map((code, i) =>
    `${i + 1}. ${code.slice(0, 4)}-${code.slice(4)}`
  ).join('\n');
}
```

### UI Requirements

- Large, clear font (16px minimum)
- "Print this page" button prominent
- Instructions: "Write these down and keep in a safe place"
- Option to regenerate (invalidates old codes)
- Show how many codes remain

## Pattern: Trusted Intermediary Recovery

### Flow

1. User requests recovery via trusted contact
2. System emails case worker with verification link
3. Case worker confirms user identity (in person or call)
4. Case worker clicks verification link
5. User receives password reset email

### Implementation

```typescript
interface TrustedContactRecovery {
  userId: string;
  contactEmail: string;
  requestedAt: Date;
  verificationToken: string;
  expiresAt: Date;  // 24 hours
  verified: boolean;
  verifiedAt?: Date;
}

// Case worker verification page
// Includes: User's name, photo (if on file), security questions
// Case worker must confirm they verified identity
```

## Pattern: No-Signup Essential Functions

### What Should Work Without Login

| Feature | Requires Login? |
|---------|-----------------|
| Eligibility checker | ❌ No |
| Information/guides | ❌ No |
| Form download | ❌ No |
| Court locations | ❌ No |
| Save progress | ✅ Yes (or use localStorage) |
| Submit application | ✅ Yes |
| Track status | ✅ Yes |

### Implementation: Guest Mode with Upgrade

```typescript
// Store progress in localStorage
const guestProgress = {
  formData: { ... },
  currentStep: 3,
  startedAt: '2024-01-15',
};

// On signup, merge guest data into account
async function upgradeGuestToUser(guestData, newUserId) {
  await db.applications.create({
    userId: newUserId,
    ...guestData.formData,
    status: 'draft',
  });
  localStorage.removeItem('guestProgress');
}
```

## Anti-Patterns to Avoid

### ❌ Phone Number Required at Signup

```typescript
// WRONG
const signupSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10), // Required!
});
```

### ❌ SMS-Only 2FA

```typescript
// WRONG
async function send2FA(user) {
  await sms.send(user.phone, code); // Only option!
}

// RIGHT
async function send2FA(user, method: '2fa_method') {
  switch (method) {
    case 'email': await email.send(user.email, code); break;
    case 'sms': await sms.send(user.phone, code); break;
    case 'backup': return verifyBackupCode(user, code); break;
  }
}
```

### ❌ Device-Locked Sessions

```typescript
// WRONG
if (request.deviceFingerprint !== session.deviceFingerprint) {
  throw new Error('Unrecognized device');
}
```

### ❌ Account Lock on Phone Change

```typescript
// WRONG
if (user.phone !== submittedPhone) {
  await lockAccount(user, 'Phone number changed');
}

// RIGHT
if (user.phone !== submittedPhone) {
  await sendVerificationEmail(user.email,
    'Your phone number was updated. Click here if this wasn\'t you.'
  );
}
```

## Testing Checklist

```
□ Can complete signup with only email
□ Can recover account without phone
□ Backup codes work and are printable
□ Case worker verification flow works
□ Core features work without login
□ Session works across devices
□ Phone number change doesn't lock account
□ Clear indication of which fields are optional
```
