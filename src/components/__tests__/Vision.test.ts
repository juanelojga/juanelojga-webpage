import { describe, it, expect } from 'vitest';

const cards = [
  {
    icon: 'visibility',
    title: 'My Vision',
    description:
      'To bridge the gap between cutting-edge AI research and production-ready software, creating systems that are both intelligent and reliable at scale.',
  },
  {
    icon: 'trending_up',
    title: 'My Expectations',
    description:
      'I hold myself to high standards of code quality, performance, and user experience. Every project is an opportunity to raise the bar and deliver meaningful impact.',
  },
  {
    icon: 'rocket_launch',
    title: 'Future Focus',
    description:
      'Exploring the intersection of AI agents, full-stack architecture, and developer tooling to build the next generation of intelligent applications.',
  },
];

describe('Vision content structure', () => {
  it('should have exactly 3 cards', () => {
    expect(cards).toHaveLength(3);
  });

  it('should have required fields on each card', () => {
    for (const card of cards) {
      expect(card).toHaveProperty('icon');
      expect(card).toHaveProperty('title');
      expect(card).toHaveProperty('description');
      expect(card.icon).toBeTruthy();
      expect(card.title).toBeTruthy();
      expect(card.description).toBeTruthy();
    }
  });
});
