import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/**
 * Login Form Template
 *
 * Features:
 * - Email + password validation
 * - Remember me checkbox
 * - Loading state
 * - Error handling
 *
 * Usage:
 *   import { LoginForm } from './LoginForm';
 *   <LoginForm onSubmit={handleLogin} />
 */

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional()
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  onForgotPassword?: () => void;
}

export function LoginForm({ onSubmit, onForgotPassword }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
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
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <span id="password-error" className="error" role="alert">
            {errors.password.message}
          </span>
        )}
      </div>

      <div className="form-field checkbox-field">
        <label>
          <input type="checkbox" {...register('rememberMe')} />
          Remember me
        </label>

        {onForgotPassword && (
          <button
            type="button"
            onClick={onForgotPassword}
            className="link-button"
          >
            Forgot password?
          </button>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} className="submit-button">
        {isSubmitting ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
}

/**
 * Example Styles (CSS Module or styled-components)
 */
const styles = `
.login-form {
  max-width: 400px;
  margin: 0 auto;
}

.form-field {
  margin-bottom: 1rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-field input[type="email"],
.form-field input[type="password"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-field input[aria-invalid="true"] {
  border-color: #d32f2f;
}

.error {
  display: block;
  margin-top: 0.25rem;
  color: #d32f2f;
  font-size: 0.875rem;
}

.checkbox-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-field label {
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.link-button {
  background: none;
  border: none;
  color: #2196F3;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.875rem;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
`;
