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

  it('forces server tool execution when requested', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            choices: [{ message: { content: '{"ok":true}' } }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    );
    const client = new OpenRouterClient('key', 'model', fetchMock as typeof fetch);

    await client.completeJson<{ ok: boolean }>({
      systemPrompt: 'System',
      userPrompt: 'User',
      tools: [{ type: 'openrouter:web_search' }],
      toolChoice: 'required',
    });

    const request = fetchMock.mock.calls[0][1];
    const body = JSON.parse(String(request?.body));
    expect(body.tool_choice).toBe('required');
    expect(body.tools).toEqual([{ type: 'openrouter:web_search' }]);
  });

  it('sends the unified reasoning parameter when an effort is set', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            choices: [{ message: { content: '{"ok":true}' } }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    );
    const client = new OpenRouterClient('key', 'model', fetchMock as typeof fetch);

    await client.completeJson<{ ok: boolean }>({
      systemPrompt: 'System',
      userPrompt: 'User',
      reasoningEffort: 'low',
    });

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.reasoning).toEqual({ effort: 'low' });
  });

  it('omits the reasoning parameter by default', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            choices: [{ message: { content: '{"ok":true}' } }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    );
    const client = new OpenRouterClient('key', 'model', fetchMock as typeof fetch);

    await client.completeJson<{ ok: boolean }>({
      systemPrompt: 'System',
      userPrompt: 'User',
    });

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body).not.toHaveProperty('reasoning');
  });

  it('parses the first JSON object when the model appends trailing text', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: '{"ok":true,"note":"a } inside a string"}\n\nHere is some explanation.',
                },
              },
            ],
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
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('uses the first object when the model returns concatenated JSON objects', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            choices: [{ message: { content: '{"ok":true}\n{"ok":false}' } }],
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
  });

  it('retries unparseable content and throws a descriptive error after three attempts', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            choices: [{ message: { content: 'not json at all' } }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    );
    const client = new OpenRouterClient('key', 'model', fetchMock as typeof fetch);

    await expect(
      client.completeJson({ systemPrompt: 'System', userPrompt: 'User' })
    ).rejects.toThrow(/unparseable JSON after 3 attempts.*not json at all/);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('retries an empty response once', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ choices: [{ message: { content: '' } }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    const client = new OpenRouterClient('key', 'model', fetchMock as typeof fetch);

    const result = await client.completeJson<{ ok: boolean }>({
      systemPrompt: 'System',
      userPrompt: 'User',
    });

    expect(result.data.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('stops after three empty responses and reports the finish reason', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            choices: [{ finish_reason: 'length', message: { content: null } }],
            usage: {
              completion_tokens: 5000,
              completion_tokens_details: { reasoning_tokens: 5000 },
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    );
    const client = new OpenRouterClient('key', 'model', fetchMock as typeof fetch);

    await expect(
      client.completeJson({ systemPrompt: 'System', userPrompt: 'User' })
    ).rejects.toThrow(/no content after 3 attempts \(finish_reason=length/);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
