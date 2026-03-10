import { describe, it, expect } from 'vitest';
import skills from '../../content/skills.json';
import enJson from '../../i18n/en.json';
import esJson from '../../i18n/es.json';
import { skillCategoryKeyMap } from '../../utils/skills';

describe('ResumeSkillsGrid data', () => {
  const categoryKeys = ['frameworks', 'languages', 'deployment', 'specialization'];

  it('should have skillCategories i18n keys in en.json', () => {
    expect(enJson.resume).toHaveProperty('skillCategories');
    for (const key of categoryKeys) {
      expect(enJson.resume.skillCategories).toHaveProperty(key);
      expect(
        enJson.resume.skillCategories[key as keyof typeof enJson.resume.skillCategories]
      ).toBeTruthy();
    }
  });

  it('should have skillCategories i18n keys in es.json', () => {
    expect(esJson.resume).toHaveProperty('skillCategories');
    for (const key of categoryKeys) {
      expect(esJson.resume.skillCategories).toHaveProperty(key);
      expect(
        esJson.resume.skillCategories[key as keyof typeof esJson.resume.skillCategories]
      ).toBeTruthy();
    }
  });

  it('should have matching skillCategories keys between en and es', () => {
    const enKeys = Object.keys(enJson.resume.skillCategories).sort();
    const esKeys = Object.keys(esJson.resume.skillCategories).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('should have a category key mapping for every skills.json category', () => {
    for (const group of skills) {
      expect(skillCategoryKeyMap).toHaveProperty(group.category);
      const key = skillCategoryKeyMap[group.category] as keyof typeof enJson.resume.skillCategories;
      expect(enJson.resume.skillCategories[key]).toBeTruthy();
      expect(esJson.resume.skillCategories[key]).toBeTruthy();
    }
  });

  it('should produce valid category data for the component', () => {
    const categories = skills.map(group => ({
      icon: group.icon,
      label:
        enJson.resume.skillCategories[
          skillCategoryKeyMap[group.category] as keyof typeof enJson.resume.skillCategories
        ] || group.category,
      skills: group.skills,
    }));

    expect(categories).toHaveLength(4);
    for (const cat of categories) {
      expect(cat.icon).toBeTruthy();
      expect(cat.label).toBeTruthy();
      expect(cat.skills.length).toBeGreaterThan(0);
    }
  });
});
