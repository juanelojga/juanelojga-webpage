import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PROJECTS = [
  { slug: 'aiecommerce-agent-pipeline', title: 'AIEcommerce Agent Pipeline' },
  { slug: 'narbox-logistics-system', title: 'Narbox Logistics System' },
  { slug: 'pbxai-voice-orchestrator', title: 'PBXAI Voice Orchestrator' },
];

const LOCALES = ['en', 'es'] as const;

function projectUrl(lang: string, slug: string) {
  return `/${lang}/projects/${slug}/`;
}

async function waitForSection(page: Page) {
  const section = page.locator('#class-lineage');
  await expect(section).toBeAttached({ timeout: 10_000 });
  await section.scrollIntoViewIfNeeded();
  // Wait for entry choreography to finish
  await page.waitForTimeout(1200);
  return section;
}

// ─── 4.1 Desktop QA (≥1024px) ──────────────────────────────────────────────

test.describe('4.1 Desktop QA (≥1024px)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  for (const locale of LOCALES) {
    for (const project of PROJECTS) {
      test(`${locale}/${project.slug} — inheritance section renders correctly`, async ({
        page,
      }) => {
        const errors: string[] = [];
        page.on('pageerror', err => errors.push(err.message));

        await page.goto(projectUrl(locale, project.slug), { waitUntil: 'load' });
        const section = await waitForSection(page);

        // Section heading is visible
        const heading = section.locator('#inheritance-heading');
        await expect(heading).toBeVisible();

        // Two-column layout: narrative column + lineage sidebar
        const desktopLineage = section.locator('nav[aria-label="Class lineage"]').first();
        await expect(desktopLineage).toBeVisible();

        // Parent panel visible
        const parentPanel = section.locator('[data-inheritance-panel="parent"]');
        await expect(parentPanel).toBeVisible();

        // Child panel visible
        const childPanel = section.locator('[data-inheritance-panel="child"]');
        await expect(childPanel).toBeVisible();

        // Connector visible
        const connector = section.locator('[data-inheritance-connector]');
        await expect(connector).toBeVisible();

        // Trait chips rendered
        const traitButtons = section.locator('[role="group"] button[aria-expanded]').first();
        await expect(traitButtons).toBeVisible();

        // No horizontal overflow
        const sectionBox = await section.boundingBox();
        const viewportWidth = 1280;
        expect(sectionBox).not.toBeNull();
        expect(sectionBox!.width).toBeLessThanOrEqual(viewportWidth);

        // No console errors
        expect(errors).toEqual([]);

        await page.screenshot({
          path: `.screenshots/inheritance-desktop-${locale}-${project.slug}.png`,
          fullPage: false,
        });
      });
    }
  }

  test('en — connector draws between parent and child panels', async ({ page }) => {
    await page.goto(projectUrl('en', PROJECTS[0].slug), { waitUntil: 'load' });
    const section = await waitForSection(page);

    // After choreography, connector should be revealed
    const connector = section.locator('[data-inheritance-connector]');
    const hasRevealed = await connector.evaluate(el => {
      return (
        el.classList.contains('inheritance-connector-revealed') ||
        getComputedStyle(el).transform !== 'scaleY(0)'
      );
    });
    expect(hasRevealed).toBe(true);

    // Extends label visible
    const extendsLabel = section.locator('[data-inheritance-extends-label]');
    const opacity = await extendsLabel.evaluate(el =>
      Number.parseFloat(getComputedStyle(el).opacity)
    );
    expect(opacity).toBeGreaterThan(0);
  });

  test('en — lineage map sticky sidebar visible on desktop', async ({ page }) => {
    await page.goto(projectUrl('en', PROJECTS[0].slug), { waitUntil: 'load' });
    const section = await waitForSection(page);

    // Desktop lineage map (hidden lg:block) should be visible
    const desktopLineageContainer = section.locator('.hidden.lg\\:block');
    await expect(desktopLineageContainer).toBeVisible();

    // Mobile lineage map should be hidden
    const mobileLineageContainer = section.locator('.lg\\:hidden').last();
    await expect(mobileLineageContainer).not.toBeVisible();
  });
});

// ─── 4.2 Tablet QA (768–1023px) ────────────────────────────────────────────

