import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateLinkedInPost } from '../linkedin-post-generator';

// Mock the github-models module
vi.mock('../github-models', () => ({
  createClient: vi.fn(),
  chat: vi.fn(),
}));

import { createClient, chat } from '../github-models';

beforeEach(() => {
  vi.clearAllMocks();
});

const sampleBlogContent = {
  title: 'Why React Re-Renders Are Ruining Your Performance',
  summary: 'A deep dive into React re-render patterns and how to fix them.',
  tags: ['react', 'performance', 'frontend'],
  slug: 'why-reacts-re-renders-are-ruining-your-performance',
  body: `
# Why React Re-Renders Are Ruining Your Performance

React's virtual DOM diffing is powerful, but unnecessary re-renders can tank your app's performance.

## The Problem

Every state change triggers a re-render cascade. Components that don't need to update still re-render.

## Solutions

1. Use React.memo for pure components
2. useMemo for expensive calculations
3. useCallback for stable function references
  `.trim(),
};

describe('generateLinkedInPost', () => {
  it('should call AI with blog content and return generated post', async () => {
    const mockClient = {};
    vi.mocked(createClient).mockReturnValue(mockClient as any);
    vi.mocked(chat).mockResolvedValue(
      JSON.stringify({
        post: 'Just published a deep dive on React re-renders. Here are 3 patterns that can save your app...',
      })
    );

    const result = await generateLinkedInPost(
      sampleBlogContent,
      'https://juanelojga.com/en/blog/test'
    );

    expect(createClient).toHaveBeenCalled();
    expect(chat).toHaveBeenCalledWith(
      mockClient,
      expect.stringContaining('LinkedIn'),
      expect.stringContaining(sampleBlogContent.title),
      expect.any(String)
    );
    expect(result).toContain('React re-renders');
  });

  it('should pass blog title, summary, body, and URL to the AI prompt', async () => {
    vi.mocked(createClient).mockReturnValue({} as any);
    vi.mocked(chat).mockResolvedValue(JSON.stringify({ post: 'Generated post content' }));

    const blogUrl = 'https://juanelojga.com/en/blog/test';
    await generateLinkedInPost(sampleBlogContent, blogUrl);

    const userPrompt = vi.mocked(chat).mock.calls[0][2];
    expect(userPrompt).toContain(sampleBlogContent.title);
    expect(userPrompt).toContain(sampleBlogContent.summary);
    expect(userPrompt).toContain('React');
    expect(userPrompt).toContain(blogUrl);
  });

  it('should enforce post length between 100 and 300 words via system prompt', async () => {
    vi.mocked(createClient).mockReturnValue({} as any);
    vi.mocked(chat).mockResolvedValue(JSON.stringify({ post: 'Short post' }));

    await generateLinkedInPost(sampleBlogContent, 'https://juanelojga.com/en/blog/test');

    const systemPrompt = vi.mocked(chat).mock.calls[0][1];
    expect(systemPrompt).toMatch(/100/);
    expect(systemPrompt).toMatch(/300/);
  });

  it('should instruct AI to include the blog URL in the post body', async () => {
    vi.mocked(createClient).mockReturnValue({} as any);
    vi.mocked(chat).mockResolvedValue(JSON.stringify({ post: 'Post with URL' }));

    await generateLinkedInPost(sampleBlogContent, 'https://juanelojga.com/en/blog/test');

    const systemPrompt = vi.mocked(chat).mock.calls[0][1];
    expect(systemPrompt.toLowerCase()).toContain('url');
    expect(systemPrompt.toLowerCase()).toContain('include the blog url');
  });

  it('should instruct AI to end with a discussion question', async () => {
    vi.mocked(createClient).mockReturnValue({} as any);
    vi.mocked(chat).mockResolvedValue(JSON.stringify({ post: 'Post with question?' }));

    await generateLinkedInPost(sampleBlogContent, 'https://juanelojga.com/en/blog/test');

    const systemPrompt = vi.mocked(chat).mock.calls[0][1];
    expect(systemPrompt.toLowerCase()).toContain('question');
  });

  it('should throw if AI returns empty content', async () => {
    vi.mocked(createClient).mockReturnValue({} as any);
    vi.mocked(chat).mockResolvedValue(JSON.stringify({ post: '' }));

    await expect(
      generateLinkedInPost(sampleBlogContent, 'https://juanelojga.com/en/blog/test')
    ).rejects.toThrow();
  });

  it('should throw if AI returns malformed JSON', async () => {
    vi.mocked(createClient).mockReturnValue({} as any);
    vi.mocked(chat).mockResolvedValue('not valid json');

    await expect(
      generateLinkedInPost(sampleBlogContent, 'https://juanelojga.com/en/blog/test')
    ).rejects.toThrow();
  });
});
