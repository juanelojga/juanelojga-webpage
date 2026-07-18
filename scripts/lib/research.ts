import { randomInt } from 'node:crypto';
import type { OpenRouterClient, UrlCitation } from './openrouter';
import {
  NEWS_CATEGORIES,
  type NewsCandidate,
  type ResearchBrief,
  type ResearchSource,
} from './types';

interface BlogHistoryEntry {
  topic: string;
  sourceUrls?: string[];
}

interface DiscoveryResponse {
  stories: NewsCandidate[];
}

interface ResearchOptions {
  lookbackDays: number;
  candidateCount: number;
  minimumSources: number;
  subjects: string[];
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeUrl(value: string): string {
  const url = new URL(value);
  url.hash = '';
  url.search = '';
  return url.toString().replace(/\/$/, '');
}

function startOfLookbackWindow(now: Date, lookbackDays: number): Date {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - (lookbackDays - 1));
  return start;
}

function citationUrls(citations: UrlCitation[]): Set<string> {
  return new Set(citations.filter(c => isHttpsUrl(c.url)).map(c => normalizeUrl(c.url)));
}

export function validateNewsCandidates(
  stories: NewsCandidate[],
  citations: UrlCitation[],
  history: BlogHistoryEntry[],
  now: Date,
  options: ResearchOptions
): NewsCandidate[] {
  if (!Array.isArray(stories) || stories.length !== options.candidateCount) {
    throw new Error(`Expected exactly ${options.candidateCount} news stories`);
  }

  const earliest = startOfLookbackWindow(now, options.lookbackDays).getTime();
  const latest = now.getTime() + 24 * 60 * 60 * 1000;
  const seen = new Set<string>();
  const cited = citationUrls(citations);
  const pastUrls = new Set(
    history
      .flatMap(item => item.sourceUrls ?? [])
      .filter(isHttpsUrl)
      .map(normalizeUrl)
  );
  const pastTopics = new Set(history.map(item => item.topic.trim().toLowerCase()));

  for (const story of stories) {
    if (!NEWS_CATEGORIES.includes(story.category)) {
      throw new Error(`Unsupported news category: ${story.category}`);
    }
    if (!isHttpsUrl(story.sourceUrl)) throw new Error('Every story needs a valid HTTPS source');

    const normalizedUrl = normalizeUrl(story.sourceUrl);
    if (seen.has(normalizedUrl)) throw new Error('News stories must have distinct source URLs');
    if (pastUrls.has(normalizedUrl)) throw new Error('A discovered story was already covered');
    if (pastTopics.has(story.headline.trim().toLowerCase())) {
      throw new Error('A discovered headline was already covered');
    }
    if (!cited.has(normalizedUrl)) {
      throw new Error(`Story source was not returned by web research: ${story.sourceUrl}`);
    }

    const publishedAt = Date.parse(story.publishedAt);
    if (!Number.isFinite(publishedAt) || publishedAt < earliest || publishedAt > latest) {
      throw new Error(`Story is outside the ${options.lookbackDays}-day window: ${story.headline}`);
    }
    if (!story.headline.trim() || !story.summary.trim() || !story.whyItMatters.trim()) {
      throw new Error('Every story needs a headline, summary, and relevance explanation');
    }
    seen.add(normalizedUrl);
  }

  return stories;
}

export function selectRandomStory(
  stories: NewsCandidate[],
  pickIndex: (length: number) => number = length => randomInt(length)
): NewsCandidate {
  if (stories.length === 0) throw new Error('Cannot select from an empty story list');
  const index = pickIndex(stories.length);
  if (!Number.isInteger(index) || index < 0 || index >= stories.length) {
    throw new Error('Random story selector returned an invalid index');
  }
  return stories[index];
}

function historyPrompt(history: BlogHistoryEntry[]): string {
  if (history.length === 0) return 'No previous stories.';
  return history
    .slice(-20)
    .map(
      item => `- ${item.topic}${item.sourceUrls?.length ? ` (${item.sourceUrls.join(', ')})` : ''}`
    )
    .join('\n');
}

export async function discoverWeeklyNews(
  client: OpenRouterClient,
  history: BlogHistoryEntry[],
  options: ResearchOptions,
  now = new Date()
): Promise<NewsCandidate[]> {
  let lastError = '';

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const response = await client.completeJson<DiscoveryResponse>({
      systemPrompt: `You are a meticulous technology news editor. You must use web search before answering.
Find distinct, consequential news—not evergreen tutorials, rumors, opinion-only posts, or minor product marketing.
Prefer primary sources such as official announcements, release notes, repositories, standards, papers, and incident reports.
Return JSON only with a "stories" array.`,
      userPrompt: `Today is ${now.toISOString()}.
Find exactly ${options.candidateCount} important stories published during the latest ${options.lookbackDays} calendar days.
The allowed subjects are: ${options.subjects.join(', ')}.
Search broadly across all subjects. Each story must describe a different event and cite the canonical article URL used to verify its publication date.

Do not repeat these previously covered stories or URLs:
${historyPrompt(history)}

${lastError ? `The previous result failed validation: ${lastError}\nCorrect every issue.` : ''}

Return each story with: headline, summary, category (one of ${NEWS_CATEGORIES.join(', ')}), publishedAt (ISO date), sourceUrl (HTTPS), sourceName, and whyItMatters.`,
      tools: [
        {
          type: 'openrouter:web_search',
          parameters: {
            engine: 'exa',
            max_results: 8,
            max_total_results: 24,
            max_characters: 5000,
          },
        },
      ],
      toolChoice: 'required',
      maxTokens: 5000,
    });

    console.log(
      `🔍 Discovery attempt ${attempt}: ${response.webSearchRequests} web search request(s), ${response.citations.length} citation(s)`
    );

    try {
      return validateNewsCandidates(
        response.data.stories,
        response.citations,
        history,
        now,
        options
      );
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }

  throw new Error(`Could not discover valid weekly news after two attempts: ${lastError}`);
}

