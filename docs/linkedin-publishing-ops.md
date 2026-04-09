# LinkedIn Publishing: Operations Guide

Operational companion to [linkedin-publishing.md](./linkedin-publishing.md) (architecture). This doc covers setup, testing, deployment, and troubleshooting.

## Quick Start Checklist

1. Create a LinkedIn app at [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Request **Share on LinkedIn** product (grants `w_member_social` scope)
3. Add redirect URL: `https://www.juanelojga.com/api/linkedin/auth/callback`
4. Set environment variables in Netlify UI (see [Environment Setup](#environment-setup))
5. Set `LINKEDIN_PUBLISH_SECRET` in GitHub Secrets (same value as Netlify)
6. Deploy the site to Netlify (functions deploy automatically)
7. Visit `https://www.juanelojga.com/api/linkedin/auth/start` to authorize
8. Run a dry-run test (see [Testing in Production](#testing-in-production))
9. Merge a blog PR and watch the GitHub Action publish to LinkedIn

## How It Works

```
Blog PR merged to main
        |
        v
GitHub Action: publish-linkedin.yml
  - Triggers on: pull_request closed + merged + path filter
  - Extracts slug from PR branch name
        |
        v
POST https://www.juanelojga.com/api/linkedin/publish
  - Bearer token: LINKEDIN_PUBLISH_SECRET
  - Body: { "slug": "extracted-slug" }
        |
        v
Netlify Function: linkedin-publish
  1. Validate bearer token
  2. Read LinkedIn tokens from Netlify Blobs
  3. Auto-refresh if expiring within 7 days
  4. Read blog markdown by slug
  5. Generate LinkedIn post via GitHub Models AI
  6. POST to LinkedIn API (/rest/posts)
  7. Add first comment with blog URL
        |
        v
LinkedIn post is live on your profile
```

## Environment Setup

### Netlify UI

Set in **Netlify > Site settings > Environment variables**:

| Variable                      | How to generate                            | Purpose                                 |
| ----------------------------- | ------------------------------------------ | --------------------------------------- |
| `LINKEDIN_CLIENT_ID`          | Copy from LinkedIn Developer Portal > Auth | OAuth client identifier                 |
| `LINKEDIN_CLIENT_SECRET`      | Copy from LinkedIn Developer Portal > Auth | OAuth client secret                     |
| `LINKEDIN_OAUTH_STATE_SECRET` | `openssl rand -hex 32`                     | CSRF protection for OAuth flow          |
| `LINKEDIN_PUBLISH_SECRET`     | `openssl rand -hex 32`                     | Protects the publish endpoint           |
| `GITHUB_TOKEN`                | GitHub PAT with `models:read`              | AI content generation via GitHub Models |

### GitHub Secrets

Set in **GitHub > Repository settings > Secrets and variables > Actions**:

| Secret                    | Value                             | Purpose                                         |
| ------------------------- | --------------------------------- | ----------------------------------------------- |
| `LINKEDIN_PUBLISH_SECRET` | Same value as the Netlify env var | GitHub Action authenticates to publish endpoint |

Reference file: [`.env.example`](../.env.example)

## First-Time OAuth Authorization

LinkedIn uses 3-legged OAuth 2.0. The entire flow runs via Netlify Functions — no local server needed.

### Step 1: Ensure functions are deployed

After merging the feature branch, verify the functions are live:

```
https://www.juanelojga.com/api/linkedin/auth/start
```

If you get a 404, the functions haven't deployed yet. Check Netlify deploy logs.

### Step 2: Authorize in your browser

Visit:

```
https://www.juanelojga.com/api/linkedin/auth/start
```

This redirects you to LinkedIn. Sign in and click **Allow**. You'll be redirected back to the callback function.

### Step 3: Confirm success

The callback page displays a success message confirming tokens were saved to Netlify Blobs. You'll see:

- Access token saved (expires in ~60 days)
- Refresh token saved (expires in ~365 days)
- Your LinkedIn Person ID

**You only need to do this once per year** (when the refresh token expires). Access tokens auto-refresh transparently.

## Testing Locally

### Unit tests

```bash
npm run test
```

The LinkedIn feature has 46 tests across 6 test files:

| Test file                         | Tests | Covers                                              |
| --------------------------------- | ----- | --------------------------------------------------- |
| `linkedin-tokens.test.ts`         | 7     | Token CRUD via Netlify Blobs, expiry check, refresh |
| `linkedin-client.test.ts`         | 5     | LinkedIn POST /posts, comment API, error handling   |
| `linkedin-post-generator.test.ts` | 7     | AI prompt structure, length/URL/question rules      |
| `linkedin-auth-start.test.ts`     | 6     | OAuth redirect, scopes, state param, missing env    |
| `linkedin-auth-callback.test.ts`  | 9     | Code exchange, state validation, token storage      |
| `linkedin-publish.test.ts`        | 12    | Auth, token refresh, dry run, publish, errors       |

### Run specific test file

```bash
npx vitest run netlify/functions/lib/__tests__/linkedin-tokens.test.ts
```

### Watch mode

```bash
npx vitest netlify/
```

## Testing in Production

### Dry run (preview without publishing)

Returns the AI-generated LinkedIn post text. Nothing is published.

```bash
curl -H "Authorization: Bearer YOUR_PUBLISH_SECRET" \
  "https://www.juanelojga.com/api/linkedin/publish?slug=YOUR_BLOG_SLUG&dry_run=true"
```

Example with an existing blog post:

```bash
curl -H "Authorization: Bearer YOUR_PUBLISH_SECRET" \
  "https://www.juanelojga.com/api/linkedin/publish?slug=building-rag-pipelines-that-actually-work&dry_run=true"
```

### Manual publish

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_PUBLISH_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"slug": "building-rag-pipelines-that-actually-work"}' \
  "https://www.juanelojga.com/api/linkedin/publish"
```

### Skip the first comment

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_PUBLISH_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"slug": "building-rag-pipelines-that-actually-work", "noComment": true}' \
  "https://www.juanelojga.com/api/linkedin/publish"
```

## Deploying

### Automatic deployment

Netlify Functions deploy automatically when the site builds. The functions live in `netlify/functions/` and are detected by Netlify's build process.

After merging to main:

1. Netlify builds the site automatically
2. Functions at `netlify/functions/*.mts` become available at `/api/linkedin/*` (via `netlify.toml` redirects)
3. Verify by visiting `https://www.juanelojga.com/api/linkedin/auth/start` — should redirect to LinkedIn

### Verify functions are live

Check the Netlify dashboard:

1. Go to **Netlify > Functions** tab
2. Confirm `linkedin-auth-start`, `linkedin-auth-callback`, and `linkedin-publish` appear
3. Check function logs for any startup errors

### netlify.toml redirects

The following redirects route public URLs to the Netlify Functions:

```toml
[[redirects]]
  from = "/api/linkedin/auth/start"
  to = "/.netlify/functions/linkedin-auth-start"
  status = 200

[[redirects]]
  from = "/api/linkedin/auth/callback"
  to = "/.netlify/functions/linkedin-auth-callback"
  status = 200

[[redirects]]
  from = "/api/linkedin/publish"
  to = "/.netlify/functions/linkedin-publish"
  status = 200
```

## Token Lifecycle

| Token         | Lifetime | Auto-refresh?                                             | Action when expired                                 |
| ------------- | -------- | --------------------------------------------------------- | --------------------------------------------------- |
| Access token  | 60 days  | Yes — refreshed automatically when expiring within 7 days | None needed                                         |
| Refresh token | 365 days | No                                                        | Re-visit `/api/linkedin/auth/start` to re-authorize |

Token refresh is **lazy and transparent** — it happens on-demand when the publish function detects the access token is expiring soon. New tokens are saved back to Netlify Blobs automatically.

### Timeline

```
Day 0:    Authorize → access + refresh tokens saved
Day 53:   Publish called → access token expiring within 7 days → auto-refresh
Day 113:  Publish called → another auto-refresh (transparent)
...
Day 358:  Publish called → refresh token expiring → auto-refresh still works
Day 365+: Refresh token expired → publish returns error → re-authorize manually
```

## GitHub Action Details

### Trigger mechanism

The workflow `publish-linkedin.yml` uses a three-layer guard:

```yaml
on:
  pull_request:
    types: [closed]
    branches: [main]
    paths: ['src/content/blog/en/**']

jobs:
  publish:
    if: github.event.pull_request.merged == true
```

| Guard                               | Purpose                                     |
| ----------------------------------- | ------------------------------------------- |
| `pull_request: closed`              | Only reacts to PR events, not direct pushes |
| `paths: ['src/content/blog/en/**']` | Only PRs that touch English blog content    |
| `merged == true`                    | Skips PRs closed without merging            |

### When it fires and when it doesn't

| Scenario                     | Fires? | Why                           |
| ---------------------------- | ------ | ----------------------------- |
| Blog PR merged               | Yes    | All three guards pass         |
| Blog PR closed without merge | No     | `merged == true` fails        |
| Non-blog PR merged           | No     | Path filter doesn't match     |
| Direct push to main          | No     | No `pull_request` event       |
| PR with blog + other files   | Yes    | Path filter matches >= 1 file |

### Slug extraction

The blog generation workflow creates branches named `blog/YYYY-MM-DD-slug`. The publish workflow extracts the slug:

```bash
SLUG=$(echo "$BRANCH" | sed 's|blog/[0-9]*-[0-9]*-[0-9]*-||')
```

### Re-running manually

If the action failed (e.g., network issue), re-run it from GitHub:

1. Go to **Actions** > **Publish to LinkedIn**
2. Find the failed run
3. Click **Re-run all jobs**

Or trigger a manual publish via curl (see [Testing in Production](#testing-in-production)).

## Troubleshooting

| Error                                           | Cause                                     | Fix                                                                             |
| ----------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------- |
| `401 Unauthorized` on publish endpoint          | Missing or wrong `Authorization` header   | Verify `LINKEDIN_PUBLISH_SECRET` matches between Netlify env and GitHub Secrets |
| `No tokens found`                               | OAuth not completed                       | Visit `/api/linkedin/auth/start` to authorize                                   |
| `401` from LinkedIn API + auto-refresh fails    | Refresh token expired (>365 days)         | Re-authorize via `/api/linkedin/auth/start`                                     |
| `403 Forbidden` from LinkedIn API               | App lacks `w_member_social` scope         | Check LinkedIn Developer Portal > Products                                      |
| `Blog post not found` (404)                     | Wrong slug or post not bundled            | Verify slug matches a file in `src/content/blog/en/`                            |
| `GITHUB_TOKEN is required`                      | Missing token for AI generation           | Set `GITHUB_TOKEN` in Netlify env vars                                          |
| GitHub Action doesn't trigger                   | PR didn't modify `src/content/blog/en/**` | Check workflow path filter; verify blog files were in the PR diff               |
| GitHub Action fires but publish fails           | Netlify function not deployed yet         | Check Netlify deploy status; functions deploy with the site build               |
| `Function not found` (404 on `/api/linkedin/*`) | Missing `netlify.toml` redirects          | Verify redirect rules are in `netlify.toml`                                     |
| AI generates low-quality post                   | Model output varies                       | Run a dry-run first; re-run the action to regenerate                            |

## File Reference

```
.env.example                                    # All required env vars
.github/workflows/publish-linkedin.yml           # Trigger on blog PR merge
netlify/functions/
  linkedin-auth-start.mts                        # OAuth start redirect
  linkedin-auth-callback.mts                     # OAuth code exchange
  linkedin-publish.mts                           # Main publish endpoint
  lib/
    linkedin-tokens.ts                           # Token CRUD via Netlify Blobs
    linkedin-client.ts                           # LinkedIn REST API client
    linkedin-post-generator.ts                   # AI post generation
    github-models.ts                             # OpenAI-compatible AI client
docs/
  linkedin-publishing.md                         # Architecture & design
  linkedin-publishing-ops.md                     # This file (operations)
```
