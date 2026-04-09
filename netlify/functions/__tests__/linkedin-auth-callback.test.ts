import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../linkedin-auth-callback.mjs';

vi.mock('../lib/linkedin-tokens', () => ({
  saveTokens: vi.fn(),
}));

import { saveTokens } from '../lib/linkedin-tokens';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('LINKEDIN_CLIENT_ID', 'test_client_id');
  vi.stubEnv('LINKEDIN_CLIENT_SECRET', 'test_client_secret');
  vi.stubEnv('LINKEDIN_OAUTH_STATE_SECRET', 'test_state_secret');
});

function makeEvent(queryParams: Record<string, string> = {}) {
  return {
    httpMethod: 'GET',
    headers: {},
    queryStringParameters: queryParams,
    body: null,
  };
}

describe('linkedin-auth-callback handler', () => {
  it('should return error if code parameter is missing', async () => {
    const response = await handler(makeEvent({ state: 'valid_state' }));

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('should return error if state parameter is missing', async () => {
    const response = await handler(makeEvent({ code: 'auth_code' }));

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('should return error if state validation fails', async () => {
    const response = await handler(makeEvent({ code: 'auth_code', state: 'invalid_state' }));

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('should exchange authorization code for tokens', async () => {
    // Mock token exchange
    const mockFetch = vi
      .fn()
      // First call: token exchange
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'new_access_token',
            expires_in: 5184000,
            refresh_token: 'new_refresh_token',
            refresh_token_expires_in: 31536000,
          }),
      })
      // Second call: fetch person ID
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sub: 'abc123' }),
      });
    vi.stubGlobal('fetch', mockFetch);

    // Generate a valid state (implementation will define the exact mechanism)
    const response = await handler(
      makeEvent({
        code: 'auth_code',
        state: 'b6171e1b6288d89e2ab3a3aadbdf23b34a485785aa57c82ed0a4ce0f37e96ef3',
      })
    );

    // Token exchange should have been attempted
    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.linkedin.com/oauth/v2/accessToken',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should fetch LinkedIn person ID after token exchange', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'access_token',
            expires_in: 5184000,
            refresh_token: 'refresh_token',
            refresh_token_expires_in: 31536000,
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sub: 'person123' }),
      });
    vi.stubGlobal('fetch', mockFetch);

    await handler(
      makeEvent({
        code: 'auth_code',
        state: 'b6171e1b6288d89e2ab3a3aadbdf23b34a485785aa57c82ed0a4ce0f37e96ef3',
      })
    );

    // Should have called the profile/userinfo endpoint
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const profileCall = mockFetch.mock.calls[1];
    expect(profileCall[0]).toContain('linkedin.com');
  });

  it('should save tokens to Netlify Blobs', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'access_token',
            expires_in: 5184000,
            refresh_token: 'refresh_token',
            refresh_token_expires_in: 31536000,
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sub: 'person123' }),
      });
    vi.stubGlobal('fetch', mockFetch);

    await handler(
      makeEvent({
        code: 'auth_code',
        state: 'b6171e1b6288d89e2ab3a3aadbdf23b34a485785aa57c82ed0a4ce0f37e96ef3',
      })
    );

    expect(saveTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        person_id: expect.stringContaining('person123'),
      })
    );
  });

  it('should return success HTML page on success', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'access_token',
            expires_in: 5184000,
            refresh_token: 'refresh_token',
            refresh_token_expires_in: 31536000,
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sub: 'person123' }),
      });
    vi.stubGlobal('fetch', mockFetch);

    const response = await handler(
      makeEvent({
        code: 'auth_code',
        state: 'b6171e1b6288d89e2ab3a3aadbdf23b34a485785aa57c82ed0a4ce0f37e96ef3',
      })
    );

    expect(response.statusCode).toBe(200);
    expect(response.headers?.['content-type'] || response.headers?.['Content-Type']).toContain(
      'text/html'
    );
  });

  it('should return error if token exchange fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad request'),
      })
    );

    const response = await handler(
      makeEvent({
        code: 'bad_code',
        state: 'b6171e1b6288d89e2ab3a3aadbdf23b34a485785aa57c82ed0a4ce0f37e96ef3',
      })
    );

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('should return 500 if LINKEDIN_OAUTH_STATE_SECRET is missing', async () => {
    vi.stubEnv('LINKEDIN_OAUTH_STATE_SECRET', '');

    const response = await handler(makeEvent({ code: 'auth_code', state: 'some_state' }));

    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body ?? '');
    expect(body.error).toContain('LINKEDIN_OAUTH_STATE_SECRET');
  });

  it('should handle LinkedIn error callback (error query param)', async () => {
    const response = await handler(
      makeEvent({
        error: 'user_cancelled_authorize',
        error_description: 'User cancelled',
      })
    );

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });
});
