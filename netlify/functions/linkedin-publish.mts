import type { Handler } from '@netlify/functions';
import { timingSafeEqual } from 'node:crypto';
import { getTokens, refreshAccessToken, isExpiringSoon } from './lib/linkedin-tokens';
import { publishPost, addComment } from './lib/linkedin-client';
import { generateLinkedInPost } from './lib/linkedin-post-generator';
import { fetchBlogContent } from './lib/blog-fetcher';

const SITE_URL = 'https://www.juanelojga.com';

export const handler: Handler = async event => {
  // Auth check
  const authHeader = event.headers?.authorization;
  if (!authHeader) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Missing authorization header' }) };
  }

  const publishSecret = process.env.LINKEDIN_PUBLISH_SECRET ?? '';
  const token = authHeader.replace('Bearer ', '');
  if (
    token.length !== publishSecret.length ||
    !timingSafeEqual(Buffer.from(token), Buffer.from(publishSecret))
  ) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Invalid authorization token' }) };
  }

  // Get LinkedIn tokens
  let credentials = await getTokens();
  if (!credentials) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'No LinkedIn token stored. Run OAuth flow first.' }),
    };
  }

  // Auto-refresh if expiring soon
  if (isExpiringSoon(credentials)) {
    credentials = await refreshAccessToken(
      credentials,
      process.env.LINKEDIN_CLIENT_ID ?? '',
      process.env.LINKEDIN_CLIENT_SECRET ?? ''
    );
  }

  // Parse slug from body or query
  let slug: string | undefined;
  let noComment = false;
  let dryRun = false;

  if (event.httpMethod === 'GET') {
    slug = event.queryStringParameters?.slug;
    dryRun = event.queryStringParameters?.dry_run === 'true';
  } else {
    try {
      const body = JSON.parse(event.body ?? '{}');
      slug = body.slug;
      noComment = body.noComment === true;
      dryRun = body.dryRun === true;
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
    }
  }

  if (!slug) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing slug parameter' }) };
  }

  try {
    // Fetch blog content from the live site
    const blog = await fetchBlogContent(SITE_URL, slug);
    if (!blog) {
      return { statusCode: 404, body: JSON.stringify({ error: `Blog post not found: ${slug}` }) };
    }

    // Generate LinkedIn post via AI
    const postContent = await generateLinkedInPost(blog);

    // Dry run: return preview without publishing
    if (dryRun) {
      return {
        statusCode: 200,
        body: JSON.stringify({ post: postContent, slug, dryRun: true }),
      };
    }

    // Publish to LinkedIn
    const postUrn = await publishPost(credentials.access_token, credentials.person_id, postContent);

    // Add first comment with blog URL
    if (!noComment) {
      const blogUrl = `${SITE_URL}/en/blog/${slug}`;
      await addComment(
        credentials.access_token,
        credentials.person_id,
        postUrn,
        `Read the full post here: ${blogUrl}`
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ postUrn, post: postContent, slug }),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      statusCode: 500,
      body: JSON.stringify({ error: message }),
    };
  }
};
