import { describe, it, expect } from 'vitest';
import {
  calculateReadingTime,
  generateTableOfContents,
  paginatePosts,
  getUniqueTags,
  getUniqueCategories,
  getBilingualSlug,
  POSTS_PER_PAGE,
} from '../blog';
import type { BlogPost } from '../blog';

function makePost(overrides: Partial<BlogPost['data']> = {}): BlogPost {
  return {
    id: 'test-post',
    data: {
      title: 'Test Post',
      date: new Date('2026-01-01'),
      tags: ['test'],
      summary: 'A test post',
      language: 'en',
      slug: 'test-post',
      category: 'ai',
      draft: false,
      readingTime: 5,
      ...overrides,
    },
  };
}

describe('calculateReadingTime', () => {
  it('should return 1 for very short content', () => {
    expect(calculateReadingTime('hello world')).toBe(1);
  });

  it('should return correct reading time for 400 words', () => {
    const words = Array(400).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(2);
  });

  it('should return correct reading time for 1000 words', () => {
    const words = Array(1000).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(5);
  });

  it('should handle empty string', () => {
    expect(calculateReadingTime('')).toBe(1);
  });
});

describe('generateTableOfContents', () => {
  it('should generate nested TOC from headings', () => {
    const headings = [
      { depth: 2, slug: 'intro', text: 'Introduction' },
      { depth: 3, slug: 'sub-a', text: 'Sub A' },
      { depth: 3, slug: 'sub-b', text: 'Sub B' },
      { depth: 2, slug: 'conclusion', text: 'Conclusion' },
    ];

    const toc = generateTableOfContents(headings);

    expect(toc).toHaveLength(2);
    expect(toc[0].text).toBe('Introduction');
    expect(toc[0].children).toHaveLength(2);
    expect(toc[0].children[0].text).toBe('Sub A');
    expect(toc[1].text).toBe('Conclusion');
    expect(toc[1].children).toHaveLength(0);
  });

  it('should skip h1 and h4+ headings', () => {
    const headings = [
      { depth: 1, slug: 'title', text: 'Title' },
      { depth: 2, slug: 'section', text: 'Section' },
      { depth: 4, slug: 'deep', text: 'Deep' },
    ];

    const toc = generateTableOfContents(headings);
    expect(toc).toHaveLength(1);
    expect(toc[0].text).toBe('Section');
  });

  it('should return empty array for no headings', () => {
    expect(generateTableOfContents([])).toHaveLength(0);
  });
});

describe('paginatePosts', () => {
  const posts = Array.from({ length: 15 }, (_, i) =>
    makePost({ title: `Post ${i}`, slug: `post-${i}`, date: new Date(2026, 0, i + 1) })
  );

  it('should return correct page of posts', () => {
    const result = paginatePosts(posts, 1);
    expect(result.posts).toHaveLength(POSTS_PER_PAGE);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(3);
  });

  it('should return last page correctly', () => {
    const result = paginatePosts(posts, 3);
    expect(result.posts).toHaveLength(3); // 15 - 12 = 3
    expect(result.currentPage).toBe(3);
  });

  it('should clamp page to valid range', () => {
    const result = paginatePosts(posts, 99);
    expect(result.currentPage).toBe(3);
  });

  it('should handle page 0 or negative', () => {
    const result = paginatePosts(posts, 0);
    expect(result.currentPage).toBe(1);
  });

  it('should handle empty posts', () => {
    const result = paginatePosts([], 1);
    expect(result.posts).toHaveLength(0);
    expect(result.totalPages).toBe(1);
  });
});

describe('getUniqueTags', () => {
  it('should extract and sort unique tags', () => {
    const posts = [makePost({ tags: ['react', 'ai'] }), makePost({ tags: ['ai', 'python'] })];

    const tags = getUniqueTags(posts);
    expect(tags).toEqual(['ai', 'python', 'react']);
  });

  it('should return empty for no posts', () => {
    expect(getUniqueTags([])).toEqual([]);
  });
});

describe('getUniqueCategories', () => {
  it('should extract and sort unique categories', () => {
    const posts = [
      makePost({ category: 'frontend' }),
      makePost({ category: 'ai' }),
      makePost({ category: 'frontend' }),
    ];

    const categories = getUniqueCategories(posts);
    expect(categories).toEqual(['ai', 'frontend']);
  });
});

describe('getBilingualSlug', () => {
  it('should build correct URL for English', () => {
    expect(getBilingualSlug('my-post', 'en')).toBe('/en/blog/my-post/');
  });

  it('should build correct URL for Spanish', () => {
    expect(getBilingualSlug('my-post', 'es')).toBe('/es/blog/my-post/');
  });
});
