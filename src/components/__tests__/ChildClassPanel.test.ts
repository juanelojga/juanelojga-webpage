import { describe, it, expect } from 'vitest';
import projects from '../../content/projects.json';
import { hasInheritanceStory, getInheritanceStory } from '../../utils/inheritance';

const projectsWithInheritance = projects.filter(p => hasInheritanceStory(p));

describe('ChildClassPanel', () => {
  it('should have projects with inheritance stories to render', () => {
    expect(projectsWithInheritance.length).toBeGreaterThan(0);
  });

  describe.each(projectsWithInheritance)('$slug childClass', project => {
    const story = getInheritanceStory(project)!;

    it('should have a project title for the child class heading', () => {
      expect(project.title).toBeTruthy();
      expect(typeof project.title).toBe('string');
    });

    it('should have a resulting identity statement', () => {
      expect(story.resultingIdentity).toBeTruthy();
      expect(typeof story.resultingIdentity).toBe('string');
    });

    it('should have a resulting identity of meaningful length', () => {
      expect(story.resultingIdentity.length).toBeGreaterThan(20);
    });

    it('should have a title distinct from parent class name', () => {
      expect(project.title).not.toBe(story.parentClass.name);
    });
  });
});