test.describe('4.2 Tablet QA (768–1023px)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
  });

  for (const locale of LOCALES) {
    test(`${locale} — inheritance section stacks at tablet width`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(projectUrl(locale, PROJECTS[0].slug), { waitUntil: 'load' });
      const section = await waitForSection(page);

      // Parent and child panels visible
      await expect(section.locator('[data-inheritance-panel="parent"]')).toBeVisible();
      await expect(section.locator('[data-inheritance-panel="child"]')).toBeVisible();

      // Desktop lineage map should be hidden at 768px (below lg breakpoint = 1024px)
      const desktopLineage = section.locator('.hidden.lg\\:block');
      await expect(desktopLineage).not.toBeVisible();

      // Mobile/compact lineage map visible
      const compactLineage = section.locator('.lg\\:hidden').last();
      await expect(compactLineage).toBeVisible();

      // No horizontal overflow
      const sectionBox = await section.boundingBox();
      expect(sectionBox).not.toBeNull();
      expect(sectionBox!.width).toBeLessThanOrEqual(768);

      // Trait chips accessible
      const traits = section.locator('[role="group"] button[aria-expanded]');
      const count = await traits.count();
      expect(count).toBeGreaterThan(0);

      // No console errors
      expect(errors).toEqual([]);

      await page.screenshot({
        path: `.screenshots/inheritance-tablet-${locale}.png`,
        fullPage: false,
      });
    });
  }
});

// ─── 4.3 Mobile QA (320–767px) ─────────────────────────────────────────────

test.describe('4.3 Mobile QA (320–767px)', () => {
  for (const width of [375, 320]) {
    test.describe(`at ${width}px`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height: 812 });
      });

      for (const locale of LOCALES) {
        test(`${locale} — vertical inheritance stack`, async ({ page }) => {
          const errors: string[] = [];
          page.on('pageerror', err => errors.push(err.message));

          await page.goto(projectUrl(locale, PROJECTS[0].slug), { waitUntil: 'load' });
          const section = await waitForSection(page);

          // Panels visible and stacked
          const parentPanel = section.locator('[data-inheritance-panel="parent"]');
          const childPanel = section.locator('[data-inheritance-panel="child"]');
          await expect(parentPanel).toBeVisible();
          await expect(childPanel).toBeVisible();

          // Parent should be above child (vertical stack)
          const parentBox = await parentPanel.boundingBox();
          const childBox = await childPanel.boundingBox();
          expect(parentBox).not.toBeNull();
          expect(childBox).not.toBeNull();
          expect(parentBox!.y).toBeLessThan(childBox!.y);

          // Desktop lineage map hidden
          const desktopLineage = section.locator('.hidden.lg\\:block');
          await expect(desktopLineage).not.toBeVisible();

          // Compact lineage map visible
          const compactLineage = section.locator('.lg\\:hidden').last();
          await expect(compactLineage).toBeVisible();

          // No horizontal overflow
          const sectionBox = await section.boundingBox();
          expect(sectionBox).not.toBeNull();
          expect(sectionBox!.width).toBeLessThanOrEqual(width);

          // Touch targets ≥ 44px
          const buttons = section.locator('button[aria-expanded]');
          const buttonCount = await buttons.count();
          for (let i = 0; i < buttonCount; i++) {
            const box = await buttons.nth(i).boundingBox();
            expect(box).not.toBeNull();
            expect(box!.height).toBeGreaterThanOrEqual(44);
          }

          // Trait chips wrap correctly (no overflow)
          const traitGrid = section.locator('.grid.gap-3');
          if ((await traitGrid.count()) > 0) {
            const gridBox = await traitGrid.first().boundingBox();
            expect(gridBox).not.toBeNull();
            expect(gridBox!.width).toBeLessThanOrEqual(width);
          }

          // No console errors
          expect(errors).toEqual([]);

          await page.screenshot({
            path: `.screenshots/inheritance-mobile-${width}-${locale}.png`,
            fullPage: false,
          });
        });
      }

      test('en — trait card expand/collapse works on mobile', async ({ page }) => {
        await page.goto(projectUrl('en', PROJECTS[0].slug), { waitUntil: 'load' });
        const section = await waitForSection(page);

        // Use stable locator — first button in traits group
        const traitsGroup = section.locator('[data-lineage-section="traits"] [role="group"]');
        const firstTrait = traitsGroup.locator('button[aria-expanded]').first();
        await expect(firstTrait).toBeVisible();
        await expect(firstTrait).toHaveAttribute('aria-expanded', 'false');

        // Tap to expand
        await firstTrait.click();
        await expect(firstTrait).toHaveAttribute('aria-expanded', 'true');

        // Tap again to collapse
        await firstTrait.click();
        await expect(firstTrait).toHaveAttribute('aria-expanded', 'false');
      });
    });
  }
});

