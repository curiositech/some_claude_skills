# Form Accessibility Guidelines

Making forms usable for everyone, including screen reader users and keyboard-only navigation.

## WCAG 2.1 AA Compliance Checklist

```
□ All inputs have associated labels
□ Error messages are announced to screen readers
□ Focus order follows logical tab sequence
□ Required fields are indicated (not just color)
□ Color contrast ≥ 4.5:1 for normal text
□ Form can be completed with keyboard alone
□ Error recovery is possible without mouse
□ Time limits are adjustable or disabled
□ Instructions provided before form start
□ Success/failure clearly communicated
```

---

## Pattern 1: Proper Label Association

**❌ Wrong**: Label not associated with input
```tsx
<label>Email</label>
<input name="email" />
```

**✅ Correct**: Explicit association
```tsx
<label htmlFor="email">Email Address</label>
<input id="email" name="email" type="email" />

// Or: Implicit association
<label>
  Email Address
  <input name="email" type="email" />
</label>
```

**Why**: Screen readers announce the label when input is focused.

---

## Pattern 2: Required Field Indication

**❌ Wrong**: Only using asterisk
```tsx
<label>Email *</label>
<input required />
```

**✅ Correct**: Explicit aria-required + visual indicator
```tsx
<label htmlFor="email">
  Email Address
  <span aria-label="required" className="required">*</span>
</label>
<input
  id="email"
  name="email"
  required
  aria-required="true"
/>
```

**Better**: Text indicator
```tsx
<label htmlFor="email">
  Email Address <span className="required">(required)</span>
</label>
```

---

## Pattern 3: Error Announcement

**❌ Wrong**: Error not announced
```tsx
{errors.email && <span className="error">{errors.email.message}</span>}
```

**✅ Correct**: aria-describedby + aria-invalid
```tsx
<input
  id="email"
  name="email"
  aria-invalid={errors.email ? 'true' : 'false'}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <span id="email-error" className="error" role="alert">
    {errors.email.message}
  </span>
)}
```

**Why**: `role="alert"` causes screen readers to announce the error immediately.

---

## Pattern 4: Live Region for Form Status

Announce submission status without page reload.

```tsx
function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}

      {/* Live region announces status changes */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {status === 'submitting' && 'Submitting form...'}
        {status === 'success' && 'Form submitted successfully'}
        {status === 'error' && 'Form submission failed. Please check errors.'}
      </div>

      {/* Visual status (also shown) */}
      {status === 'success' && (
        <div className="success-message">Thank you! Form submitted.</div>
      )}
    </form>
  );
}
```

---

## Pattern 5: Focus Management

Focus first error on submit failure.

```tsx
const { setFocus, formState: { errors } } = useForm();

const onSubmit = async (data) => {
  try {
    await api.submit(data);
  } catch (error) {
    // Focus first error field
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      setFocus(firstErrorField);
    }
  }
};
```

**Auto-focus first field on page load** (only if form is primary content):
```tsx
useEffect(() => {
  const firstInput = document.querySelector('input');
  firstInput?.focus();
}, []);
```

---

## Pattern 6: Keyboard Navigation

All interactive elements must be keyboard-accessible.

```tsx
// ✅ Custom checkbox with keyboard support
<label>
  <input
    type="checkbox"
    className="sr-only"
    {...register('terms')}
  />
  <span
    role="checkbox"
    aria-checked={watch('terms')}
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setValue('terms', !watch('terms'));
      }
    }}
    className="custom-checkbox"
  />
  I agree to the terms
</label>
```

**Tab order**: Ensure `tabindex` follows logical flow (top-to-bottom, left-to-right).

---

## Pattern 7: Fieldset and Legend

Group related fields semantically.

```tsx
<fieldset>
  <legend>Shipping Address</legend>

  <label htmlFor="street">Street Address</label>
  <input id="street" name="street" />

  <label htmlFor="city">City</label>
  <input id="city" name="city" />

  <label htmlFor="zipCode">ZIP Code</label>
  <input id="zipCode" name="zipCode" />
</fieldset>

<fieldset>
  <legend>Payment Method</legend>

  <label>
    <input type="radio" name="paymentMethod" value="card" />
    Credit Card
  </label>

  <label>
    <input type="radio" name="paymentMethod" value="paypal" />
    PayPal
  </label>
</fieldset>
```

**Why**: Screen readers announce the legend when entering the fieldset.

---

## Pattern 8: Instructions and Help Text

Provide context before users start typing.

```tsx
<label htmlFor="password">
  Password
  <span id="password-requirements" className="help-text">
    Must be at least 8 characters with one uppercase letter and one number
  </span>
</label>
<input
  id="password"
  type="password"
  aria-describedby="password-requirements"
/>
```

