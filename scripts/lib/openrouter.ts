const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const DEFAULT_OPENROUTER_MODEL = 'openai/gpt-5.2';

export interface UrlCitation {
  url: string;
  title: string;
  content?: string;
}

export interface OpenRouterTool {
  type: 'openrouter:web_search' | 'openrouter:web_fetch';
  parameters?: Record<string, unknown>;
}

interface CompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  tools?: OpenRouterTool[];
  temperature?: number;
  maxTokens?: number;
}

export interface CompletionResult<T> {
  data: T;
  citations: UrlCitation[];
  webSearchRequests: number;
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
      annotations?: Array<{
        type?: string;
        url_citation?: { url?: string; title?: string; content?: string };
      }>;
    };
  }>;
  usage?: { server_tool_use?: { web_search_requests?: number } };
  error?: { message?: string };
}

function parseJson<T>(content: string): T {
  try {
    return JSON.parse(content) as T;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('OpenRouter returned invalid JSON');
    return JSON.parse(match[0]) as T;
  }
}

export class OpenRouterClient {
  constructor(
    private readonly apiKey: string,
    readonly model: string,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  async completeJson<T>(options: CompletionOptions): Promise<CompletionResult<T>> {
    const response = await this.fetchImpl(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.juanelojga.com',
        'X-OpenRouter-Title': 'Juan Almeida Blog Research',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: options.systemPrompt },
          { role: 'user', content: options.userPrompt },
        ],
        response_format: { type: 'json_object' },
        ...(options.tools?.length ? { tools: options.tools } : {}),
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 8192,
      }),
    });

    const payload = (await response.json()) as OpenRouterResponse;
    if (!response.ok) {
      throw new Error(
        `OpenRouter request failed (${response.status}): ${payload.error?.message ?? 'unknown error'}`
      );
    }

    const message = payload.choices?.[0]?.message;
    if (!message?.content) throw new Error('OpenRouter returned no content');

    const citations = (message.annotations ?? [])
      .filter(annotation => annotation.type === 'url_citation' && annotation.url_citation?.url)
      .map(annotation => ({
        url: annotation.url_citation!.url!,
        title: annotation.url_citation!.title ?? annotation.url_citation!.url!,
        content: annotation.url_citation!.content,
      }));

    return {
      data: parseJson<T>(message.content),
      citations,
      webSearchRequests: payload.usage?.server_tool_use?.web_search_requests ?? 0,
    };
  }
}

export function createOpenRouterClient(): OpenRouterClient {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY environment variable is required');

  return new OpenRouterClient(
    apiKey,
    process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL
  );
}
