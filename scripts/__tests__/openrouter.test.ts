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
  it('uses deepseek/deepseek-v3.2 by default', () => {
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

  it('sends a strict json_schema response format when a schema is supplied', async () => {
    const fetchMock = vi.fn<typeof fetch>(
      async () =>
        new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
    );
    const client = new OpenRouterClient('key', 'model', fetchMock as typeof fetch);

    await client.completeJson<{ ok: boolean }>({
      systemPrompt: 'System',
      userPrompt: 'User',
      schema: { name: 'test_schema', schema: { type: 'object' } },
    });

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.response_format).toEqual({
      type: 'json_schema',
      json_schema: { name: 'test_schema', strict: true, schema: { type: 'object' } },
    });
  });

  it('keeps json_object as the response format without a schema', async () => {
    const fetchMock = vi.fn<typeof fetch>(
      async () =>
        new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
    );
    const client = new OpenRouterClient('key', 'model', fetchMock as typeof fetch);

    await client.completeJson<{ ok: boolean }>({ systemPrompt: 'System', userPrompt: 'User' });

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.response_format).toEqual({ type: 'json_object' });
  });

  it('falls back to json_object when the provider rejects the schema', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { message: 'response_format json_schema is not supported' } }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
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
      schema: { name: 'test_schema', schema: { type: 'object' } },
    });

    expect(result.data.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondBody = JSON.parse(String(fetchMock.mock.calls[1][1]?.body));
    expect(secondBody.response_format).toEqual({ type: 'json_object' });
  });

  it('retries schema mode without the schema when tool citations are missing', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
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
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );
    const client = new OpenRouterClient('key', 'model', fetchMock as typeof fetch);

    const result = await client.completeJson<{ ok: boolean }>({
      systemPrompt: 'System',
      userPrompt: 'User',
      tools: [{ type: 'openrouter:web_search' }],
      schema: { name: 'test_schema', schema: { type: 'object' } },
    });

    expect(result.citations).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondBody = JSON.parse(String(fetchMock.mock.calls[1][1]?.body));
    expect(secondBody.response_format).toEqual({ type: 'json_object' });
  });

  it('drops the schema first when tool-call markup appears under json_schema', async () => {
    const markupContent = '<function_calls>\n<invoke name="openrouter_web_search">\n</invoke>';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ choices: [{ message: { content: markupContent } }] }), {
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
      tools: [{ type: 'openrouter:web_search' }],
      schema: { name: 'test_schema', schema: { type: 'object' } },
    });

    expect(result.data.ok).toBe(true);
    const secondBody = JSON.parse(String(fetchMock.mock.calls[1][1]?.body));
    // Schema dropped but server tools kept — they work without the schema.
    expect(secondBody.response_format).toEqual({ type: 'json_object' });
    expect(secondBody.tools).toEqual([{ type: 'openrouter:web_search' }]);
    expect(secondBody).not.toHaveProperty('plugins');
  });

  it('switches to the web plugin when the provider returns an unexecuted tool call', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [
              {
                finish_reason: 'tool_calls',
                message: { content: null, tool_calls: [{ id: 'call_1' }] },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
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
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );
    const client = new OpenRouterClient('key', 'model', fetchMock as typeof fetch);

    const result = await client.completeJson<{ ok: boolean }>({
      systemPrompt: 'System',
      userPrompt: 'User',
      tools: [{ type: 'openrouter:web_search', parameters: { engine: 'exa', max_results: 8 } }],
    });

    expect(result.data.ok).toBe(true);
    const secondBody = JSON.parse(String(fetchMock.mock.calls[1][1]?.body));
    expect(secondBody.plugins).toEqual([{ id: 'web', engine: 'exa', max_results: 8 }]);
    expect(secondBody).not.toHaveProperty('tools');
  });

  it('falls back to the web plugin when the model emits tool-call markup as text', async () => {
    const markupContent =
      '<function_calls>\n<invoke name="openrouter_web_search">\n<parameter name="query">news</parameter>\n</invoke>\n</function_calls>';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ choices: [{ message: { content: markupContent } }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
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
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );
    const client = new OpenRouterClient('key', 'model', fetchMock as typeof fetch);

    const result = await client.completeJson<{ ok: boolean }>({
      systemPrompt: 'System',
      userPrompt: 'User',
      tools: [
        { type: 'openrouter:web_search', parameters: { engine: 'exa', max_results: 8 } },
        { type: 'openrouter:web_fetch' },
      ],
    });

    expect(result.data.ok).toBe(true);
    expect(result.citations).toHaveLength(1);
    const secondBody = JSON.parse(String(fetchMock.mock.calls[1][1]?.body));
    expect(secondBody.plugins).toEqual([{ id: 'web', engine: 'exa', max_results: 8 }]);
    expect(secondBody).not.toHaveProperty('tools');
  });

  it('remembers that server-side tools are unsupported across calls', async () => {
    const markupContent = '<tool_call>{"name":"openrouter_web_search"}</tool_call>';
    const goodResponse = () =>
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
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ choices: [{ message: { content: markupContent } }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValue(goodResponse());
    const client = new OpenRouterClient('key', 'model', fetchMock as typeof fetch);
    const request = {
      systemPrompt: 'System',
      userPrompt: 'User',
      tools: [{ type: 'openrouter:web_search' as const }],
    };

    await client.completeJson<{ ok: boolean }>(request);
    fetchMock.mockResolvedValue(goodResponse());
    await client.completeJson<{ ok: boolean }>(request);

    // The second completeJson call starts directly in plugin mode.
    const thirdBody = JSON.parse(String(fetchMock.mock.calls[2][1]?.body));
    expect(thirdBody.plugins).toEqual([{ id: 'web', engine: 'exa', max_results: 8 }]);
    expect(thirdBody).not.toHaveProperty('tools');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('retries transient HTTP errors with backoff', async () => {
    const sleep = vi.fn(async () => {});
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: 'rate limited' } }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    const client = new OpenRouterClient('key', 'model', fetchMock as typeof fetch, sleep);

    const result = await client.completeJson<{ ok: boolean }>({
      systemPrompt: 'System',
      userPrompt: 'User',
    });

    expect(result.data.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledWith(5000);
  });

  it('gives up on persistent server errors after three retries', async () => {
    const sleep = vi.fn(async () => {});
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ error: { message: 'upstream down' } }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        })
    );
    const client = new OpenRouterClient('key', 'model', fetchMock as typeof fetch, sleep);

    await expect(
      client.completeJson({ systemPrompt: 'System', userPrompt: 'User' })
    ).rejects.toThrow('OpenRouter request failed (502): upstream down');
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(sleep).toHaveBeenCalledTimes(3);
  });

  it('does not retry authentication errors', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ error: { message: 'invalid key' } }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
    );
    const client = new OpenRouterClient('key', 'model', fetchMock as typeof fetch);

    await expect(
      client.completeJson({ systemPrompt: 'System', userPrompt: 'User' })
    ).rejects.toThrow('OpenRouter request failed (401): invalid key');
    expect(fetchMock).toHaveBeenCalledTimes(1);
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