function distinctDomains(sources: ResearchSource[]): number {
  return new Set(sources.map(source => new URL(source.url).hostname.replace(/^www\./, ''))).size;
}

export function validateResearchBrief(
  brief: ResearchBrief,
  selectedStory: NewsCandidate,
  citations: UrlCitation[],
  minimumSources: number
): ResearchBrief {
  if (
    !brief?.story ||
    normalizeUrl(brief.story.sourceUrl) !== normalizeUrl(selectedStory.sourceUrl)
  ) {
    throw new Error('Research brief does not match the selected story');
  }
  if (!brief.angle?.trim() || !brief.context?.trim()) {
    throw new Error('Research brief needs an angle and context');
  }
  if (!Array.isArray(brief.keyFacts) || brief.keyFacts.length < 5) {
    throw new Error('Research brief needs at least five sourced facts');
  }
  if (!Array.isArray(brief.sources) || brief.sources.length < minimumSources) {
    throw new Error(`Research brief needs at least ${minimumSources} sources`);
  }
  if (!brief.sources.some(source => source.sourceType === 'primary')) {
    throw new Error('Research brief needs at least one primary source');
  }
  if (distinctDomains(brief.sources) < minimumSources) {
    throw new Error(`Research brief needs ${minimumSources} independent source domains`);
  }

  const cited = citationUrls(citations);
  const sourceUrls = new Set<string>();
  for (const source of brief.sources) {
    if (!isHttpsUrl(source.url)) throw new Error('Research sources must use HTTPS URLs');
    const normalized = normalizeUrl(source.url);
    if (!cited.has(normalized)) {
      throw new Error(`Research source was not returned by web tools: ${source.url}`);
    }
    sourceUrls.add(normalized);
  }

  for (const fact of brief.keyFacts) {
    if (!fact.claim?.trim() || !Array.isArray(fact.sourceUrls) || fact.sourceUrls.length === 0) {
      throw new Error('Every research fact needs a claim and at least one source URL');
    }
    for (const url of fact.sourceUrls) {
      if (!isHttpsUrl(url) || !sourceUrls.has(normalizeUrl(url))) {
        throw new Error(`Fact cites an unknown research source: ${url}`);
      }
    }
  }

  return brief;
}

export async function researchSelectedStory(
  client: OpenRouterClient,
  story: NewsCandidate,
  minimumSources: number,
  now = new Date()
): Promise<ResearchBrief> {
  let lastError = '';

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const response = await client.completeJson<ResearchBrief>({
      systemPrompt: `You are a technical research analyst. Use web search and web fetch extensively before answering.
Verify claims against the fetched pages. Separate facts from interpretation. Prefer primary material and corroborate it with independent reporting or analysis.
Return a JSON research brief only.`,
      userPrompt: `Today is ${now.toISOString()}.
Research this selected weekly news story in depth:
${JSON.stringify(story, null, 2)}

Read the original source, find the best primary source, and find independent sources that add technical context or corroboration.
Use at least ${minimumSources} sources from different domains, including at least one primary source.
Do not use social posts, search-result pages, scraped copies, or sources you did not actually read.
${lastError ? `The previous result failed validation: ${lastError}\nCorrect every issue.` : ''}

Return: story, angle, context, at least five keyFacts ({claim, sourceUrls}), technicalImplications, openQuestions, and sources ({title, url, publisher, publishedAt when known, sourceType as primary/reporting/analysis}).`,
      tools: [
        {
          type: 'openrouter:web_search',
          parameters: {
            engine: 'exa',
            max_results: 8,
            max_total_results: 24,
            max_characters: 6000,
          },
        },
        {
          type: 'openrouter:web_fetch',
          parameters: {
            engine: 'openrouter',
            max_uses: 10,
            max_content_tokens: 50000,
          },
        },
      ],
      toolChoice: 'required',
      maxTokens: 8000,
    });

    console.log(
      `🔍 Research attempt ${attempt}: ${response.webSearchRequests} web search request(s), ${response.citations.length} citation(s)`
    );

    try {
      return validateResearchBrief(response.data, story, response.citations, minimumSources);
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }

  throw new Error(`Could not build a valid research brief after two attempts: ${lastError}`);
}

export function categoryForStory(category: NewsCandidate['category']): string {
  if (category === 'ai') return 'ai';
  if (category === 'software-architecture') return 'architecture';
  return 'programming';
}
