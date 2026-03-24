import { describe, it, expect } from 'vitest';
import projects from '../../content/projects.json';
import { hasInheritanceStory, getInheritanceStory } from '../../utils/inheritance';
import type { InheritanceSectionLabels } from '../../types/inheritance';
import enJson from '../../i18n/en.json';
import esJson from '../../i18n/es.json';

const projectsWithInheritance = projects.filter(p => hasInheritanceStory(p));

describe('InheritanceSection integration', () => {
  it('should have projects with inheritance stories', () => {
    expect(projectsWithInheritance.length).toBe(3);
  });

  describe.each(projectsWithInheritance)('$slug', project => {
    const story = getInheritanceStory(project);

    it('should have a valid inheritance story', () => {
      expect(story).not.toBeNull();
    });

    it('should have parentClass with name, description, and icon', () => {
      expect(story!.parentClass.name).toBeTruthy();
      expect(story!.parentClass.description).toBeTruthy();
      expect(story!.parentClass.icon).toBeTruthy();
    });

    it('should have at least one inherited trait', () => {
      expect(story!.inheritedTraits.length).toBeGreaterThan(0);
    });

    it('should have traits with label, evidence, and origin', () => {
      for (const trait of story!.inheritedTraits) {
        expect(trait.label).toBeTruthy();
        expect(trait.evidence).toBeTruthy();
        expect(trait.origin).toBeTruthy();
      }
    });

    it('should have at least one override', () => {
      expect(story!.overrides.length).toBeGreaterThan(0);
    });

    it('should have overrides with label and description', () => {
      for (const override of story!.overrides) {
        expect(override.label).toBeTruthy();
        expect(override.description).toBeTruthy();
      }
    });

    it('should have a resulting identity', () => {
      expect(story!.resultingIdentity).toBeTruthy();
    });
  });

  describe('i18n labels', () => {
    const expectedKeys: (keyof InheritanceSectionLabels)[] = [
      'sectionTitle',
      'subtitle',
      'parentClassLabel',
      'inheritedTraitsLabel',
      'overridesLabel',
      'resultingIdentityLabel',
      'returnCta',
    ];

    it('should have all required inheritance keys in en.json', () => {
      for (const key of expectedKeys) {
        expect(enJson.caseStudy.inheritance).toHaveProperty(key);
        expect(
          enJson.caseStudy.inheritance[key as keyof typeof enJson.caseStudy.inheritance]
        ).toBeTruthy();
      }
    });

    it('should have all required inheritance keys in es.json', () => {
      for (const key of expectedKeys) {
        expect(esJson.caseStudy.inheritance).toHaveProperty(key);
        expect(
          esJson.caseStudy.inheritance[key as keyof typeof esJson.caseStudy.inheritance]
        ).toBeTruthy();
      }
    });

    it('should have matching key structures between en and es', () => {
      expect(Object.keys(enJson.caseStudy.inheritance).sort()).toEqual(
        Object.keys(esJson.caseStudy.inheritance).sort()
      );
    });
  });
});
