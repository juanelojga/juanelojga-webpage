import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../linkedin-publish.mjs';

vi.mock('../lib/linkedin-tokens', () => ({
  getTokens: vi.fn(),
  refreshAccessToken: vi.fn(),
  isExpiringSoon: vi.fn(),
  saveTokens: vi.fn(),
}));

vi.mock('../lib/linkedin-client', () => ({
  publishPost: vi.fn(),
  addComment: vi.fn(),
}));

vi.mock('../lib/linkedin-post-generator', () => ({
  generateLinkedInPost: vi.fn(),
}));

vi.mock('../lib/blog-fetcher', () => ({
  fetchBlogContent: vi.fn(),
}));

import { getTokens, refreshAccessToken, isExpiringSoon } from '../lib/linkedin-tokens';
import { publishPost, addComment } from '../lib/linkedin-client';
import { generateLinkedInPost } from '../lib/linkedin-post-generator';
import { fetchBlogContent } from '../lib/blog-fetcher';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('LINKEDIN_PUBLISH_SECRET', 'test_publish_secret');
  vi.stubEnv('LINKEDIN_CLIENT_ID', 'test_client_id');
  vi.stubEnv('LINKEDIN_CLIENT_SECRET', 'test_client_secret');
});

const validTokens = {
  access_token: 'valid_token',
  refresh_token: 'refresh_token',
  expires_at: '2026-06-07T00:00:00Z',
  refresh_expires_at: '2027-04-08T00:00:00Z',
  person_id: 'urn:li:person:abc123',
};

const fakeBlog = {
  title: 'Test Blog Post',
  summary: 'A test summary',
  tags: ['test'],
  slug: 'test-blog-post',
  body: 'Full blog body text',
};

function makeEvent(overrides: Record<string, any> = {}) {
  return {
    httpMethod: 'POST',
    headers: {
      authorization: 'Bearer test_publish_secret',
    },
    queryStringParameters: {},
    body: JSON.stringify({ slug: 'test-blog-post' }),
    ...overrides,
  };
}

