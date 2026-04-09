import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../linkedin-auth-start.mjs';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('LINKEDIN_CLIENT_ID', 'test_client_id');
  vi.stubEnv('LINKEDIN_OAUTH_STATE_SECRET', 'test_state_secret');
});

function makeEvent(overrides: Record<string, any> = {}) {
  return {
    httpMethod: 'GET',
    headers: {},
    queryStringParameters: {},
    body: null,
    ...overrides,
  };
}

describe('linkedin-auth-start handler', () => {
  it('should redirect to LinkedIn authorization URL', async () => {
    const response = await handler(makeEvent());

    expect(response.statusCode).toBe(302);
    expect(response.headers?.location || response.headers?.Location).toContain(
      'https://www.linkedin.com/oauth/v2/authorization'
    );
  });

  it('should include client_id in the redirect URL', async () => {
    const response = await handler(makeEvent());
    const location = response.headers?.location || response.headers?.Location;

    expect(location).toContain('client_id=test_client_id');
  });

  it('should include required scopes (openid, profile, w_member_social)', async () => {
    const response = await handler(makeEvent());
    const location = response.headers?.location || response.headers?.Location;

    expect(location).toContain('w_member_social');
    expect(location).toContain('openid');
    expect(location).toContain('profile');
  });

  it('should include redirect_uri pointing to the callback function', async () => {
    const response = await handler(makeEvent());
    const location = response.headers?.location || response.headers?.Location;

    expect(location).toContain('redirect_uri=');
    expect(location).toContain('callback');
  });

  it('should include a state parameter for CSRF protection', async () => {
    const response = await handler(makeEvent());
    const location = response.headers?.location || response.headers?.Location;

    expect(location).toContain('state=');
  });

  it('should return 500 if LINKEDIN_CLIENT_ID is missing', async () => {
    vi.stubEnv('LINKEDIN_CLIENT_ID', '');

    const response = await handler(makeEvent());

    expect(response.statusCode).toBe(500);
  });
});
