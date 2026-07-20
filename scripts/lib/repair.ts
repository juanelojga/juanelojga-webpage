import type { UrlCitation } from './openrouter';
import { citationUrls, isHttpsUrl, normalizeUrl } from './urls';
import {
  NEWS_CATEGORIES,
  type BlogHistoryEntry,
  type NewsCandidate,
  type NewsCategory,
  type ResearchBrief,
  type ResearchFact,
  type ResearchOptions,
  type ResearchSource,
} from './types';

export function coerceString(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value.map(coerceString).filter(Boolean).join('\n\n');
  }
  if (value && typeof value === 'object') {
    return Object.values(value).map(coerceString).filter(Boolean).join('\n\n');
  }
  return '';
}

export function coerceStringArray(value: unknown): string[] {
  if (typeof value === 'string') return value.trim() ? [value.trim()] : [];
  if (Array.isArray(value)) return value.map(coerceString).filter(Boolean);
  return [];
}

const SOURCE_TYPE_SYNONYMS: Record<string, ResearchSource['sourceType']> = {
  primary: 'primary',
  official: 'primary',
  announcement: 'primary',
  reporting: 'reporting',
  report: 'reporting',
  news: 'reporting',
  analysis: 'analysis',
  commentary: 'analysis',
  opinion: 'analysis',
};

// Defaults to 'reporting' so repair can never fabricate the mandatory primary source.
export function coerceSourceType(value: unknown): ResearchSource['sourceType'] {
  if (typeof value !== 'string') return 'reporting';
  return SOURCE_TYPE_SYNONYMS[value.trim().toLowerCase()] ?? 'reporting';
}

export interface RejectedCandidate {
  story: unknown;
  reason: string;
}

function startOfLookbackWindow(now: Date, lookbackDays: number): Date {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - (lookbackDays - 1));
  return start;
}

export function repairNewsCandidates(
  raw: unknown,
  citations: UrlCitation[],
  history: BlogHistoryEntry[],
  now: Date,
  options: ResearchOptions
): { valid: NewsCandidate[]; rejected: RejectedCandidate[] } {
  const valid: NewsCandidate[] = [];
  const rejected: RejectedCandidate[] = [];
  const earliest = startOfLookbackWindow(now, options.lookbackDays).getTime();
  const latest = now.getTime() + 24 * 60 * 60 * 1000;
  const cited = citationUrls(citations);
  const seen = new Set<string>();
  const pastUrls = new Set(
    history
      .flatMap(item => item.sourceUrls ?? [])
      .filter(isHttpsUrl)
      .map(normalizeUrl)
  );
  const pastTopics = new Set(history.map(item => item.topic.trim().toLowerCase()));

  for (const rawStory of Array.isArray(raw) ? raw : []) {
    if (!rawStory || typeof rawStory !== 'object') {
      rejected.push({ story: rawStory, reason: 'Story is not an object' });
      continue;
    }
    const record = rawStory as Record<string, unknown>;
    const story: NewsCandidate = {
      headline: coerceString(record.headline),
      summary: coerceString(record.summary),
      category: coerceString(record.category).toLowerCase() as NewsCategory,
      publishedAt: coerceString(record.publishedAt),
      sourceUrl: coerceString(record.sourceUrl),
      sourceName: coerceString(record.sourceName),
      whyItMatters: coerceString(record.whyItMatters),
    };
    const label = story.headline || 'Unnamed story';

    if (!NEWS_CATEGORIES.includes(story.category)) {
      rejected.push({
        story: rawStory,
        reason: `${label}: unsupported category "${story.category}"`,
      });
      continue;
    }
    if (!isHttpsUrl(story.sourceUrl)) {
      rejected.push({ story: rawStory, reason: `${label}: missing a valid HTTPS source URL` });
      continue;
    }
    const normalizedUrl = normalizeUrl(story.sourceUrl);
    if (seen.has(normalizedUrl)) {
      rejected.push({ story: rawStory, reason: `${label}: duplicate source URL in this batch` });
      continue;
    }
    if (pastUrls.has(normalizedUrl)) {
      rejected.push({ story: rawStory, reason: `${label}: source URL already covered` });
      continue;
    }
    if (pastTopics.has(story.headline.trim().toLowerCase())) {
      rejected.push({ story: rawStory, reason: `${label}: headline already covered` });
      continue;
    }
    if (!cited.has(normalizedUrl)) {
      rejected.push({
        story: rawStory,
        reason: `${label}: source was not returned by web research (${story.sourceUrl})`,
      });
      continue;
    }
    const publishedAt = Date.parse(story.publishedAt);
    if (!Number.isFinite(publishedAt) || publishedAt < earliest || publishedAt > latest) {
      rejected.push({
        story: rawStory,
        reason: `${label}: outside the ${options.lookbackDays}-day window (${story.publishedAt})`,
      });
      continue;
    }
    if (!story.headline || !story.summary || !story.whyItMatters) {
      rejected.push({
        story: rawStory,
        reason: `${label}: missing headline, summary, or relevance explanation`,
      });
      continue;
    }

    seen.add(normalizedUrl);
    valid.push(story);
  }

  return { valid, rejected };
}

