import { getStore } from '@netlify/blobs';

export interface LinkedInCredentials {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  refresh_expires_at: string;
  person_id: string;
}

const STORE_NAME = 'linkedin-tokens';
const KEY = 'credentials';

export async function getTokens(): Promise<LinkedInCredentials | null> {
  const store = getStore(STORE_NAME);
  const raw = await store.get(KEY, { type: 'json' });
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function saveTokens(credentials: LinkedInCredentials): Promise<void> {
  const store = getStore(STORE_NAME);
  await store.setJSON(KEY, credentials);
}

export function isExpiringSoon(credentials: LinkedInCredentials): boolean {
  const expiresAt = new Date(credentials.expires_at).getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return expiresAt - Date.now() < sevenDays;
}

export async function refreshAccessToken(
  credentials: LinkedInCredentials,
  clientId: string,
  clientSecret: string
): Promise<LinkedInCredentials> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: credentials.refresh_token,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token refresh failed (${response.status}): ${text}`);
  }

  const data = await response.json();

  const expiresIn = data.expires_in ?? 5184000; // 60 days default
  const refreshExpiresIn = data.refresh_token_expires_in ?? 31536000; // 365 days default

  const refreshed: LinkedInCredentials = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    refresh_expires_at: new Date(Date.now() + refreshExpiresIn * 1000).toISOString(),
    person_id: credentials.person_id,
  };

  await saveTokens(refreshed);
  return refreshed;
}
