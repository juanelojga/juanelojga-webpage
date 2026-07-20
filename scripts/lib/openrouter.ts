import type { JsonSchemaSpec } from './schemas';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_EMPTY_RESPONSE_ATTEMPTS = 3;
const MAX_TRANSIENT_RETRIES = 3;
const TRANSIENT_BACKOFF_MS = [5_000, 15_000, 45_000];
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
export const DEFAULT_OPENROUTER_MODEL = 'deepseek/deepseek-v3.2';

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
  schema?: JsonSchemaSpec;
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
      tool_calls?: unknown[];
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
    server_tool_use_details?: { web_search_requests?: number };
  };
  error?: { message?: string };
}

function extractFirstJsonObject(content: string): string | null {
  const start = content.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < content.length; i += 1) {
    const char = content[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return content.slice(start, i + 1);
    }
  }
  return null;
}

function parseJson<T>(content: string): T {
  try {
    return JSON.parse(content) as T;
  } catch {
    const candidate = extractFirstJsonObject(content);
    if (!candidate) throw new Error('OpenRouter returned invalid JSON');
    return JSON.parse(candidate) as T;
  }
}

const defaultSleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// Textual tool-call syntax leaking into content — the model tried to call a
// server-side tool that its provider never executed.
const TOOL_CALL_MARKUP = /<function_calls>|<tool_call|<invoke\s|"tool_calls"\s*:/;

// The model-agnostic web plugin: OpenRouter runs one search server-side and
// injects the results, instead of relying on the model's tool calling.
function webPluginFor(tools: OpenRouterTool[]): Record<string, unknown> {
  const search = tools.find(tool => tool.type === 'openrouter:web_search');
  return {
    id: 'web',
    engine: (search?.parameters?.engine as string) ?? 'exa',
    max_results: (search?.parameters?.max_results as number) ?? 8,
  };
}

export class OpenRouterClient {
  private serverToolsUnsupported = false;

  constructor(
    private readonly apiKey: string,
    readonly model: string,
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly sleep: (ms: number) => Promise<void> = defaultSleep
  ) {}

