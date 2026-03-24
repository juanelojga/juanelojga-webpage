import { describe, it, expect } from 'vitest';
import projects from '../../content/projects.json';
import { hasInheritanceStory, getInheritanceStory } from '../../utils/inheritance';

const projectsWithInheritance = projects.filter(p => hasInheritanceStory(p));

describe('ParentClassPanel', () => {
  it('should have projects with inheritance stories to render', () => {
    expect(projectsWithInheritance.length).toBeGreaterThan(0);
  });

  describe.each(projectsWithInheritance)('$slug parentClass', project => {
    const story = getInheritanceStory(project)!;

    it('should have a parentClass name', () => {
      expect(story.parentClass.name).toBeTruthy();
      expect(typeof story.parentClass.name).toBe('string');
    });

    it('should have a parentClass description', () => {
      expect(story.parentClass.description).toBeTruthy();
      expect(typeof story.parentClass.description).toBe('string');
    });

    it('should have a parentClass icon (Material Symbols identifier)', () => {
      expect(story.parentClass.icon).toBeTruthy();
      expect(typeof story.parentClass.icon).toBe('string');
      // Material Symbols identifiers use snake_case
      expect(story.parentClass.icon).toMatch(/^[a-z][a-z0-9_]*$/);
    });

    it('should have a description suitable for display (non-trivial length)', () => {
      expect(story.parentClass.description.length).toBeGreaterThan(20);
    });

    it('should have a name suitable for monospace heading display', () => {
      // Name should be concise enough for heading treatment
      expect(story.parentClass.name.length).toBeLessThan(60);
      expect(story.parentClass.name.length).toBeGreaterThan(5);
    });
  });
});
