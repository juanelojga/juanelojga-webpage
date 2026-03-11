import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const componentSource = readFileSync(resolve(__dirname, '../HeroImageCollage.astro'), 'utf-8');

describe('HeroImageCollage template', () => {
  it('should render 3 Image components', () => {
    const imageMatches = componentSource.match(/<Image/g);
    expect(imageMatches).toHaveLength(3);
  });

  it('should use eager loading for all images', () => {
    const eagerMatches = componentSource.match(/loading="eager"/g);
    expect(eagerMatches).toHaveLength(3);
  });

  it('should have alt text with "Juan Almeida"', () => {
    const altMatches = componentSource.match(/alt="Portrait of Juan Almeida"/g);
    expect(altMatches).toHaveLength(3);
  });
});

describe('HeroImageCollage layout', () => {
  it('should use a 3-column grid with custom ratios', () => {
    expect(componentSource).toContain('grid-cols-[2fr_3fr_2fr]');
  });

  it('should have a fixed height', () => {
    expect(componentSource).toContain('h-[380px]');
  });
});

describe('HeroImageCollage hover effects', () => {
  it('should remove grayscale on hover', () => {
    expect(componentSource).toContain('hover:grayscale-0');
  });

  it('should scale up on hover', () => {
    expect(componentSource).toContain('hover:scale-[1.03]');
  });
});

describe('HeroImageCollage glow effect', () => {
  it('should have a gradient glow background', () => {
    expect(componentSource).toContain('bg-gradient-to-br');
  });

  it('should use blur for the glow', () => {
    expect(componentSource).toContain('blur-2xl');
  });
});

describe('HeroImageCollage CSS', () => {
  it('should define fade-in-scale keyframes', () => {
    expect(componentSource).toContain('@keyframes fade-in-scale');
  });

  it('should have hero-stagger-image animation class', () => {
    expect(componentSource).toContain('hero-stagger-image');
  });

  it('should respect prefers-reduced-motion', () => {
    expect(componentSource).toContain('prefers-reduced-motion: reduce');
    expect(componentSource).toMatch(/prefers-reduced-motion: reduce[\s\S]*?animation: none/);
  });
});
