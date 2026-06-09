import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Match backend: no implicit or explicit `any`
      '@typescript-eslint/no-explicit-any': 'error',
      // Consistent type imports (same as backend verbatimModuleSyntax intent)
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      // Prefer nullish coalescing over || for nullable values (no type info needed)
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
]);
