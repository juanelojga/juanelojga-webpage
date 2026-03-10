import { describe, it, expect } from 'vitest';

const cards = [
  {
    icon: 'school',
    title: 'Self-Learner',
    description:
      'Constantly expanding my skill set through hands-on experimentation, open-source contributions, and deep dives into emerging technologies.',
  },
  {
    icon: 'explore',
    title: 'Curiosity-Driven',
    description:
      'I approach every problem with genuine curiosity, asking "why" before "how" to uncover solutions that address root causes, not just symptoms.',
  },
  {
    icon: 'shield',
    title: 'Responsible Developer',
    description:
      'I believe in writing code that is maintainable, accessible, and ethical — building software that serves people and stands the test of time.',
  },
];

describe('Philosophy content structure', () => {
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
