module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  ignorePatterns: ['node_modules', 'dist', '.astro', '.vercel', '.netlify', '*.css'],
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
        'prettier/prettier': 'warn',
      },
    },
  ],
  rules: {
    'prettier/prettier': ['warn', { endOfLine: 'auto' }],
    'tailwindcss/no-custom-classname': 'off',
    'react/react-in-jsx-scope': 'off',
  },
};
