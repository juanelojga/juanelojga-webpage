import type { Handler } from '@netlify/functions';
import { createHmac } from 'node:crypto';

export const handler: Handler = async event => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const stateSecret = process.env.LINKEDIN_OAUTH_STATE_SECRET;

  if (!clientId || !stateSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing required environment variables' }),
    };
  }

  const host = event.headers?.host ?? 'localhost:8888';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/linkedin/auth/callback`;

  const state = createHmac('sha256', stateSecret).update('linkedin-oauth').digest('hex');

  const scopes = ['openid', 'profile', 'w_member_social'];

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: scopes.join(' '),
  });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

  return {
    statusCode: 302,
    headers: { location: authUrl },
    body: '',
  };
};
