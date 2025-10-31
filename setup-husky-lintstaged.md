You are my Gemini assistant.  
I already have ESLint and Prettier configured in my Astro + TypeScript + Tailwind project.  
I now want to ensure that linting and formatting run automatically before each commit, following the rules defined in GEMINI.md.

---

## 🎯 Objective

Set up **Husky** and **lint-staged** to automatically:

- Run ESLint and Prettier on staged files before each commit.
- Prevent commits if any errors or formatting issues remain.

---

## ⚙️ Tasks

### 1. Install dependencies

npm install -D husky lint-staged

### 2. Enable Husky

npx husky install

Then add to `package.json`:

```json
"scripts": {
  "prepare": "husky install"
}
```

### 3. Create a pre-commit hook

npx husky add .husky/pre-commit "npx lint-staged"

### 4. Configure lint-staged in package.json

Add the following section:

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx,astro,json,css,md}": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

### 5. Verify setup

Run:

npm run lint:fix
npm run format
git add .
git commit -m "test: verify husky and lint-staged setup"
