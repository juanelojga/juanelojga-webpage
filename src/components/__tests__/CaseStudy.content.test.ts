import { describe, it, expect } from 'vitest';
import projects from '../../content/projects.json';
import type { InheritanceStory } from '../../types/inheritance';

interface CaseStudyProject {
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  image: string;
  links: { live: string; github: string };
  heroImage: string;
  metadata: {
    role: string;
    duration: string;
    techStack: string[];
    target: string;
  };
  challenge: string[];
  solution: {
    narrative: string[];
    features: { title: string; description: string }[];
  };
  implementation: {
    description: string;
    techPills: { label: string; color: string }[];
    codeSnippet: { language: string; code: string };
  };
  results: {
    metrics: { value: string; label: string }[];
    narrative: string;
  };
}

const caseStudyProjects = projects.filter((p): p is CaseStudyProject => 'metadata' in p);

describe('Case study content structure', () => {
  it('should have at least one project with case study fields', () => {
    expect(caseStudyProjects.length).toBeGreaterThan(0);
  });

  it('should have unique slugs across all projects', () => {
    const slugs = projects.map(p => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  describe.each(caseStudyProjects)('$slug', project => {
    it('should have valid metadata', () => {
      expect(project.metadata).toBeDefined();
      expect(project.metadata.role).toBeTruthy();
      expect(project.metadata.duration).toBeTruthy();
      expect(Array.isArray(project.metadata.techStack)).toBe(true);
      expect(project.metadata.techStack.length).toBeGreaterThan(0);
      expect(project.metadata.target).toBeTruthy();
    });

    it('should have heroImage', () => {
      expect(project.heroImage).toBeTruthy();
    });

    it('should have non-empty challenge array', () => {
      expect(Array.isArray(project.challenge)).toBe(true);
      expect(project.challenge.length).toBeGreaterThan(0);
      for (const paragraph of project.challenge) {
        expect(paragraph).toBeTruthy();
      }
    });

    it('should have valid solution with narrative and features', () => {
      expect(Array.isArray(project.solution.narrative)).toBe(true);
      expect(project.solution.narrative.length).toBeGreaterThan(0);
      expect(Array.isArray(project.solution.features)).toBe(true);
      expect(project.solution.features.length).toBeGreaterThan(0);
      for (const feature of project.solution.features) {
        expect(feature.title).toBeTruthy();
        expect(feature.description).toBeTruthy();
      }
    });

    it('should have valid implementation with techPills and codeSnippet', () => {
      expect(project.implementation.description).toBeTruthy();
      expect(Array.isArray(project.implementation.techPills)).toBe(true);
      expect(project.implementation.techPills.length).toBeGreaterThan(0);
      for (const pill of project.implementation.techPills) {
        expect(pill.label).toBeTruthy();
        expect(pill.color).toBeTruthy();
      }
      expect(project.implementation.codeSnippet.language).toBeTruthy();
      expect(project.implementation.codeSnippet.code).toBeTruthy();
    });

    it('should have valid results with metrics and narrative', () => {
      expect(Array.isArray(project.results.metrics)).toBe(true);
      expect(project.results.metrics.length).toBeGreaterThan(0);
      for (const metric of project.results.metrics) {
        expect(metric.value).toBeTruthy();
        expect(metric.label).toBeTruthy();
      }
      expect(project.results.narrative).toBeTruthy();
    });
  });
});

const projectsWithInheritance = projects.filter(
  (p): p is CaseStudyProject & { inheritanceStory: InheritanceStory } =>
    'inheritanceStory' in p && p.inheritanceStory !== undefined
);

describe('Inheritance story content structure', () => {
  it('should have at least one project with inheritance story', () => {
    expect(projectsWithInheritance.length).toBeGreaterThan(0);
  });

  describe.each(projectsWithInheritance)('$slug', project => {
    it('should have valid parentClass', () => {
      const { parentClass } = project.inheritanceStory;
      expect(parentClass.name).toBeTruthy();
      expect(parentClass.description).toBeTruthy();
      expect(parentClass.icon).toBeTruthy();
    });

    it('should have non-empty inheritedTraits array', () => {
      const { inheritedTraits } = project.inheritanceStory;
      expect(Array.isArray(inheritedTraits)).toBe(true);
      expect(inheritedTraits.length).toBeGreaterThan(0);
      for (const trait of inheritedTraits) {
        expect(trait.label).toBeTruthy();
        expect(trait.evidence).toBeTruthy();
        expect(trait.origin).toBeTruthy();
      }
    });

    it('should have non-empty overrides array', () => {
      const { overrides } = project.inheritanceStory;
      expect(Array.isArray(overrides)).toBe(true);
      expect(overrides.length).toBeGreaterThan(0);
      for (const override of overrides) {
        expect(override.label).toBeTruthy();
        expect(override.description).toBeTruthy();
      }
    });

    it('should have resultingIdentity', () => {
      expect(project.inheritanceStory.resultingIdentity).toBeTruthy();
    });
  });
});
