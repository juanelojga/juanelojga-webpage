import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getTokens,
  saveTokens,
  refreshAccessToken,
  isExpiringSoon,
  type LinkedInCredentials,
} from '../linkedin-tokens';

// Mock @netlify/blobs
vi.mock('@netlify/blobs', () => ({
  getStore: vi.fn(),
}));

import { getStore } from '@netlify/blobs';

const mockStore = {
  get: vi.fn(),
  setJSON: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getStore).mockReturnValue(mockStore as any);
});

const validCredentials: LinkedInCredentials = {
  access_token: 'AQV_test_access_token',
  refresh_token: 'AQX_test_refresh_token',
  expires_at: '2026-06-07T00:00:00Z',
  refresh_expires_at: '2027-04-08T00:00:00Z',
  person_id: 'urn:li:person:abc123',
};

describe('getTokens', () => {
  it('should return credentials from Netlify Blobs', async () => {
    mockStore.get.mockResolvedValue(JSON.stringify(validCredentials));

    const result = await getTokens();

    expect(getStore).toHaveBeenCalledWith('linkedin-tokens');
    expect(mockStore.get).toHaveBeenCalledWith('credentials', { type: 'json' });
    expect(result).toEqual(validCredentials);
  });

  it('should return null when no credentials exist', async () => {
    mockStore.get.mockResolvedValue(null);

    const result = await getTokens();

    expect(result).toBeNull();
  });
});

describe('saveTokens', () => {
  it('should write credentials to Netlify Blobs', async () => {
    await saveTokens(validCredentials);

    expect(getStore).toHaveBeenCalledWith('linkedin-tokens');
    expect(mockStore.setJSON).toHaveBeenCalledWith('credentials', validCredentials);
  });
});

describe('isExpiringSoon', () => {
  it('should return true if access token expires within 7 days', () => {
    const soonExpiring: LinkedInCredentials = {
      ...validCredentials,
      expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
    };

    expect(isExpiringSoon(soonExpiring)).toBe(true);
  });

  it('should return false if access token expires in more than 7 days', () => {
    const notExpiring: LinkedInCredentials = {
      ...validCredentials,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };

    expect(isExpiringSoon(notExpiring)).toBe(false);
  });

  it('should return true if access token is already expired', () => {
    const expired: LinkedInCredentials = {
      ...validCredentials,
      expires_at: new Date(Date.now() - 1000).toISOString(),
    };

    expect(isExpiringSoon(expired)).toBe(true);
  });
});

describe('refreshAccessToken', () => {
  it('should exchange refresh token for new access token', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: 'new_access_token',
          expires_in: 5184000, // 60 days in seconds
          refresh_token: 'new_refresh_token',
          refresh_token_expires_in: 31536000, // 365 days
        }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await refreshAccessToken(validCredentials, 'client_id', 'client_secret');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.linkedin.com/oauth/v2/accessToken',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      })
    );

    expect(result.access_token).toBe('new_access_token');
    expect(result.refresh_token).toBe('new_refresh_token');
    expect(result.person_id).toBe(validCredentials.person_id);
  });

  it('should throw if refresh request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      })
    );

    await expect(
      refreshAccessToken(validCredentials, 'client_id', 'client_secret')
    ).rejects.toThrow();
  });

  it('should save refreshed tokens to Blobs', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'new_access_token',
            expires_in: 5184000,
            refresh_token: 'new_refresh_token',
            refresh_token_expires_in: 31536000,
          }),
      })
    );

    await refreshAccessToken(validCredentials, 'client_id', 'client_secret');

    expect(mockStore.setJSON).toHaveBeenCalledWith(
      'credentials',
      expect.objectContaining({
        access_token: 'new_access_token',
      })
    );
  });
});
