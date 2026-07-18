import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createOpenRouterClient,
  DEFAULT_OPENROUTER_MODEL,
  OpenRouterClient,
} from '../lib/openrouter';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('createOpenRouterClient', () => {
  it('uses openai/gpt-5.2 by default', () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'test-key');
    vi.stubEnv('OPENROUTER_MODEL', '');
    expect(createOpenRouterClient().model).toBe(DEFAULT_OPENROUTER_MODEL);
  });

  it('supports an environment model override', () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'test-key');
    vi.stubEnv('OPENROUTER_MODEL', 'example/model');
    expect(createOpenRouterClient().model).toBe('example/model');
  });
});

describe('OpenRouterClient', () => {
  it('parses structured content and web citations', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: '{"ok":true}',
                  annotations: [
                    {
                      type: 'url_citation',
                      url_citation: { url: 'https://example.com/news', title: 'News' },
                    },
                  ],
                },
              },
            ],
            usage: { server_tool_use: { web_search_requests: 2 } },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    );
    const client = new OpenRouterClient('key', 'model', fetchMock as typeof fetch);

    const result = await client.completeJson<{ ok: boolean }>({
      systemPrompt: 'System',
      userPrompt: 'User',
    });

    expect(result.data.ok).toBe(true);
    expect(result.citations[0].url).toBe('https://example.com/news');
    expect(result.webSearchRequests).toBe(2);
  });
});
