import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import astroPlugin from 'eslint-plugin-astro';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

const sharedPlugins = {
  '@typescript-eslint': tseslint,
  'import-x': importX,
  'jsx-a11y': jsxA11y,
  prettier,
  react,
  'react-hooks': reactHooks,
};

export default [
  {
    ignores: [
      'node_modules',
      'dist',
      '.astro',
      '.vercel',
      '.netlify',
      '.screenshots',
      '.claude',
      '*.css',
      '*.md',
    ],
  },
  // Base JS/TS config
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsparser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    plugins: sharedPlugins,
    rules: {
      ...tseslint.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': ['warn', { endOfLine: 'auto' }],
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  // TypeScript files: disable no-undef (TypeScript handles this natively)
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-undef': 'off',
    },
  },
  // Astro files
  ...astroPlugin.configs.recommended,
  {
    files: ['**/*.astro', '**/*.astro/**'],
    plugins: sharedPlugins,
    rules: {
      'prettier/prettier': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^Props$' }],
    },
  },
];
