import { describe, it, expect } from 'vitest';
import enJson from '../../i18n/en.json';
import esJson from '../../i18n/es.json';
import projects from '../../content/projects.json';

describe('FeaturedProjects i18n keys', () => {
  const expectedKeys = ['title', 'viewCaseStudy', 'live', 'github'];

  it('should have all required projects keys in en.json', () => {
    for (const key of expectedKeys) {
      expect(enJson.projects).toHaveProperty(key);
      expect(enJson.projects[key as keyof typeof enJson.projects]).toBeTruthy();
    }
  });

  it('should have all required projects keys in es.json', () => {
    for (const key of expectedKeys) {
      expect(esJson.projects).toHaveProperty(key);
      expect(esJson.projects[key as keyof typeof esJson.projects]).toBeTruthy();
    }
  });

  it('should have matching key structures in en.json and es.json', () => {
    expect(Object.keys(enJson.projects).sort()).toEqual(Object.keys(esJson.projects).sort());
  });
});

describe('projects.json data structure', () => {
  it('should have at least one project', () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it('should have slug, description, and tags on each project', () => {
    for (const project of projects) {
      expect(project).toHaveProperty('slug');
      expect(project).toHaveProperty('description');
      expect(project).toHaveProperty('tags');
      expect(project.slug).toBeTruthy();
      expect(project.description).toBeTruthy();
      expect(Array.isArray(project.tags)).toBe(true);
      expect(project.tags.length).toBeGreaterThan(0);
    }
  });

  it('should have unique slugs', () => {
    const slugs = projects.map(p => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
