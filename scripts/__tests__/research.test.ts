import { describe, expect, it, vi } from 'vitest';
import type { OpenRouterClient } from '../lib/openrouter';
import {
  discoverWeeklyNews,
  researchAnyStory,
  researchSelectedStory,
  selectRandomStory,
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

function sourcesFor(selected: NewsCandidate) {
  return [
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
}

function briefWithoutStory(sources: ReturnType<typeof sourcesFor>) {
  return {
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
}

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
    const sources = sourcesFor(selected);
    const brief: ResearchBrief = { story: selected, ...briefWithoutStory(sources) };

    const citations = sources.map(source => ({ url: source.url, title: source.title }));
    expect(validateResearchBrief(brief, selected, citations, 3)).toEqual(brief);
  });

  it('names the offending source URL instead of throwing a bare Invalid URL error', () => {
    const selected = story(1);
    const sources = sourcesFor(selected);
    sources[1] = { ...sources[1], url: 'not-a-url' };
    const brief: ResearchBrief = {
      story: selected,
      ...briefWithoutStory(sourcesFor(selected)),
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

describe('discoverWeeklyNews', () => {
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
    expect(request.schema).toMatchObject({ name: 'discovery_response' });
    expect(request.tools).toContainEqual(
      expect.objectContaining({ type: 'openrouter:web_search' })
    );
    expect(completeJson).toHaveBeenCalledTimes(1);
  });

  it('filters invalid candidates instead of rejecting the whole batch', async () => {
    const stories = [story(1, { publishedAt: '2026-07-01' }), story(2), story(3), story(4)];
    const completeJson = vi.fn().mockResolvedValue({
      data: { stories },
      citations: citationsFor(stories),
      webSearchRequests: 0,
    });
    const client = { completeJson } as unknown as OpenRouterClient;

    const result = await discoverWeeklyNews(client, [], options, now);

    expect(result).toEqual(stories.slice(1));
    expect(completeJson).toHaveBeenCalledTimes(1);
  });

  it('falls back to the best surviving batch after exhausting attempts', async () => {
    const stories = [
      story(1),
      story(2, { publishedAt: '2026-07-01' }),
      story(3, { publishedAt: '2026-07-01' }),
      story(4, { publishedAt: '2026-07-01' }),
    ];
    const completeJson = vi.fn().mockResolvedValue({
      data: { stories },
      citations: citationsFor(stories),
      webSearchRequests: 0,
    });
    const client = { completeJson } as unknown as OpenRouterClient;

    const result = await discoverWeeklyNews(client, [], options, now);

    expect(result).toEqual([stories[0]]);
    expect(completeJson).toHaveBeenCalledTimes(3);
  });

  it('throws when no candidate ever survives', async () => {
    const stories = [story(1, { publishedAt: '2026-07-01' })];
    const completeJson = vi.fn().mockResolvedValue({
      data: { stories },
      citations: citationsFor(stories),
      webSearchRequests: 0,
    });
    const client = { completeJson } as unknown as OpenRouterClient;

    await expect(discoverWeeklyNews(client, [], options, now)).rejects.toThrow(
      'Could not discover valid weekly news after 3 attempts'
    );
    expect(completeJson).toHaveBeenCalledTimes(3);
  });
});

describe('researchSelectedStory', () => {
  it('accepts cited deeper research when the usage counter is unavailable', async () => {
    const selected = story(1);
    const sources = sourcesFor(selected);
    const completeJson = vi.fn().mockResolvedValue({
      data: briefWithoutStory(sources),
      citations: sources.map(source => ({ url: source.url, title: source.title })),
      webSearchRequests: 0,
    });
    const client = { completeJson } as unknown as OpenRouterClient;

    const brief = await researchSelectedStory(client, selected, 3, now);

    expect(brief.story).toEqual(selected);
    const request = completeJson.mock.calls[0][0];
    expect(request.userPrompt).not.toMatch(/Return: story/);
    expect(request).not.toHaveProperty('toolChoice');
    expect(request.schema).toMatchObject({ name: 'research_brief' });
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

  it('feeds the failed brief back into the retry prompt for repair', async () => {
    const selected = story(1);
    const sources = sourcesFor(selected);
    const thinSources = sources.slice(0, 2);
    const completeJson = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          ...briefWithoutStory(sources),
          sources: thinSources,
          keyFacts: Array.from({ length: 5 }, (_, index) => ({
            claim: `Fact ${index}`,
            sourceUrls: [thinSources[index % thinSources.length].url],
          })),
        },
        citations: thinSources.map(source => ({ url: source.url, title: source.title })),
        webSearchRequests: 0,
      })
      .mockResolvedValueOnce({
        data: briefWithoutStory(sources),
        citations: sources.map(source => ({ url: source.url, title: source.title })),
        webSearchRequests: 0,
      });
    const client = { completeJson } as unknown as OpenRouterClient;

    const brief = await researchSelectedStory(client, selected, 3, now);

    expect(brief.story).toEqual(selected);
    expect(completeJson).toHaveBeenCalledTimes(2);
    const retryPrompt = completeJson.mock.calls[1][0].userPrompt;
    expect(retryPrompt).toContain('It failed validation:');
    expect(retryPrompt).toContain('needs at least 3 sources');
    expect(retryPrompt).toContain('A previous attempt produced this brief');
  });
});

describe('researchAnyStory', () => {
  it('falls back to another candidate when one cannot be researched', async () => {
    const storyA = story(1);
    const storyB = story(2);
    const sources = sourcesFor(storyB);
    const completeJson = vi.fn().mockImplementation(async ({ userPrompt }) => {
      if (userPrompt.includes(storyA.headline)) {
        return { data: {}, citations: [], webSearchRequests: 0 };
      }
      return {
        data: briefWithoutStory(sources),
        citations: sources.map(source => ({ url: source.url, title: source.title })),
        webSearchRequests: 0,
      };
    });
    const client = { completeJson } as unknown as OpenRouterClient;

    const brief = await researchAnyStory(client, [storyA, storyB], 3, now, () => 0);

    expect(brief.story).toEqual(storyB);
  });

  it('aggregates failures when no candidate can be researched', async () => {
    const completeJson = vi.fn().mockResolvedValue({
      data: {},
      citations: [],
      webSearchRequests: 0,
    });
    const client = { completeJson } as unknown as OpenRouterClient;

    await expect(researchAnyStory(client, [story(1), story(2)], 3, now, () => 0)).rejects.toThrow(
      'Could not research any candidate story'
    );
    // 2 attempts for the first candidate (a fallback remained), 3 for the last.
    expect(completeJson).toHaveBeenCalledTimes(5);
  });
});
