import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/order': [
        'warn',
        {
          groups: [
            'type',
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
          ],
          pathGroups: [
            {
              pattern: '@/app/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@/pages/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@/features/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@/shared/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
          ],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'never',
        },
      ],
    },
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
    },
  },
]);
