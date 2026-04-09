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

// ─── 5.5 Cross-browser: Case study pages ───────────────────────────────────

const CASE_STUDY_PAGES = [
  { path: '/en/projects/aiecommerce-agent-pipeline/', name: 'cs-aiecommerce-en' },
  { path: '/es/projects/aiecommerce-agent-pipeline/', name: 'cs-aiecommerce-es' },
];

for (const { path, name } of CASE_STUDY_PAGES) {
  test(`${name} — case study renders without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(path, { waitUntil: 'load' });

    expect(errors).toEqual([]);

    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Heading renders
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();

    // Inheritance section renders
    const inheritanceSection = page.locator('#class-lineage');
    await expect(inheritanceSection).toBeAttached({ timeout: 10_000 });

    // Connector element exists (hidden until scroll triggers animation)
    const connector = inheritanceSection.locator('[data-inheritance-connector]');
    await expect(connector).toBeAttached();

    await page.screenshot({
      path: `.screenshots/cross-browser/${name}-${test.info().project.name}.png`,
      fullPage: true,
    });
  });
}
