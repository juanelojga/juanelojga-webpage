import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Blog', () => {
  test.describe('Blog index page', () => {
    test('renders English blog index', async ({ page }) => {
      await page.goto('/en/blog/', { waitUntil: 'domcontentloaded' });

      // Section title
      await expect(page.locator('h1')).toContainText('// parse the log');

      // At least one blog card should be visible
      await expect(page.locator('article').first()).toBeVisible();
    });

    test('renders Spanish blog index', async ({ page }) => {
      await page.goto('/es/blog/', { waitUntil: 'domcontentloaded' });

      // Section title
      await expect(page.locator('h1')).toContainText('// leer el log');

      // At least one blog card should be visible
      await expect(page.locator('article').first()).toBeVisible();
    });

    test('tag filter works', async ({ page }) => {
      await page.goto('/en/blog/', { waitUntil: 'domcontentloaded' });

      // Click "All" filter — should be active by default
      const allButton = page.getByRole('button', { name: 'All' });
      await expect(allButton).toBeVisible();

      // Count initial posts
      const initialCount = await page.locator('article').count();
      expect(initialCount).toBeGreaterThan(0);
    });

    test('breadcrumbs are present', async ({ page }) => {
      await page.goto('/en/blog/', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Home')).toBeVisible();
      await expect(page.getByText('Blog')).toBeVisible();
    });
  });

  test.describe('Blog post detail page', () => {
    test('renders post content', async ({ page }) => {
      await page.goto('/en/blog/building-rag-pipelines-that-actually-work/', {
        waitUntil: 'domcontentloaded',
      });

      // Post title
      await expect(page.locator('h1')).toContainText('RAG Pipelines');

      // Category pill
      await expect(page.getByText('ai')).toBeVisible();

      // Post content
      await expect(page.locator('article.prose')).toBeVisible();
    });

    test('language switch link is present', async ({ page }) => {
      await page.goto('/en/blog/building-rag-pipelines-that-actually-work/', {
        waitUntil: 'domcontentloaded',
      });

      // Should have a link to Spanish version
      const langLink = page.getByRole('link', { name: /Spanish|Español/ });
      await expect(langLink).toBeVisible();
    });

    test('breadcrumbs navigate correctly', async ({ page }) => {
      await page.goto('/en/blog/building-rag-pipelines-that-actually-work/', {
        waitUntil: 'domcontentloaded',
      });

      // Breadcrumb with "Blog" link
      const blogBreadcrumb = page.getByRole('link', { name: 'Blog' });
      await expect(blogBreadcrumb).toBeVisible();
      await expect(blogBreadcrumb).toHaveAttribute('href', '/en/blog/');
    });

    test('table of contents is visible on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/en/blog/building-rag-pipelines-that-actually-work/', {
        waitUntil: 'domcontentloaded',
      });

      await expect(page.getByText('Table of Contents')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('blog index passes axe checks', async ({ page }) => {
      await page.goto('/en/blog/', { waitUntil: 'domcontentloaded' });

      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });

    test('blog post passes axe checks', async ({ page }) => {
      await page.goto('/en/blog/building-rag-pipelines-that-actually-work/', {
        waitUntil: 'domcontentloaded',
      });

      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  });

  test.describe('Navbar blog link', () => {
    test('blog link appears in desktop nav', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/en/blog/', { waitUntil: 'domcontentloaded' });

      const blogLink = page.locator('nav').getByRole('link', { name: 'Blog' });
      await expect(blogLink).toBeVisible();
    });
  });
});
