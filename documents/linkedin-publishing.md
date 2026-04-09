# LinkedIn Publishing: Blog Post Promotion (Cloud-First)

Automatically generate and publish LinkedIn posts that summarize blog entries — fully in the cloud via Netlify Functions + GitHub Actions.

## Overview

When a blog post PR is merged, a GitHub Action triggers a Netlify Function that:

1. Reads the English blog post from bundled markdown files
2. Generates an optimized LinkedIn post using AI (GitHub Models)
3. Publishes to LinkedIn as your personal account
4. Adds the blog URL as a first comment (avoids ~60% reach penalty from links in post body)

No local machine needed. Everything runs in the cloud.

```
Blog PR merged
      │
      ▼
GitHub Action fires
      │
      ▼
POST /api/linkedin/publish (Netlify Function)
      │
      ├─ Read tokens from Netlify Blobs
      ├─ Auto-refresh if expiring soon
      ├─ Read blog markdown (bundled in function)
      ├─ Generate LinkedIn post via GitHub Models AI
      ├─ Publish post to LinkedIn API
      └─ Add first comment with blog URL
      │
      ▼
LinkedIn post is live
```

## Prerequisites

### LinkedIn App Setup

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Create an app (or use an existing one)
3. Under **Auth**, note your **Client ID** and **Primary Client Secret**
4. Under **Auth > OAuth 2.0 settings**, add redirect URL: `https://www.juanelojga.com/api/linkedin/auth/callback`
5. Under **Products**, request access to **Share on LinkedIn** (grants `w_member_social` scope)

### Environment Variables — Netlify UI

Set these in **Netlify > Site settings > Environment variables**:

| Variable                      | Purpose                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| `LINKEDIN_CLIENT_ID`          | LinkedIn app Client ID                                                                            |
| `LINKEDIN_CLIENT_SECRET`      | LinkedIn app Primary Client Secret                                                                |
| `LINKEDIN_OAUTH_STATE_SECRET` | Random string (e.g., `openssl rand -hex 32`) to validate OAuth state parameter                    |
| `LINKEDIN_PUBLISH_SECRET`     | Random string (e.g., `openssl rand -hex 32`) used as bearer token to protect the publish endpoint |
| `GITHUB_TOKEN`                | GitHub token for AI content generation via GitHub Models                                          |
| `LINKEDIN_API_BASE_URL`       | _(Optional)_ LinkedIn REST API base URL. Default: `https://api.linkedin.com/rest`                 |
| `LINKEDIN_API_VERSION`        | _(Optional)_ LinkedIn API version header value (`YYYYMM`). Default: `202601`                      |

### Environment Variables — GitHub Secrets

Set these in **GitHub > Repository settings > Secrets and variables > Actions**:

| Secret                    | Purpose                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| `LINKEDIN_PUBLISH_SECRET` | Same value as the Netlify env var — used by the GitHub Action to call the publish endpoint |

## First-Time Setup: Authorize LinkedIn

LinkedIn uses **3-legged OAuth 2.0**. The OAuth flow is handled entirely by Netlify Functions — no local server needed.

### Step 1: Deploy the site

Ensure the Netlify Functions are deployed and the environment variables are set.

### Step 2: Authorize in your browser

Visit:

```
https://www.juanelojga.com/api/linkedin/auth/start
```

This Netlify Function redirects you to LinkedIn's authorization page. Sign in and authorize the app.

### Step 3: Automatic token exchange

After authorizing, LinkedIn redirects to `/api/linkedin/auth/callback`. The callback function automatically:

- Exchanges the authorization code for an **access token** (valid 60 days) and **refresh token** (valid 365 days)
- Fetches your **LinkedIn Person ID**
- Saves everything to **Netlify Blobs**

You'll see a success page confirming tokens were saved. That's it — no codes to copy, no CLI commands.

You only need to do this once (or once a year when the refresh token expires).

## Usage