describe('linkedin-publish handler', () => {
  describe('authentication', () => {
    it('should return 401 if no authorization header', async () => {
      const response = await handler(makeEvent({ headers: {} }));

      expect(response.statusCode).toBe(401);
    });

    it('should return 403 if bearer token is wrong', async () => {
      const response = await handler(
        makeEvent({ headers: { authorization: 'Bearer wrong_secret' } })
      );

      expect(response.statusCode).toBe(403);
    });

    it('should accept valid bearer token', async () => {
      vi.mocked(getTokens).mockResolvedValue(validTokens);
      vi.mocked(isExpiringSoon).mockReturnValue(false);
      vi.mocked(fetchBlogContent).mockResolvedValue(fakeBlog);
      vi.mocked(generateLinkedInPost).mockResolvedValue('Generated post');
      vi.mocked(publishPost).mockResolvedValue('urn:li:share:123');

      const response = await handler(makeEvent());

      expect(response.statusCode).toBeLessThan(400);
    });
  });

  describe('token management', () => {
    it('should return 401 if no LinkedIn tokens are stored', async () => {
      vi.mocked(getTokens).mockResolvedValue(null);

      const response = await handler(makeEvent());

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('token');
    });

    it('should auto-refresh tokens if expiring soon', async () => {
      vi.mocked(getTokens).mockResolvedValue(validTokens);
      vi.mocked(isExpiringSoon).mockReturnValue(true);
      vi.mocked(refreshAccessToken).mockResolvedValue({
        ...validTokens,
        access_token: 'refreshed_token',
      });
      vi.mocked(fetchBlogContent).mockResolvedValue(fakeBlog);
      vi.mocked(generateLinkedInPost).mockResolvedValue('Generated post');
      vi.mocked(publishPost).mockResolvedValue('urn:li:share:123');

      await handler(makeEvent());

      expect(refreshAccessToken).toHaveBeenCalledWith(
        validTokens,
        'test_client_id',
        'test_client_secret'
      );
    });
  });

  describe('dry run mode', () => {
    it('should return generated post without publishing when dry_run=true', async () => {
      vi.mocked(getTokens).mockResolvedValue(validTokens);
      vi.mocked(isExpiringSoon).mockReturnValue(false);
      vi.mocked(fetchBlogContent).mockResolvedValue(fakeBlog);
      vi.mocked(generateLinkedInPost).mockResolvedValue('Preview post content');

      const response = await handler(
        makeEvent({
          httpMethod: 'GET',
          queryStringParameters: { slug: 'test-post', dry_run: 'true' },
          body: null,
        })
      );

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.post).toBe('Preview post content');
      expect(publishPost).not.toHaveBeenCalled();
    });

    it('should support dryRun via POST body', async () => {
      vi.mocked(getTokens).mockResolvedValue(validTokens);
      vi.mocked(isExpiringSoon).mockReturnValue(false);
      vi.mocked(fetchBlogContent).mockResolvedValue(fakeBlog);
      vi.mocked(generateLinkedInPost).mockResolvedValue('Preview post content');

      const response = await handler(
        makeEvent({
          body: JSON.stringify({ slug: 'test-blog-post', dryRun: true }),
        })
      );

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.dryRun).toBe(true);
      expect(publishPost).not.toHaveBeenCalled();
    });
  });

  describe('publishing', () => {
    it('should fetch blog content and pass it to AI generator', async () => {
      vi.mocked(getTokens).mockResolvedValue(validTokens);
      vi.mocked(isExpiringSoon).mockReturnValue(false);
      vi.mocked(fetchBlogContent).mockResolvedValue(fakeBlog);
      vi.mocked(generateLinkedInPost).mockResolvedValue('Post content');
      vi.mocked(publishPost).mockResolvedValue('urn:li:share:123');

      await handler(makeEvent());

      expect(fetchBlogContent).toHaveBeenCalledWith('https://www.juanelojga.com', 'test-blog-post');
      expect(generateLinkedInPost).toHaveBeenCalledWith(fakeBlog);
    });

    it('should return 404 if blog slug not found', async () => {
      vi.mocked(getTokens).mockResolvedValue(validTokens);
      vi.mocked(isExpiringSoon).mockReturnValue(false);
      vi.mocked(fetchBlogContent).mockResolvedValue(null);

      const response = await handler(
        makeEvent({
          body: JSON.stringify({ slug: 'nonexistent-slug' }),
        })
      );

      expect(response.statusCode).toBe(404);
    });

    it('should publish generated post to LinkedIn', async () => {
      vi.mocked(getTokens).mockResolvedValue(validTokens);
      vi.mocked(isExpiringSoon).mockReturnValue(false);
      vi.mocked(fetchBlogContent).mockResolvedValue(fakeBlog);
      vi.mocked(generateLinkedInPost).mockResolvedValue('Amazing post content');
      vi.mocked(publishPost).mockResolvedValue('urn:li:share:123');

      await handler(makeEvent());

      expect(publishPost).toHaveBeenCalledWith(
        validTokens.access_token,
        validTokens.person_id,
        'Amazing post content'
      );
    });

    it('should add first comment with blog URL by default', async () => {
      vi.mocked(getTokens).mockResolvedValue(validTokens);
      vi.mocked(isExpiringSoon).mockReturnValue(false);
      vi.mocked(fetchBlogContent).mockResolvedValue(fakeBlog);
      vi.mocked(generateLinkedInPost).mockResolvedValue('Post content');
      vi.mocked(publishPost).mockResolvedValue('urn:li:share:123');

      await handler(makeEvent());

      expect(addComment).toHaveBeenCalledWith(
        validTokens.access_token,
        validTokens.person_id,
        'urn:li:share:123',
        expect.stringContaining('test-blog-post')
      );
    });

    it('should skip first comment when noComment is true', async () => {
      vi.mocked(getTokens).mockResolvedValue(validTokens);
      vi.mocked(isExpiringSoon).mockReturnValue(false);
      vi.mocked(fetchBlogContent).mockResolvedValue(fakeBlog);
      vi.mocked(generateLinkedInPost).mockResolvedValue('Post content');
      vi.mocked(publishPost).mockResolvedValue('urn:li:share:123');

      await handler(
        makeEvent({
          body: JSON.stringify({ slug: 'test-blog-post', noComment: true }),
        })
      );

      expect(addComment).not.toHaveBeenCalled();
    });

    it('should return post URN and generated content on success', async () => {
      vi.mocked(getTokens).mockResolvedValue(validTokens);
      vi.mocked(isExpiringSoon).mockReturnValue(false);
      vi.mocked(fetchBlogContent).mockResolvedValue(fakeBlog);
      vi.mocked(generateLinkedInPost).mockResolvedValue('Post content');
      vi.mocked(publishPost).mockResolvedValue('urn:li:share:123');

      const response = await handler(makeEvent());

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.postUrn).toBe('urn:li:share:123');
      expect(body.post).toBe('Post content');
    });
  });

  describe('error handling', () => {
    it('should return 400 if slug is missing', async () => {
      vi.mocked(getTokens).mockResolvedValue(validTokens);
      vi.mocked(isExpiringSoon).mockReturnValue(false);

      const response = await handler(
        makeEvent({
          body: JSON.stringify({}),
        })
      );

      expect(response.statusCode).toBe(400);
    });

    it('should return 500 if LinkedIn API fails', async () => {
      vi.mocked(getTokens).mockResolvedValue(validTokens);
      vi.mocked(isExpiringSoon).mockReturnValue(false);
      vi.mocked(fetchBlogContent).mockResolvedValue(fakeBlog);
      vi.mocked(generateLinkedInPost).mockResolvedValue('Post content');
      vi.mocked(publishPost).mockRejectedValue(new Error('LinkedIn API error'));

      const response = await handler(makeEvent());

      expect(response.statusCode).toBe(500);
    });

    it('should return 500 if AI generation fails', async () => {
      vi.mocked(getTokens).mockResolvedValue(validTokens);
      vi.mocked(isExpiringSoon).mockReturnValue(false);
      vi.mocked(fetchBlogContent).mockResolvedValue(fakeBlog);
      vi.mocked(generateLinkedInPost).mockRejectedValue(new Error('AI generation failed'));

      const response = await handler(makeEvent());

      expect(response.statusCode).toBe(500);
    });
  });
});
