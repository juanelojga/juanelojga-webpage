import { describe, it, expect } from 'vitest';
import skills from '../../content/skills.json';

describe('skills.json data structure', () => {
  it('should have exactly 4 categories', () => {
    expect(skills).toHaveLength(4);
  });

  it('should have required fields on each category', () => {
    for (const group of skills) {
      expect(group).toHaveProperty('icon');
      expect(group).toHaveProperty('category');
      expect(group).toHaveProperty('skills');
      expect(group.icon).toBeTruthy();
      expect(group.category).toBeTruthy();
      expect(Array.isArray(group.skills)).toBe(true);
      expect(group.skills.length).toBeGreaterThan(0);
    }
  });

  it('should have the expected categories', () => {
    const categories = skills.map(s => s.category);
    expect(categories).toContain('Frameworks');
    expect(categories).toContain('Languages');
    expect(categories).toContain('Deployment');
    expect(categories).toContain('Specialization');
  });
});