export function repairResearchBrief(
  raw: unknown,
  selectedStory: NewsCandidate,
  citations: UrlCitation[]
): { brief: ResearchBrief; dropped: string[] } {
  const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const dropped: string[] = [];
  const cited = citationUrls(citations);

  const sources: ResearchSource[] = [];
  const canonicalByNormalized = new Map<string, string>();
  for (const rawSource of Array.isArray(record.sources) ? record.sources : []) {
    if (!rawSource || typeof rawSource !== 'object') {
      dropped.push('source that is not an object');
      continue;
    }
    const entry = rawSource as Record<string, unknown>;
    const url = coerceString(entry.url);
    if (!isHttpsUrl(url)) {
      dropped.push(`source without a valid HTTPS URL: ${url || 'none'}`);
      continue;
    }
    const normalized = normalizeUrl(url);
    if (!cited.has(normalized)) {
      dropped.push(`uncited source: ${url}`);
      continue;
    }
    if (canonicalByNormalized.has(normalized)) {
      dropped.push(`duplicate source: ${url}`);
      continue;
    }
    canonicalByNormalized.set(normalized, url);
    const publishedAt = coerceString(entry.publishedAt);
    sources.push({
      title: coerceString(entry.title) || url,
      url,
      publisher: coerceString(entry.publisher) || new URL(url).hostname.replace(/^www\./, ''),
      ...(publishedAt ? { publishedAt } : {}),
      sourceType: coerceSourceType(entry.sourceType),
    });
  }

  const keyFacts: ResearchFact[] = [];
  for (const rawFact of Array.isArray(record.keyFacts) ? record.keyFacts : []) {
    if (!rawFact || typeof rawFact !== 'object') {
      dropped.push('fact that is not an object');
      continue;
    }
    const entry = rawFact as Record<string, unknown>;
    const claim = coerceString(entry.claim);
    const sourceUrls = [
      ...new Set(
        coerceStringArray(entry.sourceUrls)
          .filter(isHttpsUrl)
          .map(url => canonicalByNormalized.get(normalizeUrl(url)))
          .filter((url): url is string => Boolean(url))
      ),
    ];
    if (!claim) {
      dropped.push('fact without a claim');
      continue;
    }
    if (sourceUrls.length === 0) {
      dropped.push(`fact without surviving sources: ${claim.slice(0, 80)}`);
      continue;
    }
    keyFacts.push({ claim, sourceUrls });
  }

  const brief: ResearchBrief = {
    story: selectedStory,
    angle: coerceString(record.angle),
    context: coerceString(record.context),
    keyFacts,
    technicalImplications: coerceStringArray(record.technicalImplications),
    openQuestions: coerceStringArray(record.openQuestions),
    sources,
  };

  return { brief, dropped };
}