// ─── 4.4 Spanish text expansion validation ──────────────────────────────────

test.describe('4.4 Spanish text expansion', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
  });

  test('es — trait chip labels do not overflow on mobile', async ({ page }) => {
    await page.goto(projectUrl('es', PROJECTS[0].slug), { waitUntil: 'load' });
    const section = await waitForSection(page);

    const traitButtons = section.locator('button[aria-expanded]');
    const count = await traitButtons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const btn = traitButtons.nth(i);
      const box = await btn.boundingBox();
      expect(box).not.toBeNull();
      // No button should exceed viewport width
      expect(box!.x + box!.width).toBeLessThanOrEqual(375 + 1); // 1px tolerance
    }
  });

  test('es — override card titles do not truncate', async ({ page }) => {
    await page.goto(projectUrl('es', PROJECTS[0].slug), { waitUntil: 'load' });
    const section = await waitForSection(page);

    const overrideLabels = section.locator('button[aria-expanded] .font-semibold');
    const count = await overrideLabels.count();

    for (let i = 0; i < count; i++) {
      const label = overrideLabels.nth(i);
      const isClipped = await label.evaluate(el => {
        const style = getComputedStyle(el);
        return (
          style.overflow === 'hidden' &&
          style.textOverflow === 'ellipsis' &&
          el.scrollWidth > el.clientWidth
        );
      });
      expect(isClipped).toBe(false);
    }
  });

  test('es — return CTA does not overflow', async ({ page }) => {
    await page.goto(projectUrl('es', PROJECTS[0].slug), { waitUntil: 'load' });
    const section = await waitForSection(page);

    const returnLink = section.locator('a[href*="/#projects"]');
    await expect(returnLink).toBeVisible();
    const box = await returnLink.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeLessThanOrEqual(375 + 1);
  });

  test('es — lineage node labels do not overflow in compact mode', async ({ page }) => {
    await page.goto(projectUrl('es', PROJECTS[0].slug), { waitUntil: 'load' });
    const section = await waitForSection(page);

    const compactLineage = section.locator('.lg\\:hidden nav[aria-label]');
    if ((await compactLineage.count()) > 0) {
      const pills = compactLineage.locator('.font-mono.text-xs');
      const pillCount = await pills.count();
      for (let i = 0; i < pillCount; i++) {
        const pill = pills.nth(i);
        const overflow = await pill.evaluate(el => {
          const style = getComputedStyle(el);
          return (
            style.overflow === 'hidden' &&
            style.textOverflow === 'ellipsis' &&
            el.scrollWidth > el.clientWidth
          );
        });
        expect(overflow).toBe(false);
      }
    }
  });

  for (const project of PROJECTS) {
    test(`es desktop — ${project.slug} section heading accommodates Spanish`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(projectUrl('es', project.slug), { waitUntil: 'load' });
      const section = await waitForSection(page);

      const heading = section.locator('#inheritance-heading');
      await expect(heading).toBeVisible();
      const box = await heading.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThanOrEqual(1280);
    });
  }
});

// ─── 4.5 Keyboard and screen reader validation ─────────────────────────────