### Automatic publishing (default workflow)

After setup, publishing is fully automatic:

1. `pnpm generate:blog` creates a blog post PR (runs on schedule via GitHub Actions)
2. Review and merge the PR
3. GitHub Action `publish-linkedin.yml` triggers automatically
4. LinkedIn post appears on your profile within seconds

### Manual dry run (preview without publishing)

```bash
curl -H "Authorization: Bearer YOUR_PUBLISH_SECRET" \
  "https://www.juanelojga.com/api/linkedin/publish?slug=my-blog-slug&dry_run=true"
```

Returns the AI-generated LinkedIn post text for review. Nothing is published.

### Manual publish

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_PUBLISH_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"slug": "my-blog-slug"}' \
  "https://www.juanelojga.com/api/linkedin/publish"
```

### Skip the first comment

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_PUBLISH_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"slug": "my-blog-slug", "noComment": true}' \
  "https://www.juanelojga.com/api/linkedin/publish"
```

## Token Expiration & Renewal

| Token         | Lifetime | What happens when it expires                                                                                                                      |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Access token  | 60 days  | Publish function auto-refreshes using the refresh token. New tokens saved to Blobs automatically. **No action needed.**                           |
| Refresh token | 365 days | Publish function returns an error asking you to re-authorize via browser (revisit `/api/linkedin/auth/start`). Happens at most **once per year**. |

Token refresh is transparent and lazy — it happens on-demand when the publish function detects the access token is expiring within 7 days.

## LinkedIn Post Generation Rules

The AI generates posts following these guidelines:

- **Language:** English only, B2 level (accessible, not overly complex)
- **Tone:** Conversational, humanized — not corporate or AI-sounding
- **Length:** 100–300 words
- **Structure:** Randomly picks from three templates:
  - **Hook + Insights** — bold opener, 2–3 actionable tips, discussion question
  - **Story + Tease** — personal experience, lesson learned, call for war stories
  - **Question Opener** — provocative question, quick answer, invite engagement
- **Always:** ends with a discussion question to drive comments
- **Never:** includes URLs in the post body (link goes in first comment)
- **Avoids:** generic advice, listicle format, corporate jargon, overly academic tone

## Architecture

### Netlify Functions

```
netlify/
  functions/
    linkedin-auth-start.mts          # Redirects to LinkedIn OAuth
    linkedin-auth-callback.mts       # Exchanges code → tokens, saves to Blobs
    linkedin-publish.mts             # Protected: generate AI post + publish
    lib/
      linkedin-tokens.ts             # Read/write/refresh tokens via Netlify Blobs
      linkedin-client.ts             # LinkedIn REST API client (post + comment)
      linkedin-post-generator.ts     # AI prompt + content generation
      github-models.ts               # Shared AI client (reuses existing pattern)
```

### GitHub Actions

```
.github/workflows/
  publish-linkedin.yml               # Triggers on blog PR merge
```

### URL routing (via netlify.toml redirects)

| Public URL                    | Function                 |
| ----------------------------- | ------------------------ |
| `/api/linkedin/auth/start`    | `linkedin-auth-start`    |
| `/api/linkedin/auth/callback` | `linkedin-auth-callback` |
| `/api/linkedin/publish`       | `linkedin-publish`       |

### File responsibilities

| File                         | Purpose                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| `linkedin-auth-start.mts`    | Builds LinkedIn OAuth URL with state param, redirects user                                 |
| `linkedin-auth-callback.mts` | Receives OAuth callback, exchanges code for tokens, fetches person ID, stores in Blobs     |
| `linkedin-publish.mts`       | Validates bearer token, reads blog, generates AI post, publishes to LinkedIn               |
| `linkedin-tokens.ts`         | Token CRUD via `@netlify/blobs` — read, write, refresh, exchange                           |
| `linkedin-client.ts`         | `publishPost()` and `addComment()` via LinkedIn Community Management API v2                |
| `linkedin-post-generator.ts` | Takes blog content, generates LinkedIn post via GitHub Models AI                           |
| `github-models.ts`           | OpenAI-compatible client for GitHub Models (reuses `scripts/lib/github-models.ts` pattern) |

