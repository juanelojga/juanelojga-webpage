import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchBlogContent } from '../blog-fetcher';

beforeEach(() => {
  vi.clearAllMocks();
});

const sampleHtml = `<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="Test Blog Title">
  <meta property="og:description" content="A test summary of the blog post">
  <script type="application/ld+json">
  {"@type":"BlogPosting","headline":"Test Blog Title","keywords":"react, testing, performance"}
  </script>
</head>
<body>
  <article>
    <h1>Test Blog Title</h1>
    <p>This is the blog body content with <strong>bold</strong> text.</p>
    <p>Second paragraph here.</p>
  </article>
</body>
</html>`;

describe('fetchBlogContent', () => {
  it('should fetch and parse blog content from the site', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(sampleHtml),
      })
    );

    const result = await fetchBlogContent('https://example.com', 'test-post');

    expect(result).not.toBeNull();
    expect(result!.title).toBe('Test Blog Title');
    expect(result!.summary).toBe('A test summary of the blog post');
    expect(result!.tags).toEqual(['react', 'testing', 'performance']);
    expect(result!.slug).toBe('test-post');
    expect(result!.body).toContain('blog body content');
  });

  it('should fetch the correct URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(sampleHtml),
    });
    vi.stubGlobal('fetch', mockFetch);

    await fetchBlogContent('https://example.com', 'my-slug');

    expect(mockFetch).toHaveBeenCalledWith('https://example.com/en/blog/my-slug/');
  });

  it('should return null if the page returns non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));

    const result = await fetchBlogContent('https://example.com', 'nonexistent');

    expect(result).toBeNull();
  });

  it('should strip HTML tags from article body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(sampleHtml),
      })
    );

    const result = await fetchBlogContent('https://example.com', 'test-post');

    expect(result!.body).not.toContain('<');
    expect(result!.body).not.toContain('>');
    expect(result!.body).toContain('bold');
  });

  it('should decode HTML entities in body', async () => {
    const htmlWithEntities = `<html>
<head><meta property="og:title" content="Test"></head>
<body><article><p>Tom &amp; Jerry &lt;3 &quot;tests&quot;</p></article></body>
</html>`;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(htmlWithEntities),
      })
    );

    const result = await fetchBlogContent('https://example.com', 'test');

    expect(result!.body).toContain('Tom & Jerry');
    expect(result!.body).toContain('"tests"');
  });

  it('should return empty tags if no JSON-LD keywords found', async () => {
    const htmlNoKeywords = `<html>
<head><meta property="og:title" content="Test"></head>
<body><article><p>Content</p></article></body>
</html>`;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(htmlNoKeywords),
      })
    );

    const result = await fetchBlogContent('https://example.com', 'test');

    expect(result!.tags).toEqual([]);
  });

  it('should use slug as title fallback when og:title is missing', async () => {
    const htmlNoTitle = `<html>
<head></head>
<body><article><p>Content</p></article></body>
</html>`;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(htmlNoTitle),
      })
    );

    const result = await fetchBlogContent('https://example.com', 'my-slug');

    expect(result!.title).toBe('my-slug');
  });

  it('should return null if article body is empty', async () => {
    const htmlEmptyArticle = `<html>
<head><meta property="og:title" content="Test"></head>
<body><article></article></body>
</html>`;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(htmlEmptyArticle),
      })
    );

    const result = await fetchBlogContent('https://example.com', 'test');

    expect(result).toBeNull();
  });
});
