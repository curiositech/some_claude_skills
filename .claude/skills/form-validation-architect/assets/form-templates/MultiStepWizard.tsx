import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/**
 * Multi-Step Wizard Template
 *
 * Features:
 * - 3-step onboarding flow
 * - Progress indicator
 * - Per-step validation
 * - Back/Next navigation
 * - Form state persistence across steps
 *
 * Usage:
 *   import { MultiStepWizard } from './MultiStepWizard';
 *   <MultiStepWizard onComplete={handleComplete} />
 */

// Step schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address')
});

const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2, 'Use 2-letter state code'),
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits')
});

const preferencesSchema = z.object({
  notifications: z.boolean(),
  newsletter: z.boolean(),
  theme: z.enum(['light', 'dark', 'auto'])
});

const stepSchemas = [personalInfoSchema, addressSchema, preferencesSchema];

type PersonalInfo = z.infer<typeof personalInfoSchema>;
type Address = z.infer<typeof addressSchema>;
type Preferences = z.infer<typeof preferencesSchema>;
type CompleteFormData = PersonalInfo & Address & Preferences;

interface MultiStepWizardProps {
  onComplete: (data: CompleteFormData) => Promise<void>;
}

export function MultiStepWizard({ onComplete }: MultiStepWizardProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<CompleteFormData>>({});

  const form = useForm({
    resolver: zodResolver(stepSchemas[step]),
    defaultValues: formData
  });

  const stepTitles = [
    'Personal Information',
    'Address',
    'Preferences'
  ];

  const nextStep = async () => {
    const isValid = await form.trigger();

    if (isValid) {
      setFormData({ ...formData, ...form.getValues() });

      if (step < stepSchemas.length - 1) {
        setStep(step + 1);
        form.reset(formData); // Load saved data for next step
      }
    }
  };

  const prevStep = () => {
    setFormData({ ...formData, ...form.getValues() });
    setStep(step - 1);
    form.reset(formData);
  };

  const handleSubmit = async (data: any) => {
    const finalData = { ...formData, ...data } as CompleteFormData;
    await onComplete(finalData);
  };

  return (
    <div className="wizard-container">
      {/* Progress indicator */}
      <div className="wizard-progress" role="group" aria-labelledby="wizard-title">
        <h2 id="wizard-title" className="sr-only">Account Setup</h2>

        <nav aria-label="Form progress">
          <ol className="progress-steps">
            {stepTitles.map((title, index) => (
              <li
                key={title}
                className={index <= step ? 'active' : ''}
                aria-current={index === step ? 'step' : undefined}
              >
                <span className="step-number">{index + 1}</span>
                <span className="step-title">{title}</span>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Announce step changes to screen readers */}
      <div role="status" aria-live="polite" className="sr-only">
        Step {step + 1} of {stepSchemas.length}: {stepTitles[step]}
      </div>

      {/* Form */}
      <form
        onSubmit={form.handleSubmit(step === stepSchemas.length - 1 ? handleSubmit : nextStep)}
        className="wizard-form"
      >
        <div role="region" aria-labelledby={`step-${step}-title`}>
          <h3 id={`step-${step}-title`}>{stepTitles[step]}</h3>

          {/* Step 1: Personal Info */}
          {step === 0 && (
            <>
              <div className="form-field">
                <label htmlFor="firstName">First Name</label>
                <input id="firstName" {...form.register('firstName')} />
                {form.formState.errors.firstName && (
                  <span className="error">{form.formState.errors.firstName.message}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="lastName">Last Name</label>
                <input id="lastName" {...form.register('lastName')} />
                {form.formState.errors.lastName && (
                  <span className="error">{form.formState.errors.lastName.message}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" {...form.register('email')} />
                {form.formState.errors.email && (
                  <span className="error">{form.formState.errors.email.message}</span>
                )}
              </div>
            </>
          )}

          {/* Step 2: Address */}
          {step === 1 && (
            <>
              <div className="form-field">
                <label htmlFor="street">Street Address</label>
                <input id="street" {...form.register('street')} />
                {form.formState.errors.street && (
                  <span className="error">{form.formState.errors.street.message}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="city">City</label>
                  <input id="city" {...form.register('city')} />
                  {form.formState.errors.city && (
                    <span className="error">{form.formState.errors.city.message}</span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="state">State</label>
                  <input id="state" maxLength={2} {...form.register('state')} />
                  {form.formState.errors.state && (
                    <span className="error">{form.formState.errors.state.message}</span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="zipCode">ZIP Code</label>
                  <input id="zipCode" {...form.register('zipCode')} />
                  {form.formState.errors.zipCode && (
                    <span className="error">{form.formState.errors.zipCode.message}</span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Preferences */}
          {step === 2 && (
            <>
              <div className="form-field">
                <label>
                  <input type="checkbox" {...form.register('notifications')} />
                  Enable email notifications
                </label>
              </div>

              <div className="form-field">
                <label>
                  <input type="checkbox" {...form.register('newsletter')} />
                  Subscribe to newsletter
                </label>
              </div>

              <div className="form-field">
                <label htmlFor="theme">Theme</label>
                <select id="theme" {...form.register('theme')}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="wizard-actions">
          {step > 0 && (
            <button type="button" onClick={prevStep} className="btn-secondary">
              Back
            </button>
          )}

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="btn-primary"
          >
            {step === stepSchemas.length - 1
              ? form.formState.isSubmitting
                ? 'Submitting...'
                : 'Complete'
              : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Example Styles (CSS Module or styled-components)
 */
const styles = `
.wizard-container {
  max-width: 600px;
  margin: 0 auto;
}

.wizard-progress {
  margin-bottom: 2rem;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  list-style: none;
  padding: 0;
  margin: 0;
}

.progress-steps li {
  flex: 1;
  text-align: center;
  position: relative;
  padding-bottom: 2rem;
}

.progress-steps li:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 1rem;
  left: 50%;
  width: 100%;
  height: 2px;
  background: #ddd;
}

.progress-steps li.active:not(:last-child)::after {
  background: #2196F3;
}

.step-number {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  line-height: 2rem;
  border-radius: 50%;
  background: #ddd;
  color: #666;
  font-weight: bold;
}

.progress-steps li.active .step-number {
  background: #2196F3;
  color: white;
}

.step-title {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.progress-steps li.active .step-title {
  color: #2196F3;
  font-weight: 500;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
}

.wizard-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #ddd;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  padding: 0.75rem 2rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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
`;