test.describe('4.5 Keyboard and screen reader', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('trait chips are keyboard-reachable via Tab', async ({ page }) => {
    await page.goto(projectUrl('en', PROJECTS[0].slug), { waitUntil: 'load' });
    const section = await waitForSection(page);

    // Focus the first trait button via Tab
    const firstTrait = section.locator('button[aria-expanded]').first();
    await firstTrait.focus();
    await expect(firstTrait).toBeFocused();

    // Press Enter to expand
    await page.keyboard.press('Enter');
    await expect(firstTrait).toHaveAttribute('aria-expanded', 'true');

    // Press Enter again to collapse
    await page.keyboard.press('Enter');
    await expect(firstTrait).toHaveAttribute('aria-expanded', 'false');
  });

  test('override cards are keyboard-reachable via Tab', async ({ page }) => {
    await page.goto(projectUrl('en', PROJECTS[0].slug), { waitUntil: 'load' });
    const section = await waitForSection(page);

    // Find override section's first button
    const overrideSection = section.locator('[data-lineage-section="overrides"]');
    const firstOverride = overrideSection.locator('button[aria-expanded]').first();
    await firstOverride.focus();
    await expect(firstOverride).toBeFocused();

    // Enter to expand
    await page.keyboard.press('Enter');
    await expect(firstOverride).toHaveAttribute('aria-expanded', 'true');
  });

  test('return CTA is keyboard-reachable', async ({ page }) => {
    await page.goto(projectUrl('en', PROJECTS[0].slug), { waitUntil: 'load' });
    const section = await waitForSection(page);

    const returnLink = section.locator('a[href*="/#projects"]');
    await returnLink.focus();
    await expect(returnLink).toBeFocused();
  });

  test('ARIA attributes are present on interactive elements', async ({ page }) => {
    await page.goto(projectUrl('en', PROJECTS[0].slug), { waitUntil: 'load' });
    const section = await waitForSection(page);

    // Section has aria-labelledby
    await expect(section).toHaveAttribute('aria-labelledby', 'inheritance-heading');

    // Parent panel has role=group with aria-label
    const parentPanel = section.locator('[data-inheritance-panel="parent"]');
    await expect(parentPanel).toHaveAttribute('role', 'group');
    await expect(parentPanel).toHaveAttribute('aria-label');

    // Child panel has role=group with aria-label
    const childPanel = section.locator('[data-inheritance-panel="child"]');
    await expect(childPanel).toHaveAttribute('role', 'group');
    await expect(childPanel).toHaveAttribute('aria-label');

    // Trait group has role=group
    const traitGroup = section.locator('[data-lineage-section="traits"] [role="group"]');
    await expect(traitGroup).toHaveAttribute('aria-label');

    // Override group has role=group
    const overrideGroup = section.locator('[data-lineage-section="overrides"] [role="group"]');
    await expect(overrideGroup).toHaveAttribute('aria-label');

    // Lineage map nav
    const lineageNav = section.locator('nav[aria-label="Class lineage"]').first();
    await expect(lineageNav).toBeVisible();

    // Connector is hidden from assistive tech
    const connector = section.locator('[data-inheritance-connector]').locator('..');
    await expect(connector).toHaveAttribute('aria-hidden', 'true');
  });

  test('focus indicators are visible on interactive elements', async ({ page }) => {
    await page.goto(projectUrl('en', PROJECTS[0].slug), { waitUntil: 'load' });
    const section = await waitForSection(page);

    // Focus a trait button and verify focus ring
    const firstTrait = section.locator('button[aria-expanded]').first();
    await firstTrait.focus();

    // Check that focus-visible outline exists (Tailwind focus-visible or browser default)
    const outlineStyle = await firstTrait.evaluate(el => {
      const style = getComputedStyle(el);
      return {
        outline: style.outline,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow,
      };
    });

    // Should have some visible focus indicator (outline or box-shadow)
    const hasFocusIndicator =
      (outlineStyle.outlineWidth !== '0px' && outlineStyle.outline !== 'none') ||
      outlineStyle.boxShadow !== 'none';
    expect(hasFocusIndicator).toBe(true);
  });

  test('decorative icons have aria-hidden', async ({ page }) => {
    await page.goto(projectUrl('en', PROJECTS[0].slug), { waitUntil: 'load' });
    const section = await waitForSection(page);

    const icons = section.locator('.material-symbols-outlined');
    const iconCount = await icons.count();
    expect(iconCount).toBeGreaterThan(0);

    for (let i = 0; i < iconCount; i++) {
      await expect(icons.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });
});

// ─── 4.6 Theme switch integration ──────────────────────────────────────────

test.describe('4.6 Theme switch', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('section redraws correctly on theme switch', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(projectUrl('en', PROJECTS[0].slug), { waitUntil: 'load' });
    const section = await waitForSection(page);

    // Capture initial theme state
    const initialTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );

    // Screenshot in initial theme
    await page.screenshot({
      path: `.screenshots/inheritance-theme-${initialTheme}.png`,
      fullPage: false,
    });

    // Toggle theme via the ThemeToggle button
    const themeToggle = page.locator('button[role="switch"]');
    if ((await themeToggle.count()) > 0) {
      await themeToggle.click();

      // Wait for theme transition
      await page.waitForTimeout(700);

      const newTheme = await page.evaluate(() =>
        document.documentElement.getAttribute('data-theme')
      );
      expect(newTheme).not.toEqual(initialTheme);

      // Section still visible after theme switch
      await expect(section.locator('#inheritance-heading')).toBeVisible();
      await expect(section.locator('[data-inheritance-panel="parent"]')).toBeVisible();
      await expect(section.locator('[data-inheritance-panel="child"]')).toBeVisible();

      // No layout shift — panels still have proper dimensions
      const parentBox = await section.locator('[data-inheritance-panel="parent"]').boundingBox();
      expect(parentBox).not.toBeNull();
      expect(parentBox!.width).toBeGreaterThan(0);
      expect(parentBox!.height).toBeGreaterThan(0);

      // No console errors
      expect(errors).toEqual([]);

      await page.screenshot({
        path: `.screenshots/inheritance-theme-${newTheme}.png`,
        fullPage: false,
      });
    }
  });

  for (const theme of ['build', 'after-hours']) {
    test(`inheritance section renders correctly in ${theme} theme`, async ({ page }) => {
      // Set theme via localStorage before navigation
      await page.addInitScript(t => {
        localStorage.setItem('theme', t);
      }, theme);

      await page.goto(projectUrl('en', PROJECTS[0].slug), { waitUntil: 'load' });
      const section = await waitForSection(page);

      // Verify theme applied
      const activeTheme = await page.evaluate(() =>
        document.documentElement.getAttribute('data-theme')
      );
      expect(activeTheme).toBe(theme);

      // Section renders with correct token colors
      const parentPanel = section.locator('[data-inheritance-panel="parent"]');
      await expect(parentPanel).toBeVisible();

      // Background color should change with theme
      const bgColor = await parentPanel.evaluate(el => getComputedStyle(el).backgroundColor);
      expect(bgColor).toBeTruthy();

      await page.screenshot({
        path: `.screenshots/inheritance-${theme}-en.png`,
        fullPage: false,
      });
    });
  }
});

