import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:4322';

test.describe('BioChapter visibility', () => {
  test('desktop — BioChapter becomes visible on scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE}/en/`, { waitUntil: 'load' });
    // Wait for load event + rAF to fire the deferred observer setup
    await page.waitForTimeout(1000);

    const bio = page.locator('#about');
    await expect(bio).toBeAttached();

    // Scroll gradually with wheel events (simulates real user scrolling)
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 150);
      await page.waitForTimeout(150);
    }
    // Wait for IntersectionObserver to fire + CSS transition
    await page.waitForTimeout(2000);

    // Verify .is-visible class was added
    await expect(bio).toHaveClass(/is-visible/);

    // Verify computed opacity is 1
    const opacity = await bio.evaluate(el => getComputedStyle(el).opacity);
    expect(opacity).toBe('1');

    // Verify clip-path is resolved (not clipped)
    const clipPath = await bio.evaluate(el => getComputedStyle(el).clipPath);
    expect(clipPath).not.toContain('100%');

    // Screenshot
    await page.screenshot({ path: '.screenshots/bio-chapter-desktop-en.png', fullPage: false });
  });

  test('mobile — BioChapter becomes visible on scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/en/`, { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    const bio = page.locator('#about');
    await expect(bio).toBeAttached();

    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 150);
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(2000);

    await expect(bio).toHaveClass(/is-visible/);

    const opacity = await bio.evaluate(el => getComputedStyle(el).opacity);
    expect(opacity).toBe('1');

    await page.screenshot({ path: '.screenshots/bio-chapter-mobile-en.png', fullPage: false });
  });

  test('rail — activates Load Profile when about is in view', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE}/en/`, { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 150);
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(2000);

    // The "Load profile" rail button should be either active or completed (not pending)
    const loadProfileBtn = page.locator('button', { hasText: 'Load profile' });
    const ariaLabel = await loadProfileBtn.getAttribute('aria-label');
    expect(ariaLabel).not.toContain('Pending');
  });

  test('es locale — BioChapter visible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE}/es/`, { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    const bio = page.locator('#about');
    await expect(bio).toBeAttached();

    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 150);
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(2000);

    await expect(bio).toHaveClass(/is-visible/);

    const opacity = await bio.evaluate(el => getComputedStyle(el).opacity);
    expect(opacity).toBe('1');

    await page.screenshot({ path: '.screenshots/bio-chapter-desktop-es.png', fullPage: false });
  });
});
