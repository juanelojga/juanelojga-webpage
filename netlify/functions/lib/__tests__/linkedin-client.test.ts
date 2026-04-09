import { describe, it, expect, vi, beforeEach } from 'vitest';
import { publishPost, addComment } from '../linkedin-client';

beforeEach(() => {
  vi.clearAllMocks();
});

const accessToken = 'AQV_test_token';
const personId = 'urn:li:person:abc123';

describe('publishPost', () => {
  it('should POST to LinkedIn /posts endpoint with correct headers', async () => {
    const postUrn = 'urn:li:share:12345';
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'x-restli-id': postUrn }),
      json: () => Promise.resolve({ id: postUrn }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await publishPost(accessToken, personId, 'Hello LinkedIn!');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.linkedin.com/rest/posts',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'LinkedIn-Version': '202601',
          'X-Restli-Protocol-Version': '2.0.0',
        }),
      })
    );

    // Verify body structure
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.author).toBe(personId);
    expect(callBody.commentary).toBe('Hello LinkedIn!');
    expect(callBody.visibility).toBe('PUBLIC');
    expect(callBody.distribution.feedDistribution).toBe('MAIN_FEED');
    expect(callBody.lifecycleState).toBe('PUBLISHED');
  });

  it('should return the post URN from response', async () => {
    const postUrn = 'urn:li:share:12345';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        headers: new Headers({ 'x-restli-id': postUrn }),
        json: () => Promise.resolve({ id: postUrn }),
      })
    );

    const result = await publishPost(accessToken, personId, 'Test');
    expect(result).toBe(postUrn);
  });

  it('should throw on non-2xx response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: () => Promise.resolve('Forbidden'),
      })
    );

    await expect(publishPost(accessToken, personId, 'Test')).rejects.toThrow();
  });

  it('should throw on empty post text', async () => {
    await expect(publishPost(accessToken, personId, '')).rejects.toThrow();
  });
});

describe('addComment', () => {
  it('should POST comment to the correct post URN endpoint', async () => {
    const postUrn = 'urn:li:share:12345';
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', mockFetch);

    await addComment(accessToken, personId, postUrn, 'Read more: https://example.com');

    expect(mockFetch).toHaveBeenCalledWith(
      `https://api.linkedin.com/rest/socialActions/${encodeURIComponent('urn:li:share:12345')}/comments`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Bearer ${accessToken}`,
          'LinkedIn-Version': '202601',
        }),
      })
    );

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.actor).toBe(personId);
    expect(callBody.object).toBe(postUrn);
    expect(callBody.message.text).toBe('Read more: https://example.com');
  });

  it('should throw on non-2xx response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Server error'),
      })
    );

    await expect(addComment(accessToken, personId, 'urn:li:share:12345', 'Test')).rejects.toThrow();
  });
});
