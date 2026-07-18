import { describe, expect, it } from 'vitest';
import { selectRandomStory, validateNewsCandidates, validateResearchBrief } from '../lib/research';
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
});
