import { randomInt } from 'node:crypto';
import type { OpenRouterClient, UrlCitation } from './openrouter';
import { repairNewsCandidates, repairResearchBrief } from './repair';
import { DISCOVERY_SCHEMA, RESEARCH_BRIEF_SCHEMA } from './schemas';
import { citationUrls, isHttpsUrl, normalizeUrl } from './urls';
import {
  NEWS_CATEGORIES,
  type BlogHistoryEntry,
  type NewsCandidate,
  type ResearchBrief,
  type ResearchOptions,
  type ResearchSource,
} from './types';

interface DiscoveryResponse {
  stories: NewsCandidate[];
}

const MAX_VALIDATION_ATTEMPTS = 3;
// A batch this size keeps some randomness in story selection; below it we keep
// retrying, but a smaller non-empty batch still beats a failed run.
const PREFERRED_MIN_CANDIDATES = 2;
// When other candidates remain as fallbacks, give each story fewer attempts.
const FALLBACK_STORY_ATTEMPTS = 2;
// Keeps retry prompts and diagnostics bounded when searches return many pages.
const MAX_LISTED_CITATIONS = 30;

function citationListPrompt(citations: UrlCitation[]): string {
  return citations
    .slice(0, MAX_LISTED_CITATIONS)
    .map(citation => `- ${citation.title.slice(0, 120)} — ${citation.url}`)
    .join('\n');
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
  let bestBatch: NewsCandidate[] = [];
  const citationsSeen = new Map<string, UrlCitation>();

  for (let attempt = 1; attempt <= MAX_VALIDATION_ATTEMPTS; attempt += 1) {
    const retryGuidance = lastError
      ? [
          `The previous result failed validation: ${lastError}`,
          'Correct every issue.',
          ...(citationsSeen.size > 0
            ? [
                'Your earlier web searches returned these pages (title — URL):',
                citationListPrompt([...citationsSeen.values()]),
                'Choose stories whose sourceUrl is one of these exact URLs, or run new searches and use only URLs those searches return.',
              ]
            : []),
        ].join('\n')
      : '';

    const response = await client.completeJson<DiscoveryResponse>({
      systemPrompt: `You are a meticulous technology news editor. You must use web search before answering.
Find distinct, consequential news—not evergreen tutorials, rumors, opinion-only posts, or minor product marketing.
Prefer primary sources such as official announcements, release notes, repositories, standards, papers, and incident reports.
Cite only URLs that your web searches actually returned in this conversation — never URLs recalled from memory.
Return JSON only with a "stories" array.`,
      userPrompt: `Today is ${now.toISOString()}.
Find exactly ${options.candidateCount} important stories published during the latest ${options.lookbackDays} calendar days.
The allowed subjects are: ${options.subjects.join(', ')}.
Search broadly across all subjects. Each story must describe a different event and cite the canonical article URL used to verify its publication date.
Every sourceUrl MUST be copied verbatim from a URL returned by your web search results in this conversation. Stories whose URLs the searches did not return are discarded.

Do not repeat these previously covered stories or URLs:
${historyPrompt(history)}

${retryGuidance}

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
      maxTokens: 16000,
      reasoningEffort: 'low',
      schema: DISCOVERY_SCHEMA,
    });

    console.log(
      `🔍 Discovery attempt ${attempt}: ${response.webSearchRequests} web search request(s), ${response.citations.length} citation(s)`
    );

    for (const citation of response.citations) {
      if (!isHttpsUrl(citation.url)) continue;
      const normalized = normalizeUrl(citation.url);
      if (!citationsSeen.has(normalized)) citationsSeen.set(normalized, citation);
    }

    const { valid, rejected } = repairNewsCandidates(
      response.data?.stories,
      response.citations,
      history,
      now,
      options
    );
    rejected.forEach(item => console.warn(`⚠️ Dropped candidate: ${item.reason}`));
    if (valid.length === 0 && response.citations.length > 0) {
      console.warn(
        `⚠️ URLs the web research actually returned this attempt:\n${citationListPrompt(response.citations)}`
      );
    }

    if (valid.length >= Math.min(PREFERRED_MIN_CANDIDATES, options.candidateCount)) return valid;

    if (valid.length > bestBatch.length) bestBatch = valid;
    lastError = `only ${valid.length} of ${options.candidateCount} candidates survived validation${
      rejected.length ? `: ${rejected.map(item => item.reason).join('; ')}` : ''
    }`;
    console.warn(`⚠️ Discovery attempt ${attempt} came up short: ${lastError}`);
  }

  if (bestBatch.length > 0) {
    console.warn(
      `⚠️ Proceeding with ${bestBatch.length} validated candidate(s) after ${MAX_VALIDATION_ATTEMPTS} attempts`
    );
    return bestBatch;
  }

  throw new Error(
    `Could not discover valid weekly news after ${MAX_VALIDATION_ATTEMPTS} attempts: ${lastError}`
  );
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
  if (!brief?.story || !isHttpsUrl(brief.story.sourceUrl)) {
    throw new Error(
      `Research brief story is missing a valid HTTPS source URL: ${brief?.story?.sourceUrl ?? 'none'}`
    );
  }
  if (normalizeUrl(brief.story.sourceUrl) !== normalizeUrl(selectedStory.sourceUrl)) {
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
  for (const source of brief.sources) {
    if (!isHttpsUrl(source.url)) {
      throw new Error(`Research sources must use valid HTTPS URLs: ${source.url}`);
    }
  }
  if (distinctDomains(brief.sources) < minimumSources) {
    throw new Error(`Research brief needs ${minimumSources} independent source domains`);
  }

  const cited = citationUrls(citations);
  const sourceUrls = new Set<string>();
  for (const source of brief.sources) {
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
  now = new Date(),
  attempts = MAX_VALIDATION_ATTEMPTS
): Promise<ResearchBrief> {
  let lastError = '';
  let lastBriefJson = '';

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
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
${
  lastError
    ? `A previous attempt produced this brief (possibly truncated):
${lastBriefJson}
It failed validation: ${lastError}
Repair it: keep everything that was correct and fix only the listed problems.
If a source could not be verified by your web tools, replace it with one you actually searched or fetched in this conversation.`
    : ''
}

Return: angle, context, at least five keyFacts ({claim, sourceUrls}), technicalImplications, openQuestions, and sources ({title, url, publisher, publishedAt when known, sourceType as primary/reporting/analysis}).`,
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
            max_uses: 6,
            max_content_tokens: 12000,
          },
        },
      ],
      maxTokens: 24000,
      reasoningEffort: 'low',
      schema: RESEARCH_BRIEF_SCHEMA,
    });

    console.log(
      `🔍 Research attempt ${attempt}: ${response.webSearchRequests} web search request(s), ${response.citations.length} citation(s)`
    );

    const { brief, dropped } = repairResearchBrief(response.data, story, response.citations);
    dropped.forEach(reason => console.warn(`⚠️ Dropped from brief: ${reason}`));

    try {
      return validateResearchBrief(brief, story, response.citations, minimumSources);
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      lastBriefJson = JSON.stringify(response.data).slice(0, 4000);
      console.warn(`⚠️ Research attempt ${attempt} failed validation: ${lastError}`);
    }
  }

  throw new Error(
    `Could not build a valid research brief after ${attempts} attempts: ${lastError}`
  );
}

export async function researchAnyStory(
  client: OpenRouterClient,
  candidates: NewsCandidate[],
  minimumSources: number,
  now = new Date(),
  pickIndex: (length: number) => number = length => randomInt(length)
): Promise<ResearchBrief> {
  const remaining = [...candidates];
  const failures: string[] = [];

  while (remaining.length > 0) {
    const story = selectRandomStory(remaining, pickIndex);
    remaining.splice(remaining.indexOf(story), 1);
    console.log(`🎲 Selected: ${story.headline}`);
    console.log('🔎 Investigating the selected story in depth...');

    const attempts = remaining.length > 0 ? FALLBACK_STORY_ATTEMPTS : MAX_VALIDATION_ATTEMPTS;
    try {
      return await researchSelectedStory(client, story, minimumSources, now, attempts);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${story.headline}: ${message}`);
      if (remaining.length > 0) {
        console.warn(
          `⚠️ Story could not be researched; falling back to another candidate: ${message}`
        );
      }
    }
  }

  throw new Error(`Could not research any candidate story:\n${failures.join('\n')}`);
}

export function categoryForStory(category: NewsCandidate['category']): string {
  if (category === 'ai') return 'ai';
  if (category === 'software-architecture') return 'architecture';
  return 'programming';
}
