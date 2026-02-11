/**
 * ESLint Configuration
 * ====================
 * 
 * Strict linting rules for the modern frontend architecture:
 * - TypeScript strict mode
 * - React hooks rules
 * - Import ordering
 * - No any types
 */

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  rules: {
    // ═══════════════════════════════════════════════════════════════════════
    // TYPESCRIPT STRICT RULES
    // ═══════════════════════════════════════════════════════════════════════
    
    // No `any` - be explicit about types
    '@typescript-eslint/no-explicit-any': 'error',
    
    // Require explicit return types on functions
    '@typescript-eslint/explicit-function-return-type': 'off', // Too strict for React components
    
    // Require explicit accessibility modifiers
    '@typescript-eslint/explicit-member-accessibility': 'off',
    
    // No unused variables (but allow underscore prefix for intentionally unused)
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    
    // Prefer interfaces over type aliases where possible
    '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
    
    // Consistent type imports
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      },
    ],

    // ═══════════════════════════════════════════════════════════════════════
    // REACT RULES
    // ═══════════════════════════════════════════════════════════════════════
    
    // React 17+ doesn't need React import for JSX
    'react/react-in-jsx-scope': 'off',
    
    // Allow JSX in .tsx files
    'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
    
    // Enforce props destructuring
    'react/destructuring-assignment': ['warn', 'always'],
    
    // Enforce consistent component definition
    'react/function-component-definition': [
      'warn',
      {
        namedComponents: ['arrow-function', 'function-declaration'],
        unnamedComponents: 'arrow-function',
      },
    ],
    
    // Disable prop-types (we use TypeScript)
    'react/prop-types': 'off',
    
    // ═══════════════════════════════════════════════════════════════════════
    // REACT HOOKS RULES (Strict)
    // ═══════════════════════════════════════════════════════════════════════
    
    // Enforce rules of hooks
    'react-hooks/rules-of-hooks': 'error',
    
    // Verify hook dependencies (prevents stale closures)
    'react-hooks/exhaustive-deps': 'warn',

    // ═══════════════════════════════════════════════════════════════════════
    // IMPORT ORDERING RULES
    // ═══════════════════════════════════════════════════════════════════════
    
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',        // Node.js built-in modules
          'external',       // External packages (react, @radix-ui, etc.)
          'internal',       // Internal modules (@site/...)
          'parent',         // Parent imports (../)
          'sibling',        // Sibling imports (./)
          'index',          // Index imports
          'object',         // Object imports
          'type',           // Type imports
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        pathGroups: [
          {
            pattern: 'react',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: '@site/**',
            group: 'internal',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
      },
    ],
    
    // No duplicate imports
    'import/no-duplicates': 'error',

    // ═══════════════════════════════════════════════════════════════════════
    // GENERAL CODE QUALITY
    // ═══════════════════════════════════════════════════════════════════════
    
    // No console logs (use logger utility instead)
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    
    // Require curly braces for all control statements
    curly: ['error', 'all'],
    
    // Prefer const over let
    'prefer-const': 'error',
    
    // No var
    'no-var': 'error',
    
    // Consistent arrow function body style
    'arrow-body-style': ['warn', 'as-needed'],
  },
  overrides: [
    // ═══════════════════════════════════════════════════════════════════════
    // TEST FILES - Relaxed Rules
    // ═══════════════════════════════════════════════════════════════════════
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
    // ═══════════════════════════════════════════════════════════════════════
    // SCRIPTS - Node.js Context
    // ═══════════════════════════════════════════════════════════════════════
    {
      files: ['scripts/**/*.ts', 'scripts/**/*.js'],
      rules: {
        'no-console': 'off',
      },
    },
    // ═══════════════════════════════════════════════════════════════════════
    // CONFIG FILES - CommonJS
    // ═══════════════════════════════════════════════════════════════════════
    {
      files: ['*.config.js', '*.config.cjs', '.eslintrc.cjs'],
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'build/',
    '.docusaurus/',
    'coverage/',
    '*.min.js',
    'static/',
  ],
};
