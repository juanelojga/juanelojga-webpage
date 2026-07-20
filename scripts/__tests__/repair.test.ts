import { describe, expect, it } from 'vitest';
import {
  coerceSourceType,
  coerceString,
  coerceStringArray,
  repairNewsCandidates,
  repairResearchBrief,
} from '../lib/repair';
import { validateResearchBrief } from '../lib/research';
import type { NewsCandidate } from '../lib/types';

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

describe('coerceString', () => {
  it('trims plain strings', () => {
    expect(coerceString('  hello  ')).toBe('hello');
  });

  it('joins arrays of strings', () => {
    expect(coerceString(['first part', '', 'second part'])).toBe('first part\n\nsecond part');
  });

  it('joins the values of plain objects', () => {
    expect(coerceString({ background: 'why it happened', whyNow: 'timing' })).toBe(
      'why it happened\n\ntiming'
    );
  });

  it('stringifies numbers and booleans', () => {
    expect(coerceString(42)).toBe('42');
    expect(coerceString(true)).toBe('true');
  });

  it('returns an empty string for null and undefined', () => {
    expect(coerceString(null)).toBe('');
    expect(coerceString(undefined)).toBe('');
  });
});

describe('coerceStringArray', () => {
  it('wraps a single string', () => {
    expect(coerceStringArray('one item')).toEqual(['one item']);
  });

  it('coerces array elements and drops empties', () => {
    expect(coerceStringArray(['a', '', null, 3])).toEqual(['a', '3']);
  });

  it('returns an empty array for non-array, non-string input', () => {
    expect(coerceStringArray(undefined)).toEqual([]);
    expect(coerceStringArray({})).toEqual([]);
  });
});

describe('coerceSourceType', () => {
  it('normalizes case and whitespace', () => {
    expect(coerceSourceType(' PRIMARY ')).toBe('primary');
  });

  it('maps synonyms', () => {
    expect(coerceSourceType('official')).toBe('primary');
    expect(coerceSourceType('news')).toBe('reporting');
    expect(coerceSourceType('opinion')).toBe('analysis');
  });

  it('never defaults to primary', () => {
    expect(coerceSourceType('garbage')).toBe('reporting');
    expect(coerceSourceType(undefined)).toBe('reporting');
    expect(coerceSourceType(42)).toBe('reporting');
  });
});

describe('repairNewsCandidates', () => {
  it('keeps a fully valid batch', () => {
    const stories = [story(1), story(2), story(3), story(4)];
    const { valid, rejected } = repairNewsCandidates(
      stories,
      citationsFor(stories),
      [],
      now,
      options
    );
    expect(valid).toEqual(stories);
    expect(rejected).toEqual([]);
  });

  it('drops stale stories but keeps the rest', () => {
    const stories = [story(1, { publishedAt: '2026-07-01' }), story(2), story(3), story(4)];
    const { valid, rejected } = repairNewsCandidates(
      stories,
      citationsFor(stories),
      [],
      now,
      options
    );
    expect(valid).toEqual(stories.slice(1));
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toContain('outside the 7-day window');
  });

  it('drops sources not returned by web research', () => {
    const stories = [story(1), story(2), story(3), story(4)];
    const { valid, rejected } = repairNewsCandidates(
      stories,
      citationsFor(stories.slice(1)),
      [],
      now,
      options
    );
    expect(valid).toEqual(stories.slice(1));
    expect(rejected[0].reason).toContain('was not returned by web research');
  });

  it('drops stories already recorded in history', () => {
    const stories = [story(1), story(2), story(3), story(4)];
    const history = [{ topic: 'Older article', sourceUrls: [stories[0].sourceUrl] }];
    const { valid, rejected } = repairNewsCandidates(
      stories,
      citationsFor(stories),
      history,
      now,
      options
    );
    expect(valid).toEqual(stories.slice(1));
    expect(rejected[0].reason).toContain('already covered');
  });

  it('coerces category case before validating it', () => {
    const stories = [story(1, { category: 'AI' as NewsCandidate['category'] })];
    const { valid } = repairNewsCandidates(stories, citationsFor(stories), [], now, options);
    expect(valid[0].category).toBe('ai');
  });

  it('handles non-array input', () => {
    const { valid, rejected } = repairNewsCandidates(undefined, [], [], now, options);
    expect(valid).toEqual([]);
    expect(rejected).toEqual([]);
  });
});

