import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/en/', name: 'home-en' },
  { path: '/es/', name: 'home-es' },
  { path: '/en/resume', name: 'resume-en' },
];

for (const { path, name } of PAGES) {
  test(`${name} renders without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(path, { waitUntil: 'networkidle' });

    // No JS errors
    expect(errors).toEqual([]);

    // Page has content
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Screenshot for visual comparison
    await page.screenshot({
      path: `.screenshots/cross-browser/${name}-${test.info().project.name}.png`,
      fullPage: true,
    });
  });
}
