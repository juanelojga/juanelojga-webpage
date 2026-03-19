import { test, expect } from '@playwright/test';

async function prepareHomepage(page: import('@playwright/test').Page, path: string) {
  await page.addInitScript(() => {
    (window as Window & { __heroBootComplete?: boolean }).__heroBootComplete = false;
    (window as Window & { __homepageShellReady?: boolean }).__homepageShellReady = false;
    window.addEventListener('hero:boot-complete', () => {
      (window as Window & { __heroBootComplete?: boolean }).__heroBootComplete = true;
    });
    window.addEventListener('homepage-shell-ready', () => {
      (window as Window & { __homepageShellReady?: boolean }).__homepageShellReady = true;
    });
  });

  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => {
      const state = window as Window & {
        __heroBootComplete?: boolean;
        __homepageShellReady?: boolean;
      };
      return state.__heroBootComplete === true && state.__homepageShellReady === true;
    },
    null,
    { timeout: 6_000 }
  );
}

async function revealBio(page: import('@playwright/test').Page) {
  const bio = page.locator('#about');
  await expect(bio).toBeAttached();
  await bio.evaluate(el => {
    el.scrollIntoView({ block: 'center', behavior: 'auto' });
  });
  await expect(bio).toHaveClass(/is-visible/);
  await page.waitForFunction(
    () => {
      const bioSection = document.getElementById('about');
      if (!bioSection) return false;
      return Number.parseFloat(getComputedStyle(bioSection).opacity) >= 0.99;
    },
    null,
    { timeout: 3_000 }
  );
  return bio;
}

test.describe('BioChapter visibility', () => {
  test('desktop — BioChapter becomes visible on scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await prepareHomepage(page, '/en/');

    const bio = await revealBio(page);

    const opacity = await bio.evaluate(el => getComputedStyle(el).opacity);
    expect(Number.parseFloat(opacity)).toBeGreaterThanOrEqual(0.99);

    const clipPath = await bio.evaluate(el => getComputedStyle(el).clipPath);
    expect(clipPath).not.toContain('100%');

    await page.screenshot({ path: '.screenshots/bio-chapter-desktop-en.png', fullPage: false });
  });

  test('mobile — BioChapter becomes visible on scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await prepareHomepage(page, '/en/');

    const bio = await revealBio(page);

    const opacity = await bio.evaluate(el => getComputedStyle(el).opacity);
    expect(Number.parseFloat(opacity)).toBeGreaterThanOrEqual(0.99);

    await page.screenshot({ path: '.screenshots/bio-chapter-mobile-en.png', fullPage: false });
  });

  test('rail — activates Load Profile when about is in view', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await prepareHomepage(page, '/en/');
    await revealBio(page);

    await expect(
      page.getByRole('button', { name: /Load profile.*(In progress|Completed)/ })
    ).toBeVisible();
  });

  test('es locale — BioChapter visible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await prepareHomepage(page, '/es/');

    const bio = await revealBio(page);

    const opacity = await bio.evaluate(el => getComputedStyle(el).opacity);
    expect(Number.parseFloat(opacity)).toBeGreaterThanOrEqual(0.99);

    await page.screenshot({ path: '.screenshots/bio-chapter-desktop-es.png', fullPage: false });
  });
});
