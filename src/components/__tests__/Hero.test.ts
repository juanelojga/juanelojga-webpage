import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import enJson from '../../i18n/en.json';
import esJson from '../../i18n/es.json';

const componentSource = readFileSync(resolve(__dirname, '../Hero.astro'), 'utf-8');

describe('Hero i18n keys', () => {
  const expectedKeys = ['subtitleTag', 'headline', 'description', 'ctaPrimary', 'ctaSecondary'];

  it('should have all required hero keys in en.json', () => {
    for (const key of expectedKeys) {
      expect(enJson.hero).toHaveProperty(key);
      expect(enJson.hero[key as keyof typeof enJson.hero]).toBeTruthy();
    }
  });

  it('should have all required hero keys in es.json', () => {
    for (const key of expectedKeys) {
      expect(esJson.hero).toHaveProperty(key);
      expect(esJson.hero[key as keyof typeof esJson.hero]).toBeTruthy();
    }
  });

  it('should have matching key structures in en.json and es.json', () => {
    expect(Object.keys(enJson.hero).sort()).toEqual(Object.keys(esJson.hero).sort());
  });

  it('should not have old hero keys', () => {
    expect(enJson.hero).not.toHaveProperty('greeting');
    expect(enJson.hero).not.toHaveProperty('name');
    expect(enJson.hero).not.toHaveProperty('viewWork');
    expect(enJson.hero).not.toHaveProperty('contactMe');
    expect(esJson.hero).not.toHaveProperty('greeting');
    expect(esJson.hero).not.toHaveProperty('name');
    expect(esJson.hero).not.toHaveProperty('viewWork');
    expect(esJson.hero).not.toHaveProperty('contactMe');
  });
});

describe('Hero composition', () => {
  it('should import HeroSvgBackground', () => {
    expect(componentSource).toContain("import HeroSvgBackground from './HeroSvgBackground.astro'");
  });

  it('should import HeroContent', () => {
    expect(componentSource).toContain("import HeroContent from './HeroContent.astro'");
  });

  it('should import HeroImageCollage', () => {
    expect(componentSource).toContain("import HeroImageCollage from './HeroImageCollage.astro'");
  });

  it('should use HeroSvgBackground component', () => {
    expect(componentSource).toContain('<HeroSvgBackground');
  });

  it('should use HeroContent component', () => {
    expect(componentSource).toContain('<HeroContent');
  });

  it('should use HeroImageCollage component', () => {
    expect(componentSource).toContain('<HeroImageCollage');
  });
});

describe('Hero layout', () => {
  it('should render a header element', () => {
    expect(componentSource).toContain('<header');
  });

  it('should have id="home" for navigation', () => {
    expect(componentSource).toContain('id="home"');
  });

  it('should use the dark background color', () => {
    expect(componentSource).toContain('bg-[#050816]');
  });

  it('should use flex-col-reverse for mobile-first layout', () => {
    expect(componentSource).toContain('flex-col-reverse');
  });

  it('should use lg:flex-row for desktop layout', () => {
    expect(componentSource).toContain('lg:flex-row');
  });
});