**Progressive disclosure for complex instructions**:
```tsx
<label htmlFor="taxId">Tax ID</label>
<button
  type="button"
  aria-expanded={showHelp}
  aria-controls="taxid-help"
  onClick={() => setShowHelp(!showHelp)}
>
  What's this?
</button>
{showHelp && (
  <div id="taxid-help" role="region">
    Your Tax ID is a 9-digit number assigned by the IRS...
  </div>
)}
<input id="taxId" aria-describedby="taxid-help" />
```

---

## Pattern 9: Color Contrast

WCAG AA requires minimum contrast ratios.

**Text Contrast**:
- Normal text: 4.5:1
- Large text (18pt+): 3:1
- UI components: 3:1

```css
/* ✅ Good contrast */
.error {
  color: #d32f2f; /* Red text */
  background: #ffffff; /* White bg */
  /* Contrast ratio: 5.0:1 */
}

/* ❌ Poor contrast */
.error {
  color: #ff9999; /* Light red */
  background: #ffffff;
  /* Contrast ratio: 2.1:1 - FAILS */
}
```

**Don't rely on color alone**:
```tsx
// ❌ Only color indicates error
<input className={errors.email ? 'input-error' : ''} />

// ✅ Icon + color + text
<input className={errors.email ? 'input-error' : ''} />
{errors.email && (
  <span className="error">
    <IconError aria-hidden="true" />
    {errors.email.message}
  </span>
)}
```

---

## Pattern 10: Screen Reader Only Content

Hide visual clutter, provide context for assistive tech.

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**Usage**:
```tsx
<button type="submit">
  <IconPaperPlane aria-hidden="true" />
  <span className="sr-only">Submit form</span>
</button>
```

---

## Pattern 11: Time Limits

Allow users to extend or disable timeouts.

```tsx
function TimedForm() {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Warn at 1 minute remaining
  const showWarning = timeLeft <= 60 && timeLeft > 0;

  return (
    <form>
      {showWarning && (
        <div role="alert" className="warning">
          ⏰ {timeLeft} seconds remaining.
          <button
            type="button"
            onClick={() => setTimeLeft(300)}
          >
            Extend time
          </button>
        </div>
      )}

      {/* Form fields */}
    </form>
  );
}
```

---

## Pattern 12: Multi-Step Forms (Wizard)

Indicate progress and allow navigation.

```tsx
<div role="group" aria-labelledby="wizard-title">
  <h2 id="wizard-title">Account Setup</h2>

  {/* Progress indicator */}
  <nav aria-label="Form progress">
    <ol className="wizard-steps">
      <li aria-current={step === 1 ? 'step' : undefined}>
        Personal Info
      </li>
      <li aria-current={step === 2 ? 'step' : undefined}>
        Address
      </li>
      <li aria-current={step === 3 ? 'step' : undefined}>
        Payment
      </li>
    </ol>
  </nav>

  {/* Announce step changes */}
  <div role="status" aria-live="polite" className="sr-only">
    Step {step} of 3: {stepTitles[step]}
  </div>

  {/* Step content */}
  <div role="region" aria-labelledby={`step-${step}-title`}>
    <h3 id={`step-${step}-title`}>{stepTitles[step]}</h3>
    {/* Fields */}
  </div>
</div>
```

---

## Testing Tools

### Automated Testing
- **axe DevTools**: Browser extension for WCAG violations
- **pa11y**: CLI tool for automated accessibility testing
- **WAVE**: Web Accessibility Evaluation Tool

```bash
# Run pa11y on form page
npx pa11y http://localhost:3000/signup
```

### Manual Testing
1. **Keyboard only**: Tab through form, submit with Enter
2. **Screen reader**: Test with NVDA (Windows), JAWS, or VoiceOver (Mac)
3. **Zoom**: Test at 200% zoom (WCAG requirement)
4. **High contrast**: Enable high contrast mode (Windows)

**VoiceOver (Mac)**:
- Enable: Cmd + F5
- Navigate: VO + Right Arrow
- Interact: VO + Space

---

## Production Checklist

```
□ All inputs have visible labels
□ Required fields indicated with text (not just *)
□ Errors announced with role="alert"
□ aria-invalid on fields with errors
□ Focus moves to first error on submit failure
□ Color contrast ≥ 4.5:1
□ Form completable with keyboard only
□ Tab order is logical
□ Fieldsets group related fields
□ Help text associated with aria-describedby
□ Success/error messages use live regions
□ Time limits can be extended
□ Multi-step progress is announced
□ Tested with screen reader
□ No reliance on color alone for meaning
```

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN: Accessible Forms](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#accessible_error_messages)
- [WebAIM: Form Accessibility](https://webaim.org/techniques/forms/)
- [A11y Project: Checklist](https://www.a11yproject.com/checklist/)
