import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const componentSource = readFileSync(resolve(__dirname, '../HeroContent.astro'), 'utf-8');

describe('HeroContent template', () => {
  it('should render an h1 element', () => {
    expect(componentSource).toContain('<h1');
  });

  it('should use i18n for subtitle tag', () => {
    expect(componentSource).toContain("t('hero.subtitleTag')");
  });

  it('should use i18n for headline', () => {
    expect(componentSource).toContain("t('hero.headline')");
  });

  it('should use i18n for description', () => {
    expect(componentSource).toContain("t('hero.description')");
  });

  it('should use i18n for CTA buttons', () => {
    expect(componentSource).toContain("t('hero.ctaPrimary')");
    expect(componentSource).toContain("t('hero.ctaSecondary')");
  });
});

describe('HeroContent CTAs', () => {
  it('should link primary CTA to contact section', () => {
    expect(componentSource).toContain('href="#contact"');
  });

  it('should link secondary CTA to projects section', () => {
    expect(componentSource).toContain('href="#projects"');
  });
});

describe('HeroContent styling', () => {
  it('should use font-mono for the badge', () => {
    expect(componentSource).toMatch(/font-mono.*subtitleTag/s);
  });

  it('should use cyan accent for the primary CTA', () => {
    expect(componentSource).toContain('bg-[#22d3ee]');
  });

  it('should have stagger animation classes', () => {
    expect(componentSource).toContain('hero-stagger-1');
    expect(componentSource).toContain('hero-stagger-2');
    expect(componentSource).toContain('hero-stagger-3');
    expect(componentSource).toContain('hero-stagger-4');
  });
});

describe('HeroContent CSS', () => {
  it('should define fade-in-up keyframes', () => {
    expect(componentSource).toContain('@keyframes fade-in-up');
  });

  it('should respect prefers-reduced-motion', () => {
    expect(componentSource).toContain('prefers-reduced-motion: reduce');
    expect(componentSource).toMatch(/prefers-reduced-motion: reduce[\s\S]*?animation: none/);
  });
});
