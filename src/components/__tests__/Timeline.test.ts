import { describe, it, expect } from 'vitest';
import experience from '../../content/experience.json';

describe('experience.json data structure', () => {
  it('should have at least one entry', () => {
    expect(experience.length).toBeGreaterThan(0);
  });

  it('should have role, period, and description on each entry', () => {
    for (const item of experience) {
      expect(item).toHaveProperty('role');
      expect(item).toHaveProperty('period');
      expect(item).toHaveProperty('description');
      expect(item.role).toBeTruthy();
      expect(item.period).toBeTruthy();
      expect(item.description).toBeTruthy();
    }
  });
});
