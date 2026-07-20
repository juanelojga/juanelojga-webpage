import { describe, expect, it, vi } from 'vitest';
import type { OpenRouterClient } from '../lib/openrouter';
import {
  discoverWeeklyNews,
  researchSelectedStory,
  selectRandomStory,
  validateNewsCandidates,
  validateResearchBrief,
} from '../lib/research';
import type { NewsCandidate, ResearchBrief } from '../lib/types';

const now = new Date('2026-07-18T12:00:00.000Z');
const options = {
  lookbackDays: 7,
  candidateCount: 4,
  minimumSources: 3,
  subjects: ['software development', 'ai', 'coding', 'software architecture'],
};

function story(index: number, overrides: Partial<NewsCandidate> = {}): NewsCandidate {
  return {
    headline: `News story ${index}`,
    summary: `Verified summary ${index}`,
    category: 'software-development',
    publishedAt: '2026-07-17',
    sourceUrl: `https://source${index}.example/news`,
    sourceName: `Source ${index}`,
    whyItMatters: `Technical impact ${index}`,
    ...overrides,
  };
}

function citationsFor(stories: NewsCandidate[]) {
  return stories.map(item => ({ url: item.sourceUrl, title: item.headline }));
}

describe('validateNewsCandidates', () => {
  it('accepts exactly four fresh, distinct, cited stories', () => {
    const stories = [story(1), story(2), story(3), story(4)];
    expect(validateNewsCandidates(stories, citationsFor(stories), [], now, options)).toEqual(
      stories
    );
  });

  it('rejects stale stories', () => {
    const stories = [story(1, { publishedAt: '2026-07-01' }), story(2), story(3), story(4)];
    expect(() => validateNewsCandidates(stories, citationsFor(stories), [], now, options)).toThrow(
      'outside the 7-day window'
    );
  });

  it('rejects sources not returned by web research', () => {
    const stories = [story(1), story(2), story(3), story(4)];
    expect(() =>
      validateNewsCandidates(stories, citationsFor(stories.slice(1)), [], now, options)
    ).toThrow('was not returned by web research');
  });

  it('rejects a source URL already recorded in history', () => {
    const stories = [story(1), story(2), story(3), story(4)];
    const history = [{ topic: 'Older article', sourceUrls: [stories[0].sourceUrl] }];
    expect(() =>
      validateNewsCandidates(stories, citationsFor(stories), history, now, options)
    ).toThrow('already covered');
  });
});

describe('selectRandomStory', () => {
  it('uses the supplied random index', () => {
    const stories = [story(1), story(2), story(3), story(4)];
    expect(selectRandomStory(stories, () => 2)).toEqual(stories[2]);
  });

  it('rejects an invalid random index', () => {
    expect(() => selectRandomStory([story(1)], () => 1)).toThrow('invalid index');
  });
});

