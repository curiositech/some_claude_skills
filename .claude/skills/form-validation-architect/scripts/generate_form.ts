#!/usr/bin/env node
/**
 * Generate React Hook Form components from Zod schemas
 *
 * Usage: npx tsx generate_form.ts <schema-file> <output-file>
 *
 * Example:
 *   npx tsx generate_form.ts ./schemas/login.ts ./components/LoginForm.tsx
 *
 * Dependencies: npm install zod react-hook-form @hookform/resolvers
 */

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

interface FieldConfig {
  name: string;
  type: 'text' | 'email' | 'password' | 'number' | 'checkbox' | 'textarea' | 'select';
  label: string;
  placeholder?: string;
  options?: string[];
}

function inferFieldType(zodSchema: z.ZodTypeAny): FieldConfig['type'] {
  if (zodSchema instanceof z.ZodString) {
    const checks = (zodSchema as any)._def.checks || [];
    if (checks.some((c: any) => c.kind === 'email')) return 'email';
    return 'text';
  }
  if (zodSchema instanceof z.ZodNumber) return 'number';
  if (zodSchema instanceof z.ZodBoolean) return 'checkbox';
  if (zodSchema instanceof z.ZodEnum) return 'select';
  return 'text';
}

function generateFormComponent(
  schemaName: string,
  fields: FieldConfig[],
  componentName: string
): string {
  const imports = `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ${schemaName} } from './schemas';
import type { z } from 'zod';

type FormData = z.infer<typeof ${schemaName}>;
`;

  const formFields = fields.map(field => {
    if (field.type === 'checkbox') {
      return `      <div className="form-field">
        <label>
          <input
            {...register('${field.name}')}
            type="checkbox"
          />
          ${field.label}
        </label>
        {errors.${field.name} && (
          <span className="error">{errors.${field.name}.message}</span>
        )}
      </div>`;
    }

    if (field.type === 'select' && field.options) {
      return `      <div className="form-field">
        <label htmlFor="${field.name}">${field.label}</label>
        <select {...register('${field.name}')} id="${field.name}">
          <option value="">Select...</option>
          ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('\n          ')}
        </select>
        {errors.${field.name} && (
          <span className="error">{errors.${field.name}.message}</span>
        )}
      </div>`;
    }

    if (field.type === 'textarea') {
      return `      <div className="form-field">
        <label htmlFor="${field.name}">${field.label}</label>
        <textarea
          {...register('${field.name}')}
          id="${field.name}"
          placeholder="${field.placeholder || ''}"
          rows={4}
        />
        {errors.${field.name} && (
          <span className="error">{errors.${field.name}.message}</span>
        )}
      </div>`;
    }

    return `      <div className="form-field">
        <label htmlFor="${field.name}">${field.label}</label>
        <input
          {...register('${field.name}'${field.type === 'number' ? ', { valueAsNumber: true }' : ''})}
          type="${field.type}"
          id="${field.name}"
          placeholder="${field.placeholder || ''}"
        />
        {errors.${field.name} && (
          <span className="error">{errors.${field.name}.message}</span>
        )}
      </div>`;
  }).join('\n\n');

  return `${imports}
export function ${componentName}() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(${schemaName})
  });

  const onSubmit = async (data: FormData) => {
    console.log('Form submitted:', data);
    // TODO: Add your submission logic here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
${formFields}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
`;
}

// Example usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: npx tsx generate_form.ts <schema-file> <output-file>');
    console.log('Example: npx tsx generate_form.ts ./schemas/login.ts ./components/LoginForm.tsx');
    process.exit(1);
  }

  // Example: Generate a login form
  const exampleFields: FieldConfig[] = [
    { name: 'email', type: 'email', label: 'Email Address', placeholder: 'you@example.com' },
    { name: 'password', type: 'password', label: 'Password', placeholder: 'Enter password' },
    { name: 'rememberMe', type: 'checkbox', label: 'Remember me' }
  ];

  const code = generateFormComponent('loginSchema', exampleFields, 'LoginForm');

  console.log('Generated form component:');
  console.log(code);
  console.log('\nTo customize, edit the field configurations and re-run.');
}

export { generateFormComponent, inferFieldType };
