import { NEWS_CATEGORIES } from './types';

// Structural constraints only (types, enums, required). Counts and lengths are
// deliberately left to the repair/validation layer: strict-mode support for
// keywords like minItems is inconsistent across providers, and a leaner schema
// maximizes the chance json_schema is accepted alongside the web tools.

export interface JsonSchemaSpec {
  name: string;
  schema: Record<string, unknown>;
}

export const DISCOVERY_SCHEMA: JsonSchemaSpec = {
  name: 'discovery_response',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['stories'],
    properties: {
      stories: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: [
            'headline',
            'summary',
            'category',
            'publishedAt',
            'sourceUrl',
            'sourceName',
            'whyItMatters',
          ],
          properties: {
            headline: { type: 'string' },
            summary: { type: 'string' },
            category: { type: 'string', enum: [...NEWS_CATEGORIES] },
            publishedAt: { type: 'string' },
            sourceUrl: { type: 'string' },
            sourceName: { type: 'string' },
            whyItMatters: { type: 'string' },
          },
        },
      },
    },
  },
};

// No "story" property: the selected story is injected server-side after parsing.
export const RESEARCH_BRIEF_SCHEMA: JsonSchemaSpec = {
  name: 'research_brief',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['angle', 'context', 'keyFacts', 'technicalImplications', 'openQuestions', 'sources'],
    properties: {
      angle: { type: 'string' },
      context: { type: 'string' },
      keyFacts: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['claim', 'sourceUrls'],
          properties: {
            claim: { type: 'string' },
            sourceUrls: { type: 'array', items: { type: 'string' } },
          },
        },
      },
      technicalImplications: { type: 'array', items: { type: 'string' } },
      openQuestions: { type: 'array', items: { type: 'string' } },
      sources: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['title', 'url', 'publisher', 'publishedAt', 'sourceType'],
          properties: {
            title: { type: 'string' },
            url: { type: 'string' },
            publisher: { type: 'string' },
            publishedAt: { type: ['string', 'null'] },
            sourceType: { type: 'string', enum: ['primary', 'reporting', 'analysis'] },
          },
        },
      },
    },
  },
};

export const GENERATED_POST_SCHEMA: JsonSchemaSpec = {
  name: 'generated_post',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'content', 'tags', 'summary', 'faq'],
    properties: {
      title: { type: 'string' },
      content: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
      summary: { type: 'string' },
      faq: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['question', 'answer'],
          properties: {
            question: { type: 'string' },
            answer: { type: 'string' },
          },
        },
      },
    },
  },
};