describe('validateResearchBrief', () => {
  it('requires primary and independent cited sources', () => {
    const selected = story(1);
    const sources = [
      {
        title: 'Primary announcement',
        url: selected.sourceUrl,
        publisher: 'Vendor',
        sourceType: 'primary' as const,
      },
      {
        title: 'Independent report',
        url: 'https://report.example/story',
        publisher: 'Reporter',
        sourceType: 'reporting' as const,
      },
      {
        title: 'Technical analysis',
        url: 'https://analysis.example/story',
        publisher: 'Analyst',
        sourceType: 'analysis' as const,
      },
    ];
    const brief: ResearchBrief = {
      story: selected,
      angle: 'What working engineers should understand',
      context: 'The technical and historical context.',
      keyFacts: Array.from({ length: 5 }, (_, index) => ({
        claim: `Verified fact ${index}`,
        sourceUrls: [sources[index % sources.length].url],
      })),
      technicalImplications: ['One implication'],
      openQuestions: ['One open question'],
      sources,
    };

    const citations = sources.map(source => ({ url: source.url, title: source.title }));
    expect(validateResearchBrief(brief, selected, citations, 3)).toEqual(brief);
  });

  it('names the offending source URL instead of throwing a bare Invalid URL error', () => {
    const selected = story(1);
    const sources = [
      {
        title: 'Primary announcement',
        url: selected.sourceUrl,
        publisher: 'Vendor',
        sourceType: 'primary' as const,
      },
      {
        title: 'Broken source',
        url: 'not-a-url',
        publisher: 'Reporter',
        sourceType: 'reporting' as const,
      },
      {
        title: 'Technical analysis',
        url: 'https://analysis.example/story',
        publisher: 'Analyst',
        sourceType: 'analysis' as const,
      },
    ];
    const brief: ResearchBrief = {
      story: selected,
      angle: 'Angle',
      context: 'Context',
      keyFacts: Array.from({ length: 5 }, (_, index) => ({
        claim: `Fact ${index}`,
        sourceUrls: [selected.sourceUrl],
      })),
      technicalImplications: ['Implication'],
      openQuestions: ['Question'],
      sources,
    };

    expect(() => validateResearchBrief(brief, selected, [], 3)).toThrow(
      'Research sources must use valid HTTPS URLs: not-a-url'
    );
  });

  it('rejects a brief whose story has a malformed source URL', () => {
    const selected = story(1);
    const brief = {
      story: { ...selected, sourceUrl: 'nonsense' },
      angle: 'Angle',
      context: 'Context',
      keyFacts: [],
      technicalImplications: [],
      openQuestions: [],
      sources: [],
    } as unknown as ResearchBrief;

    expect(() => validateResearchBrief(brief, selected, [], 3)).toThrow(
      'Research brief story is missing a valid HTTPS source URL: nonsense'
    );
  });
});

describe('research tool execution', () => {
  it('accepts cited weekly discovery when the usage counter is unavailable', async () => {
    const stories = [story(1), story(2), story(3), story(4)];
    const completeJson = vi.fn().mockResolvedValue({
      data: { stories },
      citations: citationsFor(stories),
      webSearchRequests: 0,
    });
    const client = { completeJson } as unknown as OpenRouterClient;

    await discoverWeeklyNews(client, [], options, now);

    const request = completeJson.mock.calls[0][0];
    expect(request).not.toHaveProperty('toolChoice');
    expect(request.reasoningEffort).toBe('low');
    expect(request.tools).toContainEqual(
      expect.objectContaining({ type: 'openrouter:web_search' })
    );
    expect(completeJson).toHaveBeenCalledTimes(1);
  });

  it('accepts cited deeper research when the usage counter is unavailable', async () => {
    const selected = story(1);
    const sources = [
      {
        title: 'Primary announcement',
        url: selected.sourceUrl,
        publisher: 'Vendor',
        sourceType: 'primary' as const,
      },
      {
        title: 'Independent report',
        url: 'https://report.example/story',
        publisher: 'Reporter',
        sourceType: 'reporting' as const,
      },
      {
        title: 'Technical analysis',
        url: 'https://analysis.example/story',
        publisher: 'Analyst',
        sourceType: 'analysis' as const,
      },
    ];
    const brief: ResearchBrief = {
      story: selected,
      angle: 'A grounded engineering angle',
      context: 'Verified context',
      keyFacts: Array.from({ length: 5 }, (_, index) => ({
        claim: `Fact ${index}`,
        sourceUrls: [sources[index % sources.length].url],
      })),
      technicalImplications: ['Implication'],
      openQuestions: ['Question'],
      sources,
    };
    const completeJson = vi.fn().mockResolvedValue({
      data: brief,
      citations: sources.map(source => ({ url: source.url, title: source.title })),
      webSearchRequests: 0,
    });
    const client = { completeJson } as unknown as OpenRouterClient;

    await researchSelectedStory(client, selected, 3, now);

    const request = completeJson.mock.calls[0][0];
    expect(request).not.toHaveProperty('toolChoice');
    expect(request.tools).toContainEqual({
      type: 'openrouter:web_fetch',
      parameters: {
        engine: 'openrouter',
        max_uses: 6,
        max_content_tokens: 12000,
      },
    });
    expect(completeJson).toHaveBeenCalledTimes(1);
  });
});
