const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_EMPTY_RESPONSE_ATTEMPTS = 3;
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
  toolChoice?: 'auto' | 'required' | 'none';
  temperature?: number;
  maxTokens?: number;
  reasoningEffort?: 'none' | 'minimal' | 'low' | 'medium' | 'high';
}

export interface CompletionResult<T> {
  data: T;
  citations: UrlCitation[];
  webSearchRequests: number;
}

interface OpenRouterResponse {
  choices?: Array<{
    finish_reason?: string;
    native_finish_reason?: string;
    message?: {
      content?: string;
      annotations?: Array<{
        type?: string;
        url_citation?: { url?: string; title?: string; content?: string };
      }>;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    completion_tokens_details?: { reasoning_tokens?: number };
    server_tool_use?: { web_search_requests?: number };
  };
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
    for (let attempt = 1; attempt <= MAX_EMPTY_RESPONSE_ATTEMPTS; attempt += 1) {
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
          ...(options.tools?.length && options.toolChoice
            ? { tool_choice: options.toolChoice }
            : {}),
          ...(options.reasoningEffort ? { reasoning: { effort: options.reasoningEffort } } : {}),
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

      const choice = payload.choices?.[0];
      const message = choice?.message;
      const finishInfo = `finish_reason=${choice?.finish_reason ?? 'unknown'} (native: ${choice?.native_finish_reason ?? 'unknown'}), completion_tokens=${payload.usage?.completion_tokens ?? '?'}, reasoning_tokens=${payload.usage?.completion_tokens_details?.reasoning_tokens ?? '?'}`;
      console.log(`📡 OpenRouter response: ${finishInfo}`);

      if (!message?.content) {
        if (attempt < MAX_EMPTY_RESPONSE_ATTEMPTS) {
          console.warn(
            `OpenRouter returned no content (attempt ${attempt}/${MAX_EMPTY_RESPONSE_ATTEMPTS}, ${finishInfo}); retrying`
          );
          continue;
        }
        throw new Error(
          `OpenRouter returned no content after ${MAX_EMPTY_RESPONSE_ATTEMPTS} attempts (${finishInfo})`
        );
      }

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

    throw new Error('OpenRouter completion failed unexpectedly');
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
