import { defineConfig, devices } from '@playwright/test';

const includeWebkit =
  process.platform !== 'linux' || process.env.PLAYWRIGHT_ENABLE_WEBKIT === 'true';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: 'http://localhost:4322',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command:
      'PUBLIC_E2E=true npm run build && PUBLIC_E2E=true npm run preview -- --host 127.0.0.1 --port 4322',
    port: 4322,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    ...(includeWebkit ? [{ name: 'webkit', use: { ...devices['Desktop Safari'] } }] : []),
  ],
});
