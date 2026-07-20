import { describe, expect, it, vi } from 'vitest';
import type { OpenRouterClient } from '../lib/openrouter';
import { generateEnglishPost, generateSpanishPost } from '../lib/post-generator';
import type { GeneratedPost, ResearchBrief } from '../lib/types';

const rules = {
  wordsMin: 1200,
  wordsMax: 2000,
  tone: 'practical',
  persona: 'Juan Almeida, a full-stack & AI engineer',
  avoid: ['generic advice'],
};

const sources = [
  {
    title: 'Primary announcement',
    url: 'https://vendor.example/announcement',
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
  story: {
    headline: 'News story',
    summary: 'Summary',
    category: 'software-development',
    publishedAt: '2026-07-17',
    sourceUrl: sources[0].url,
    sourceName: 'Vendor',
    whyItMatters: 'Impact',
  },
  angle: 'Angle',
  context: 'Context',
  keyFacts: Array.from({ length: 5 }, (_, index) => ({
    claim: `Fact ${index}`,
    sourceUrls: [sources[index % sources.length].url],
  })),
  technicalImplications: ['Implication'],
  openQuestions: ['Question'],
  sources,
};

function validPost(content: string): GeneratedPost {
  return {
    title: 'A valid generated title',
    content,
    tags: ['ai', 'tooling', 'engineering'],
    summary: 'S'.repeat(130),
    faq: [
      { question: 'Q1?', answer: 'A1' },
      { question: 'Q2?', answer: 'A2' },
      { question: 'Q3?', answer: 'A3' },
    ],
  };
}

function longContent(citations: string[]): string {
  const links = citations.map((url, index) => `[Source ${index + 1}](${url})`).join(' and ');
  return `${'lorem ipsum '.repeat(650)}${links}`;
}

function clientReturning(...posts: GeneratedPost[]): {
  client: OpenRouterClient;
  completeJson: ReturnType<typeof vi.fn>;
} {
  const completeJson = vi.fn();
  for (const post of posts) {
    completeJson.mockResolvedValueOnce({ data: post, citations: [], webSearchRequests: 0 });
  }
  completeJson.mockResolvedValue({
    data: posts[posts.length - 1],
    citations: [],
    webSearchRequests: 0,
  });
  return { client: { completeJson } as unknown as OpenRouterClient, completeJson };
}

describe('generateEnglishPost', () => {
  it('accepts citations that differ from sources only by normalization', async () => {
    const content = longContent([`${sources[0].url}/`, `${sources[1].url}?utm_source=x`]);
    const { client, completeJson } = clientReturning(validPost(content));

    const post = await generateEnglishPost(client, brief, 'programming', rules);

    expect(post.content).toBe(content);
    expect(completeJson).toHaveBeenCalledTimes(1);
    expect(completeJson.mock.calls[0][0].schema).toMatchObject({ name: 'generated_post' });
  });

  it('rejects posts citing unresearched URLs after all attempts', async () => {
    const content = longContent([sources[0].url, 'https://unknown.example/made-up']);
    const { client, completeJson } = clientReturning(validPost(content));

    await expect(generateEnglishPost(client, brief, 'programming', rules)).rejects.toThrow(
      'Generated post cites an unresearched URL: https://unknown.example/made-up'
    );
    expect(completeJson).toHaveBeenCalledTimes(3);
  });

  it('feeds the failed post back into the retry prompt for repair', async () => {
    const badPost = {
      ...validPost(longContent([sources[0].url, sources[1].url])),
      summary: 'Too short',
    };
    const goodPost = validPost(longContent([sources[0].url, sources[1].url]));
    const { client, completeJson } = clientReturning(badPost, goodPost);

    const post = await generateEnglishPost(client, brief, 'programming', rules);

    expect(post.summary).toBe(goodPost.summary);
    expect(completeJson).toHaveBeenCalledTimes(2);
    const retryPrompt = completeJson.mock.calls[1][0].userPrompt;
    expect(retryPrompt).toContain('Your previous attempt produced this post JSON');
    expect(retryPrompt).toContain(
      'It failed validation: Generated summary must be 120–160 characters'
    );
  });

  it('prompts a word ceiling below the hard validation cap', async () => {
    const content = longContent([sources[0].url, sources[1].url]);
    const { client, completeJson } = clientReturning(validPost(content));

    await generateEnglishPost(client, brief, 'programming', rules);

    const systemPrompt = completeJson.mock.calls[0][0].systemPrompt;
    expect(systemPrompt).toContain('between 1200 and 1800 words');
    expect(systemPrompt).not.toContain('and 2000 words');
  });

  it('tells the model exactly how many words to cut when a post runs long', async () => {
    const overlongPost = validPost(
      `${'lorem ipsum '.repeat(1050)}${longContent([sources[0].url, sources[1].url])}`
    );
    const goodPost = validPost(longContent([sources[0].url, sources[1].url]));
    const { client, completeJson } = clientReturning(overlongPost, goodPost);

    const post = await generateEnglishPost(client, brief, 'programming', rules);

    expect(post).toEqual(goodPost);
    const retryPrompt = completeJson.mock.calls[1][0].userPrompt;
    expect(retryPrompt).toMatch(/remove at least \d+ words/);
  });

  it('reports every validation problem at once so one retry can fix them all', async () => {
    const badPost = {
      ...validPost(
        `${'lorem ipsum '.repeat(1050)}${longContent([sources[0].url, sources[1].url])}`
      ),
      summary: 'Too short',
    };
    const goodPost = validPost(longContent([sources[0].url, sources[1].url]));
    const { client, completeJson } = clientReturning(badPost, goodPost);

    await generateEnglishPost(client, brief, 'programming', rules);

    const retryPrompt = completeJson.mock.calls[1][0].userPrompt;
    expect(retryPrompt).toContain('Generated summary must be 120–160 characters');
    expect(retryPrompt).toMatch(/remove at least \d+ words/);
  });

  it('caps the Spanish target at the English post word count', async () => {
    const englishPost = validPost(longContent([sources[0].url, sources[1].url]));
    const englishWords = englishPost.content.trim().split(/\s+/).filter(Boolean).length;
    const { client, completeJson } = clientReturning(englishPost);

    await generateSpanishPost(client, englishPost, brief, rules);

    const systemPrompt = completeJson.mock.calls[0][0].systemPrompt;
    expect(systemPrompt).toContain(`between 1200 and ${englishWords} words`);
    expect(systemPrompt).toContain(`The English post is ${englishWords} words`);
    expect(systemPrompt).toContain('must not be longer than the English post');
  });

  it('repairs malformed shapes before validating', async () => {
    const content = longContent([sources[0].url, sources[1].url]);
    const malformed = {
      title: ['A title', 'in an array'],
      content,
      tags: ['AI', 'Tooling', 'Engineering'],
      summary: 'S'.repeat(130),
      faq: [
        { question: 'Q1?', answer: 'A1' },
        { question: '', answer: 'dropped' },
        { question: 'Q2?', answer: 'A2' },
        { question: 'Q3?', answer: 'A3' },
      ],
    } as unknown as GeneratedPost;
    const { client } = clientReturning(malformed);

    const post = await generateEnglishPost(client, brief, 'programming', rules);

    expect(post.title).toBe('A title\n\nin an array');
    expect(post.tags).toEqual(['ai', 'tooling', 'engineering']);
    expect(post.faq).toHaveLength(3);
  });
});
