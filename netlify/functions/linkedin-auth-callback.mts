import type { Handler } from '@netlify/functions';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { saveTokens } from './lib/linkedin-tokens';

function generateState(secret: string): string {
  return createHmac('sha256', secret).update('linkedin-oauth').digest('hex');
}

function validateState(state: string, secret: string): boolean {
  const expected = generateState(secret);
  if (state.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(state), Buffer.from(expected));
}

export const handler: Handler = async event => {
  const params = event.queryStringParameters ?? {};

  // Handle LinkedIn error callback
  if (params.error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: params.error,
        description: params.error_description,
      }),
    };
  }

  const { code, state } = params;

  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing authorization code' }),
    };
  }

  if (!state) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing state parameter' }),
    };
  }

  // Validate CSRF state
  const stateSecret = process.env.LINKEDIN_OAUTH_STATE_SECRET ?? '';
  if (!stateSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing LINKEDIN_OAUTH_STATE_SECRET environment variable' }),
    };
  }

  if (!validateState(state, stateSecret)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'State validation failed' }),
    };
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID ?? '';
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET ?? '';
  const host = event.headers?.host ?? 'localhost:8888';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/linkedin/auth/callback`;

  try {
    // Exchange authorization code for tokens
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    });

    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text();
      return {
        statusCode: tokenResponse.status,
        body: JSON.stringify({ error: 'Token exchange failed', details: text }),
      };
    }

    const tokenData = await tokenResponse.json();

    // Fetch LinkedIn person ID via userinfo
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileResponse.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch LinkedIn profile' }),
      };
    }

    const profile = await profileResponse.json();

    const expiresIn = tokenData.expires_in ?? 5184000; // 60 days default
    const refreshExpiresIn = tokenData.refresh_token_expires_in ?? 31536000; // 365 days default

    await saveTokens({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      refresh_expires_at: new Date(Date.now() + refreshExpiresIn * 1000).toISOString(),
      person_id: `urn:li:person:${profile.sub}`,
    });

    return {
      statusCode: 200,
      headers: { 'content-type': 'text/html' },
      body: '<html><body><h1>LinkedIn connected successfully!</h1><p>You can close this window.</p></body></html>',
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'OAuth callback failed', details: message }),
    };
  }
};
