import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/**
 * Registration Form Template
 *
 * Features:
 * - Email, password, confirm password validation
 * - Password strength indicator
 * - Terms of service checkbox
 * - Cross-field validation (passwords match)
 *
 * Usage:
 *   import { RegistrationForm } from './RegistrationForm';
 *   <RegistrationForm onSubmit={handleRegister} />
 */

const registrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  onSubmit: (data: Omit<RegistrationFormData, 'confirmPassword'>) => Promise<void>;
  onTermsClick?: () => void;
}

export function RegistrationForm({ onSubmit, onTermsClick }: RegistrationFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur'
  });

  const password = watch('password', '');

  // Calculate password strength
  const getPasswordStrength = (pwd: string): { score: number; label: string } => {
    if (!pwd) return { score: 0, label: '' };

    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return { score, label: labels[Math.min(score - 1, 4)] };
  };

  const strength = getPasswordStrength(password);

  const handleFormSubmit = async (data: RegistrationFormData) => {
    const { confirmPassword, ...submitData } = data;
    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="registration-form">
      <div className="form-field">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" className="error" role="alert">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter password"
          {...register('password')}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby="password-requirements"
        />

        <span id="password-requirements" className="help-text">
          Must be at least 8 characters with one uppercase letter and one number
        </span>

        {password && (
          <div className="password-strength">
            <div
              className={`strength-bar strength-${strength.score}`}
              style={{ width: `${(strength.score / 5) * 100}%` }}
            />
            <span className="strength-label">{strength.label}</span>
          </div>
        )}

        {errors.password && (
          <span className="error" role="alert">
            {errors.password.message}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Re-enter password"
          {...register('confirmPassword')}
          aria-invalid={errors.confirmPassword ? 'true' : 'false'}
        />
        {errors.confirmPassword && (
          <span className="error" role="alert">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      <div className="form-field">
        <label className="checkbox-label">
          <input type="checkbox" {...register('acceptTerms')} />
          I accept the{' '}
          {onTermsClick ? (
            <button type="button" onClick={onTermsClick} className="link-button">
              terms and conditions
            </button>
          ) : (
            <span>terms and conditions</span>
          )}
        </label>
        {errors.acceptTerms && (
          <span className="error" role="alert">
            {errors.acceptTerms.message}
          </span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} className="submit-button">
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
}

/**
 * Example Styles (CSS Module or styled-components)
 */
const styles = `
.password-strength {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.strength-bar {
  height: 4px;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-bar.strength-1 { background: #d32f2f; }
.strength-bar.strength-2 { background: #ff9800; }
.strength-bar.strength-3 { background: #ffc107; }
.strength-bar.strength-4 { background: #8bc34a; }
.strength-bar.strength-5 { background: #4caf50; }

.strength-label {
  font-size: 0.75rem;
  font-weight: 500;
}

.help-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #666;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}
`;