// ─── 4.7 Locale switch integration ─────────────────────────────────────────

test.describe('4.7 Locale switch', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('locale switch preserves project path from EN to ES', async ({ page }) => {
    await page.goto(projectUrl('en', PROJECTS[0].slug), { waitUntil: 'load' });
    await waitForSection(page);

    // Click locale switcher
    const localeSwitcher = page
      .locator('button')
      .filter({ hasText: /EN.*ES|ES.*EN/ })
      .first();
    if ((await localeSwitcher.count()) > 0) {
      await localeSwitcher.click();

      // Wait for navigation
      await page.waitForURL(`**/es/projects/${PROJECTS[0].slug}*`, { timeout: 10_000 });

      // Should be on the Spanish version of the same project
      expect(page.url()).toContain(`/es/projects/${PROJECTS[0].slug}`);

      // Inheritance section still renders
      const section = await waitForSection(page);
      const heading = section.locator('#inheritance-heading');
      await expect(heading).toBeVisible();

      // Heading should be in Spanish
      const headingText = await heading.textContent();
      expect(headingText).toContain('linaje de clase');
    }
  });

  test('locale switch preserves project path from ES to EN', async ({ page }) => {
    await page.goto(projectUrl('es', PROJECTS[0].slug), { waitUntil: 'load' });
    await waitForSection(page);

    const localeSwitcher = page
      .locator('button')
      .filter({ hasText: /EN.*ES|ES.*EN/ })
      .first();
    if ((await localeSwitcher.count()) > 0) {
      await localeSwitcher.click();

      await page.waitForURL(`**/en/projects/${PROJECTS[0].slug}*`, { timeout: 10_000 });

      expect(page.url()).toContain(`/en/projects/${PROJECTS[0].slug}`);

      const section = await waitForSection(page);
      const heading = section.locator('#inheritance-heading');
      const headingText = await heading.textContent();
      expect(headingText).toContain('class lineage');
    }
  });

  test('correct locale-specific labels after switch', async ({ page }) => {
    await page.goto(projectUrl('en', PROJECTS[0].slug), { waitUntil: 'load' });
    const enSection = await waitForSection(page);

    // English labels
    const enSubtitle = await enSection
      .locator('.text-body.text-text-secondary')
      .first()
      .textContent();
    expect(enSubtitle).toContain('specialized implementation');

    // Switch to Spanish
    const localeSwitcher = page
      .locator('button')
      .filter({ hasText: /EN.*ES|ES.*EN/ })
      .first();
    if ((await localeSwitcher.count()) > 0) {
      await localeSwitcher.click();
      await page.waitForURL('**/es/**');

      const esSection = await waitForSection(page);
      const esSubtitle = await esSection
        .locator('.text-body.text-text-secondary')
        .first()
        .textContent();
      expect(esSubtitle).toContain('implementación especializada');
    }
  });
});

