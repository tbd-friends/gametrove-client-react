import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Prevent console.log statements in production code
      'no-console': ['error', { 
        allow: ['warn', 'error'] // Allow console.warn and console.error for essential logging
      }],
      
      // Enforce consistent type imports
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
        fixStyle: 'separate-type-imports'
      }],
      
      // Ensure unused variables are caught
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      
      // Prevent any types
      '@typescript-eslint/no-explicit-any': 'error',
      
      // Prevent empty catch blocks (use standard rule)
      'no-empty': ['error', { "allowEmptyCatch": false }],

      // Prevent require() style imports (already handled by typescript-eslint)
      '@typescript-eslint/no-require-imports': 'error',

      // Prevent floating promises - enforce proper async handling (warning level)
      '@typescript-eslint/no-floating-promises': 'warn',

      // Prefer nullish coalescing over logical OR for null/undefined checks (warning level)
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',

      // Prefer optional chaining over manual null checks (warning level)
      '@typescript-eslint/prefer-optional-chain': 'warn'
    },
  },
])
