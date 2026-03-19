import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/en/', name: 'home-en', resumeLabel: 'Resume' },
  { path: '/es/', name: 'home-es', resumeLabel: 'Currículum' },
];

for (const { path, name, resumeLabel } of PAGES) {
  test(`${name} renders without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(path, { waitUntil: 'load' });

    // No JS errors
    expect(errors).toEqual([]);

    // Page has content
    const body = page.locator('body');
    await expect(body).toBeVisible();

    const resumeLink = page.getByRole('link', { name: resumeLabel }).first();
    await expect(resumeLink).toHaveAttribute('href', '/documents/resume.pdf');
    await expect(resumeLink).toHaveAttribute('target', '_blank');

    // Screenshot for visual comparison
    await page.screenshot({
      path: `.screenshots/cross-browser/${name}-${test.info().project.name}.png`,
      fullPage: true,
    });
  });
}
