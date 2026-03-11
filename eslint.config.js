import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: ['node_modules', 'dist', '.astro', '.vercel', '.netlify', '*.css', '*.md'],
  },
  ...compat.config({
    env: {
      browser: true,
      node: true,
      es2022: true,
    },
    parser: '@typescript-eslint/parser',
    plugins: ['astro', '@typescript-eslint', 'tailwindcss', 'prettier'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:astro/recommended',
      'plugin:tailwindcss/recommended',
      'plugin:prettier/recommended',
    ],
    overrides: [
      {
        files: ['*.astro'],
        parser: 'astro-eslint-parser',
        parserOptions: {
          parser: '@typescript-eslint/parser',
          extraFileExtensions: ['.astro'],
        },
        rules: {
          'prettier/prettier': 'off',
          '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^Props$' }],
        },
      },
    ],
    rules: {
      'prettier/prettier': ['warn', { endOfLine: 'auto' }],
      'tailwindcss/no-custom-classname': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  }),
  {
    files: ['**/*.astro', '**/*.astro/**'],
    rules: {
      'prettier/prettier': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^Props$' }],
    },
  },
];