### LinkedIn API details

- **Base URL:** `https://api.linkedin.com/rest/` (override with `LINKEDIN_API_BASE_URL` env var)
- **API version header:** `LinkedIn-Version: 202601` (override with `LINKEDIN_API_VERSION` env var — LinkedIn retires versions after ~12 months; update this when you get a `426 NONEXISTENT_VERSION` error)
- **Protocol header:** `X-Restli-Protocol-Version: 2.0.0`
- **Post endpoint:** `POST /posts`
- **Comment endpoint:** `POST /comments`
- **Profile endpoint:** `GET https://api.linkedin.com/v2/me`

### Token storage

Tokens are stored in **Netlify Blobs** (built-in key-value store, free tier):

- **Store name:** `linkedin-tokens`
- **Key:** `credentials`
- **Value:**

```json
{
  "access_token": "AQV...",
  "refresh_token": "AQX...",
  "expires_at": "2026-06-07T00:00:00Z",
  "refresh_expires_at": "2027-04-08T00:00:00Z",
  "person_id": "urn:li:person:abc123"
}
```

## Security

| Concern                | Mitigation                                                          |
| ---------------------- | ------------------------------------------------------------------- |
| OAuth tokens at rest   | Stored in Netlify Blobs (server-side only, not publicly accessible) |
| Publish endpoint       | Protected by `LINKEDIN_PUBLISH_SECRET` bearer token                 |
| OAuth callback hijack  | `state` parameter validated against `LINKEDIN_OAUTH_STATE_SECRET`   |
| Client secret exposure | In Netlify env vars, never in repo                                  |
| GitHub token exposure  | In Netlify env vars + GitHub secrets, never in repo                 |

## Typical Workflow

```
1. pnpm generate:blog                    # Generate blog post (existing, runs on schedule)
2. Create PR, review, merge                 # Git workflow
3. → GitHub Action auto-publishes to LinkedIn
```

For manual control:

```
1. curl .../api/linkedin/publish?slug=SLUG&dry_run=true    # Preview
2. curl -X POST .../api/linkedin/publish -d '{"slug":"SLUG"}'  # Publish
```

## Troubleshooting

| Error                                   | Cause                                     | Fix                                                                                                                                                                              |
| --------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN is required`              | Missing GitHub token for AI generation    | Set `GITHUB_TOKEN` in Netlify env vars                                                                                                                                           |
| `No tokens found`                       | No credentials in Netlify Blobs           | Visit `/api/linkedin/auth/start` to authorize                                                                                                                                    |
| `401 Unauthorized` + auto-refresh fails | Refresh token expired                     | Re-visit `/api/linkedin/auth/start` to re-authorize                                                                                                                              |
| `403 Forbidden`                         | App lacks `w_member_social` scope         | Check LinkedIn Developer Portal > Products                                                                                                                                       |
| `403` on publish endpoint               | Wrong or missing bearer token             | Verify `LINKEDIN_PUBLISH_SECRET` matches in Netlify env vars and GitHub secrets                                                                                                  |
| `Blog post not found`                   | Wrong slug or post not bundled            | Verify the slug matches a file in `src/content/blog/en/` and that `included_files` is set in `netlify.toml`                                                                      |
| `426 NONEXISTENT_VERSION`               | LinkedIn retired the API version          | Set `LINKEDIN_API_VERSION` in Netlify env vars to a current `YYYYMM` version (check [LinkedIn versioning docs](https://learn.microsoft.com/en-us/linkedin/marketing/versioning)) |
| GitHub Action doesn't trigger           | PR didn't modify `src/content/blog/en/**` | Check the workflow path filter matches                                                                                                                                           |