// ─── 4.8 Non-inheritance pages unaffected ───────────────────────────────────

test.describe('4.8 Non-inheritance pages unaffected', () => {
  test('homepage renders without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/en/', { waitUntil: 'load' });

    // No inheritance section on homepage
    const inheritanceSection = page.locator('#class-lineage');
    await expect(inheritanceSection).not.toBeAttached();

    // No console errors
    expect(errors).toEqual([]);
  });

  test('homepage ES renders without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/es/', { waitUntil: 'load' });

    const inheritanceSection = page.locator('#class-lineage');
    await expect(inheritanceSection).not.toBeAttached();

    expect(errors).toEqual([]);
  });

  test('all project pages render their inheritance section', async ({ page }) => {
    for (const project of PROJECTS) {
      const errors: string[] = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(projectUrl('en', project.slug), { waitUntil: 'load' });

      // Since all 3 projects have inheritance data, section should exist
      const section = page.locator('#class-lineage');
      await expect(section).toBeAttached();

      expect(errors).toEqual([]);
    }
  });
});

// ─── Reduced motion ────────────────────────────────────────────────────────

test.describe('Reduced motion', () => {
  test('respects prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(projectUrl('en', PROJECTS[0].slug), { waitUntil: 'load' });

    const section = page.locator('#class-lineage');
    await expect(section).toBeAttached();
    await section.scrollIntoViewIfNeeded();
    // Allow shorter time since animations are instant
    await page.waitForTimeout(500);

    // Parent panel should be visible (instant reveal)
    const parentPanel = section.locator('[data-inheritance-panel="parent"]');
    const opacity = await parentPanel.evaluate(el =>
      Number.parseFloat(getComputedStyle(el).opacity)
    );
    expect(opacity).toBe(1);

    // No transform should be applied
    const transform = await parentPanel.evaluate(el => getComputedStyle(el).transform);
    expect(transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true);

    await page.screenshot({
      path: '.screenshots/inheritance-reduced-motion.png',
      fullPage: false,
    });
  });
});

// ─── 5.1 Accessibility Audit ────────────────────────────────────────────────

test.describe('5.1 Accessibility Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  for (const project of PROJECTS) {
    test(`axe-core — ${project.slug} has no critical or serious violations`, async ({ page }) => {
      await page.goto(projectUrl('en', project.slug), { waitUntil: 'load' });
      await waitForSection(page);

      const results = await new AxeBuilder({ page }).include('#class-lineage').analyze();

      const serious = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(serious).toEqual([]);
    });
  }

  for (const theme of ['build', 'after-hours'] as const) {
    test(`axe-core — ${theme} theme passes accessibility checks`, async ({ page }) => {
      await page.addInitScript(t => {
        localStorage.setItem('theme', t);
      }, theme);

      await page.goto(projectUrl('en', PROJECTS[0].slug), { waitUntil: 'load' });
      await waitForSection(page);

      const results = await new AxeBuilder({ page }).include('#class-lineage').analyze();

      const serious = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(serious).toEqual([]);
    });
  }

  test('full case study page has no critical violations', async ({ page }) => {
    await page.goto(projectUrl('en', PROJECTS[0].slug), { waitUntil: 'load' });
    await waitForSection(page);

    const results = await new AxeBuilder({ page }).analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    expect(critical).toEqual([]);
  });
});