  async completeJson<T>(options: CompletionOptions): Promise<CompletionResult<T>> {
    let modelAttempts = 0;
    let transientRetries = 0;
    let useSchema = Boolean(options.schema);
    const wantsTools = Boolean(options.tools?.length);
    let usePlugin = wantsTools && this.serverToolsUnsupported;

    while (modelAttempts < MAX_EMPTY_RESPONSE_ATTEMPTS) {
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
          response_format:
            useSchema && options.schema
              ? {
                  type: 'json_schema',
                  json_schema: {
                    name: options.schema.name,
                    strict: true,
                    schema: options.schema.schema,
                  },
                }
              : { type: 'json_object' },
          ...(wantsTools && !usePlugin ? { tools: options.tools } : {}),
          ...(wantsTools && !usePlugin && options.toolChoice
            ? { tool_choice: options.toolChoice }
            : {}),
          ...(usePlugin ? { plugins: [webPluginFor(options.tools!)] } : {}),
          ...(options.reasoningEffort ? { reasoning: { effort: options.reasoningEffort } } : {}),
          temperature: options.temperature ?? 0.3,
          max_tokens: options.maxTokens ?? 8192,
        }),
      });

      let payload: OpenRouterResponse;
      try {
        payload = (await response.json()) as OpenRouterResponse;
      } catch {
        payload = {};
      }

      if (!response.ok) {
        const message = payload.error?.message ?? 'unknown error';
        if (
          useSchema &&
          response.status >= 400 &&
          response.status < 500 &&
          (response.status === 400 ||
            /response_format|json_schema|schema|structured/i.test(message))
        ) {
          console.warn(
            `⚠️ Structured outputs rejected (${response.status}: ${message}); falling back to json_object`
          );
          useSchema = false;
          continue;
        }
        if (RETRYABLE_STATUS.has(response.status) && transientRetries < MAX_TRANSIENT_RETRIES) {
          const retryAfter = Number(response.headers.get('retry-after'));
          const delay =
            Number.isFinite(retryAfter) && retryAfter > 0
              ? retryAfter * 1000
              : TRANSIENT_BACKOFF_MS[transientRetries];
          transientRetries += 1;
          console.warn(
            `OpenRouter transient error (${response.status}: ${message}); retry ${transientRetries}/${MAX_TRANSIENT_RETRIES} in ${delay / 1000}s`
          );
          await this.sleep(delay);
          continue;
        }
        throw new Error(`OpenRouter request failed (${response.status}): ${message}`);
      }

      modelAttempts += 1;
      const choice = payload.choices?.[0];
      const message = choice?.message;
      const finishInfo = `finish_reason=${choice?.finish_reason ?? 'unknown'} (native: ${choice?.native_finish_reason ?? 'unknown'}), completion_tokens=${payload.usage?.completion_tokens ?? '?'}, reasoning_tokens=${payload.usage?.completion_tokens_details?.reasoning_tokens ?? '?'}`;
      console.log(`📡 OpenRouter response: ${finishInfo}`);

      // A response that ends in an unexecuted tool call means this provider
      // does not run OpenRouter's server-side tools. The web plugin searches
      // server-side regardless of the model, so switch to it — for this call
      // and every later one on this client — without spending an attempt.
      if (
        wantsTools &&
        !usePlugin &&
        (choice?.finish_reason === 'tool_calls' || message?.tool_calls?.length)
      ) {
        console.warn(
          '⚠️ Provider returned an unexecuted tool call; falling back to the web search plugin'
        );
        this.serverToolsUnsupported = true;
        usePlugin = true;
        modelAttempts -= 1;
        continue;
      }

      if (!message?.content) {
        if (modelAttempts < MAX_EMPTY_RESPONSE_ATTEMPTS) {
          console.warn(
            `OpenRouter returned no content (attempt ${modelAttempts}/${MAX_EMPTY_RESPONSE_ATTEMPTS}, ${finishInfo}); retrying`
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

      // Some models break the server-side tool loop and emit the tool call as
      // literal text. Strict json_schema is the usual trigger, so drop it first
      // (keeping the tools); if markup persists without the schema, the model
      // cannot drive server tools at all — switch to the model-agnostic web
      // plugin for this call and every later one on this client.
      if (
        wantsTools &&
        TOOL_CALL_MARKUP.test(message.content) &&
        modelAttempts < MAX_EMPTY_RESPONSE_ATTEMPTS
      ) {
        if (useSchema) {
          console.warn(
            `⚠️ Model emitted tool-call markup under json_schema (attempt ${modelAttempts}/${MAX_EMPTY_RESPONSE_ATTEMPTS}); retrying with json_object`
          );
          useSchema = false;
          continue;
        }
        if (!usePlugin) {
          console.warn(
            `⚠️ Model emitted tool-call markup instead of executing server-side tools (attempt ${modelAttempts}/${MAX_EMPTY_RESPONSE_ATTEMPTS}); falling back to the web search plugin`
          );
          this.serverToolsUnsupported = true;
          usePlugin = true;
          continue;
        }
      }

      // Some providers drop tool citations under strict schema mode; a response
      // whose sources cannot be verified is useless downstream, so spend one
      // attempt to get a cited response without the schema instead.
      if (
        useSchema &&
        wantsTools &&
        citations.length === 0 &&
        modelAttempts < MAX_EMPTY_RESPONSE_ATTEMPTS
      ) {
        console.warn(
          `⚠️ Structured output carried no citations (attempt ${modelAttempts}/${MAX_EMPTY_RESPONSE_ATTEMPTS}); retrying with json_object`
        );
        useSchema = false;
        continue;
      }

      let data: T;
      try {
        data = parseJson<T>(message.content);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        const snippet = message.content.slice(0, 200);
        if (modelAttempts < MAX_EMPTY_RESPONSE_ATTEMPTS) {
          console.warn(
            `OpenRouter returned unparseable JSON (attempt ${modelAttempts}/${MAX_EMPTY_RESPONSE_ATTEMPTS}): ${reason}; content starts with: ${snippet}`
          );
          continue;
        }
        throw new Error(
          `OpenRouter returned unparseable JSON after ${MAX_EMPTY_RESPONSE_ATTEMPTS} attempts: ${reason}; content starts with: ${snippet}`,
          { cause: error }
        );
      }

      return {
        data,
        citations,
        webSearchRequests:
          payload.usage?.server_tool_use?.web_search_requests ??
          payload.usage?.server_tool_use_details?.web_search_requests ??
          0,
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
