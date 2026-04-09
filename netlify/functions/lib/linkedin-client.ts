const LINKEDIN_API = 'https://api.linkedin.com/rest';
const API_VERSION = '202401';

export async function publishPost(
  accessToken: string,
  personId: string,
  text: string
): Promise<string> {
  if (!text) {
    throw new Error('Post text cannot be empty');
  }

  const body = {
    author: personId,
    commentary: text,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
  };

  const response = await fetch(`${LINKEDIN_API}/posts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': API_VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`LinkedIn publish failed (${response.status}): ${errorBody}`);
  }

  const postUrn = response.headers.get('x-restli-id');
  if (postUrn) return postUrn;

  const data = await response.json();
  return data.id;
}

export async function addComment(
  accessToken: string,
  personId: string,
  postUrn: string,
  text: string
): Promise<void> {
  const body = {
    actor: personId,
    message: { text },
  };

  const response = await fetch(
    `${LINKEDIN_API}/socialActions/${encodeURIComponent(postUrn)}/comments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': API_VERSION,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LinkedIn comment failed (${response.status}): ${text}`);
  }
}