describe('repairResearchBrief', () => {
  const selected = story(1);
  const sources = [
    {
      title: 'Primary announcement',
      url: selected.sourceUrl,
      publisher: 'Vendor',
      sourceType: 'primary',
    },
    {
      title: 'Independent report',
      url: 'https://report.example/story',
      publisher: 'Reporter',
      sourceType: 'reporting',
    },
    {
      title: 'Technical analysis',
      url: 'https://analysis.example/story',
      publisher: 'Analyst',
      sourceType: 'analysis',
    },
  ];
  const citations = sources.map(source => ({ url: source.url, title: source.title }));

  function rawBrief(overrides: Record<string, unknown> = {}) {
    return {
      angle: 'What working engineers should understand',
      context: 'The technical and historical context.',
      keyFacts: Array.from({ length: 5 }, (_, index) => ({
        claim: `Verified fact ${index}`,
        sourceUrls: [sources[index % sources.length].url],
      })),
      technicalImplications: ['One implication'],
      openQuestions: ['One open question'],
      sources,
      ...overrides,
    };
  }

  it('forces the selected story into the brief', () => {
    const { brief } = repairResearchBrief(rawBrief({ story: story(9) }), selected, citations);
    expect(brief.story).toEqual(selected);
  });

  it('filters uncited sources and rewires facts to survivors', () => {
    const uncited = {
      title: 'Unfetched spec',
      url: 'https://raw.example.com/spec.md',
      publisher: 'Repo',
      sourceType: 'primary',
    };
    const raw = rawBrief({
      sources: [...sources, uncited],
      keyFacts: [
        { claim: 'Cited fact', sourceUrls: [sources[0].url, uncited.url] },
        { claim: 'Orphaned fact', sourceUrls: [uncited.url] },
        ...Array.from({ length: 4 }, (_, index) => ({
          claim: `Fact ${index}`,
          sourceUrls: [sources[index % sources.length].url],
        })),
      ],
    });

    const { brief, dropped } = repairResearchBrief(raw, selected, citations);

    expect(brief.sources).toHaveLength(3);
    expect(brief.sources.map(source => source.url)).not.toContain(uncited.url);
    expect(brief.keyFacts[0].sourceUrls).toEqual([sources[0].url]);
    expect(brief.keyFacts.map(fact => fact.claim)).not.toContain('Orphaned fact');
    expect(dropped.join('\n')).toContain('uncited source');
    expect(dropped.join('\n')).toContain('Orphaned fact');
  });

  it('coerces an array-valued context so the brief passes strict validation', () => {
    const raw = rawBrief({ context: ['First paragraph.', 'Second paragraph.'] });
    const { brief } = repairResearchBrief(raw, selected, citations);
    expect(brief.context).toBe('First paragraph.\n\nSecond paragraph.');
    expect(validateResearchBrief(brief, selected, citations, 3)).toEqual(brief);
  });

  it('still fails validation when filtering leaves too few sources', () => {
    const raw = rawBrief();
    const partialCitations = citations.slice(0, 1);
    const { brief } = repairResearchBrief(raw, selected, partialCitations);
    expect(brief.sources).toHaveLength(1);
    expect(() => validateResearchBrief(brief, selected, partialCitations, 3)).toThrow(
      'needs at least five sourced facts'
    );
  });

  it('never fabricates a primary source type', () => {
    const raw = rawBrief({
      sources: sources.map(source => ({ ...source, sourceType: 'mystery' })),
    });
    const { brief } = repairResearchBrief(raw, selected, citations);
    expect(brief.sources.every(source => source.sourceType === 'reporting')).toBe(true);
    expect(() => validateResearchBrief(brief, selected, citations, 3)).toThrow(
      'needs at least one primary source'
    );
  });

  it('handles a completely malformed payload without throwing', () => {
    const { brief } = repairResearchBrief('not an object', selected, citations);
    expect(brief.story).toEqual(selected);
    expect(brief.sources).toEqual([]);
    expect(brief.keyFacts).toEqual([]);
  });
});
