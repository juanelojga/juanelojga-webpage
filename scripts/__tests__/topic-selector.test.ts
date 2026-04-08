import { describe, it, expect } from 'vitest';
import { selectTopic, popTopicQueue } from '../lib/topic-selector';

const baseConfig = {
  categories: [
    { id: 'ai', themes: ['RAG pipelines', 'prompt engineering'] },
    { id: 'frontend', themes: ['React performance'] },
  ],
  topicQueue: [],
  generationRules: {
    wordsMin: 1200,
    wordsMax: 2000,
    tone: 'practical',
    persona: 'Juan Almeida',
    avoid: ['generic advice'],
  },
};

const emptyHistory = { generated: [] };

describe('selectTopic', () => {
  it('should use manual topic when provided', () => {
    const result = selectTopic(baseConfig, emptyHistory, 'Custom Topic');
    expect(result.topic).toBe('Custom Topic');
    expect(result.needsAI).toBe(false);
  });

  it('should use topic queue when available', () => {
    const config = { ...baseConfig, topicQueue: ['Queued Topic'] };
    const result = selectTopic(config, emptyHistory);
    expect(result.topic).toBe('Queued Topic');
    expect(result.needsAI).toBe(false);
  });

  it('should request AI selection when no manual topic or queue', () => {
    const result = selectTopic(baseConfig, emptyHistory);
    expect(result.topic).toBe('');
    expect(result.needsAI).toBe(true);
  });

  it('should prefer manual topic over queue', () => {
    const config = { ...baseConfig, topicQueue: ['Queued Topic'] };
    const result = selectTopic(config, emptyHistory, 'Manual Override');
    expect(result.topic).toBe('Manual Override');
    expect(result.needsAI).toBe(false);
  });
});

describe('popTopicQueue', () => {
  it('should remove first item from queue', () => {
    const config = { ...baseConfig, topicQueue: ['First', 'Second', 'Third'] };
    const updated = popTopicQueue(config);
    expect(updated.topicQueue).toEqual(['Second', 'Third']);
  });

  it('should handle empty queue', () => {
    const updated = popTopicQueue(baseConfig);
    expect(updated.topicQueue).toEqual([]);
  });

  it('should not mutate original config', () => {
    const config = { ...baseConfig, topicQueue: ['First', 'Second'] };
    popTopicQueue(config);
    expect(config.topicQueue).toEqual(['First', 'Second']);
  });
});
