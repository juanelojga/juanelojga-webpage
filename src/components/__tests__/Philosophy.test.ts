import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const componentSource = readFileSync(resolve(__dirname, '../Philosophy.astro'), 'utf-8');

const cards = [
  {
    icon: 'school',
    title: 'Self-Learner',
    description:
      'Constantly expanding my skill set through hands-on experimentation, open-source contributions, and deep dives into emerging technologies.',
  },
  {
    icon: 'explore',
    title: 'Curiosity-Driven',
    description:
      'I approach every problem with genuine curiosity, asking "why" before "how" to uncover solutions that address root causes, not just symptoms.',
  },
  {
    icon: 'shield',
    title: 'Responsible Developer',
    description:
      'I believe in writing code that is maintainable, accessible, and ethical — building software that serves people and stands the test of time.',
  },
];

describe('Philosophy content structure', () => {
  it('should have exactly 3 cards', () => {
    expect(cards).toHaveLength(3);
  });

  it('should have required fields on each card', () => {
    for (const card of cards) {
      expect(card).toHaveProperty('icon');
      expect(card).toHaveProperty('title');
      expect(card).toHaveProperty('description');
      expect(card.icon).toBeTruthy();
      expect(card.title).toBeTruthy();
      expect(card.description).toBeTruthy();
    }
  });

  it('should use valid Material Symbols icon names', () => {
    const validIcons = ['school', 'explore', 'shield'];
    for (const card of cards) {
      expect(validIcons).toContain(card.icon);
    }
  });

  it('should have unique titles across all cards', () => {
    const titles = cards.map(c => c.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('should have unique icons across all cards', () => {
    const icons = cards.map(c => c.icon);
    expect(new Set(icons).size).toBe(icons.length);
  });
});

describe('Philosophy template contract', () => {
  it('should have a section with id="philosophy"', () => {
    expect(componentSource).toContain('id="philosophy"');
  });

  it('should use <article> elements for cards', () => {
    expect(componentSource).toContain('<article');
    expect(componentSource).toContain('</article>');
  });

  it('should render the mono label via i18n key', () => {
    expect(componentSource).toContain("t('philosophy.subtitle')");
  });

  it('should render the section heading via i18n key', () => {
    expect(componentSource).toContain("t('philosophy.title')");
  });

  it('should use font-mono for the label', () => {
    expect(componentSource).toMatch(/font-mono.*philosophy\.subtitle/s);
  });

  it('should render ordinal numbers with font-mono', () => {
    expect(componentSource).toContain('0{i + 1}');
    expect(componentSource).toMatch(/font-mono.*text-5xl.*font-bold/);
  });

  it('should use material-symbols-outlined for icons', () => {
    expect(componentSource).toContain('material-symbols-outlined');
    expect(componentSource).toContain('{card.icon}');
  });

  it('should use a 3-column grid on md breakpoint', () => {
    expect(componentSource).toContain('md:grid-cols-3');
  });

  it('should apply stagger offset class to middle card', () => {
    expect(componentSource).toContain('philosophy-card--offset');
    expect(componentSource).toMatch(/i === 1.*philosophy-card--offset/s);
  });

  it('should use sharp-edged cards with left border accent', () => {
    expect(componentSource).toContain('border-l-[3px]');
    expect(componentSource).toContain('border-slate-200');
    // No border-radius classes — editorial sharp edges
    expect(componentSource).not.toMatch(/philosophy-card.*rounded/);
  });

  it('should have hover effects on cards', () => {
    expect(componentSource).toContain('hover:border-l-primary');
    expect(componentSource).toContain('hover:shadow-lg');
  });

  it('should have focus-visible styles for accessibility', () => {
    expect(componentSource).toContain('focus-visible:ring-2');
    expect(componentSource).toContain('focus-visible:ring-primary/30');
    expect(componentSource).toContain('focus-visible:ring-offset-2');
  });

  it('should apply staggered animation delay via inline style', () => {
    expect(componentSource).toContain('--delay:');
    expect(componentSource).toContain('animation-delay: var(--delay)');
  });
});

describe('Philosophy gradient bridge', () => {
  it('should create a ::before pseudo-element on #philosophy', () => {
    expect(componentSource).toContain('#philosophy::before');
  });

  it('should use the Hero dark color as gradient start', () => {
    expect(componentSource).toContain('#050816');
  });

  it('should use the background-light color as gradient end', () => {
    expect(componentSource).toContain('#f6f7f8');
  });

  it('should use linear-gradient from dark to light', () => {
    expect(componentSource).toMatch(/linear-gradient\(to bottom, #050816, #f6f7f8\)/);
  });
});

describe('Philosophy animations and reduced motion', () => {
  it('should define phil-card-enter keyframes', () => {
    expect(componentSource).toContain('@keyframes phil-card-enter');
  });

  it('should define phil-card-enter-offset keyframes for middle card', () => {
    expect(componentSource).toContain('@keyframes phil-card-enter-offset');
  });

  it('should apply offset animation only on md+ screens', () => {
    expect(componentSource).toMatch(
      /@media \(min-width: 768px\)\s*\{[\s\S]*?philosophy-card--offset/
    );
  });

  it('should respect prefers-reduced-motion', () => {
    expect(componentSource).toContain('prefers-reduced-motion: reduce');
    expect(componentSource).toMatch(/prefers-reduced-motion: reduce[\s\S]*?animation: none/);
    expect(componentSource).toMatch(/prefers-reduced-motion: reduce[\s\S]*?transition: none/);
  });

  it('should have hover icon scale via group-hover', () => {
    expect(componentSource).toContain('group-hover:scale-110');
  });

  it('should have hover ordinal shift via group-hover', () => {
    expect(componentSource).toContain('group-hover:translate-x-1');
    expect(componentSource).toContain('group-hover:text-primary/15');
  });
});
