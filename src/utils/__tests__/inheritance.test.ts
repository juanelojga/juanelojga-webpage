import { describe, it, expect } from 'vitest';
import projects from '../../content/projects.json';
import { getInheritanceStory, hasInheritanceStory } from '../inheritance';

const projectWithInheritance = projects.find(p => p.slug === 'aiecommerce-agent-pipeline')!;
const projectWithoutInheritance = { title: 'Test', slug: 'test', description: '', tags: [] };

describe('inheritance utility', () => {
  describe('hasInheritanceStory', () => {
    it('returns true for projects with inheritanceStory', () => {
      expect(hasInheritanceStory(projectWithInheritance)).toBe(true);
    });

    it('returns false for projects without inheritanceStory', () => {
      expect(hasInheritanceStory(projectWithoutInheritance)).toBe(false);
    });

    it('returns false for projects with null inheritanceStory', () => {
      expect(hasInheritanceStory({ inheritanceStory: null } as any)).toBe(false);
    });

    it('returns false for projects with undefined inheritanceStory', () => {
      expect(hasInheritanceStory({ inheritanceStory: undefined })).toBe(false);
    });
  });

  describe('getInheritanceStory', () => {
    it('returns the inheritance story for projects that have one', () => {
      const story = getInheritanceStory(projectWithInheritance);
      expect(story).not.toBeNull();
      expect(story!.parentClass.name).toBe('Autonomous Agent Orchestration Engine');
      expect(story!.inheritedTraits.length).toBe(3);
      expect(story!.overrides.length).toBe(2);
      expect(story!.resultingIdentity).toBeTruthy();
    });

    it('returns null for projects without inheritance story', () => {
      expect(getInheritanceStory(projectWithoutInheritance)).toBeNull();
    });
  });

  describe('all projects with inheritance data', () => {
    const projectsWithStory = projects.filter(p => hasInheritanceStory(p));

    it('should have 3 projects with inheritance stories', () => {
      expect(projectsWithStory.length).toBe(3);
    });

    it.each(projectsWithStory)('$slug should return a valid story', project => {
      const story = getInheritanceStory(project);
      expect(story).not.toBeNull();
      expect(story!.parentClass.name).toBeTruthy();
      expect(story!.inheritedTraits.length).toBeGreaterThan(0);
      expect(story!.overrides.length).toBeGreaterThan(0);
      expect(story!.resultingIdentity).toBeTruthy();
    });
  });
});
