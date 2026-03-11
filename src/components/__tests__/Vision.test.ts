import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import en from '../../i18n/en.json';
import es from '../../i18n/es.json';

const componentSource = readFileSync(resolve(__dirname, '../Vision.astro'), 'utf-8');

const enCards = en.vision.cards;
const esCards = es.vision.cards;

describe('Vision i18n keys', () => {
  it('should have vision.eyebrow in both locales', () => {
    expect(en.vision.eyebrow).toBeTruthy();
    expect(es.vision.eyebrow).toBeTruthy();
  });

  it('should have vision.title in both locales', () => {
    expect(en.vision.title).toBeTruthy();
    expect(es.vision.title).toBeTruthy();
  });

  it('should have vision.cards array in both locales', () => {
    expect(Array.isArray(en.vision.cards)).toBe(true);
    expect(Array.isArray(es.vision.cards)).toBe(true);
  });

  it('should have the same number of cards in both locales', () => {
    expect(enCards.length).toBe(esCards.length);
  });

  it('should share identical labels and icons across locales', () => {
    enCards.forEach((card, i) => {
      expect(card.label).toBe(esCards[i].label);
      expect(card.icon).toBe(esCards[i].icon);
    });
  });
});

describe('Vision content structure', () => {
  it('should have exactly 3 cards', () => {
    expect(enCards).toHaveLength(3);
  });

  it('should have required fields on each card', () => {
    for (const card of enCards) {
      expect(card).toHaveProperty('label');
      expect(card).toHaveProperty('icon');
      expect(card).toHaveProperty('title');
      expect(card).toHaveProperty('description');
      expect(card.label).toBeTruthy();
      expect(card.icon).toBeTruthy();
      expect(card.title).toBeTruthy();
      expect(card.description).toBeTruthy();
    }
  });

  it('should have sequential numeric labels (01, 02, 03)', () => {
    const labels = enCards.map(c => c.label);
    expect(labels).toEqual(['01', '02', '03']);
  });

  it('should use valid Material Symbols icon names', () => {
    const validIcons = ['visibility', 'trending_up', 'rocket_launch'];
    for (const card of enCards) {
      expect(validIcons).toContain(card.icon);
    }
  });

  it('should have unique icons across all cards', () => {
    const icons = enCards.map(c => c.icon);
    expect(new Set(icons).size).toBe(icons.length);
  });

  it('should have unique titles across all cards', () => {
    const titles = enCards.map(c => c.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe('Vision template contract', () => {
  it('should have a section with id="vision"', () => {
    expect(componentSource).toContain('id="vision"');
  });

  it('should include fade-section class for scroll-snap activation', () => {
    expect(componentSource).toContain('fade-section');
  });

  it('should use a top-to-bottom gradient background', () => {
    expect(componentSource).toContain('bg-gradient-to-b');
    expect(componentSource).toContain('from-black');
    expect(componentSource).toContain('to-slate-800');
  });

  it('should have a dot-grid overlay using radial-gradient', () => {
    expect(componentSource).toContain('radial-gradient(circle');
    expect(componentSource).toContain('pointer-events-none absolute inset-0');
  });

  it('should render the eyebrow label via i18n key', () => {
    expect(componentSource).toContain("t('vision.eyebrow')");
  });

  it('should render the section heading via i18n key', () => {
    expect(componentSource).toContain("t('vision.title')");
  });

  it('should render the card label with font-mono styling', () => {
    expect(componentSource).toContain('{card.label}');
    expect(componentSource).toMatch(/font-mono[\s\S]*?card\.label/);
  });

  it('should use material-symbols-outlined for card icons', () => {
    expect(componentSource).toContain('material-symbols-outlined');
    expect(componentSource).toContain('{card.icon}');
  });

  it('should render card title in an h3 element', () => {
    expect(componentSource).toMatch(/<h3[\s\S]*?{card\.title}[\s\S]*?<\/h3>/);
  });

  it('should render card description in a paragraph', () => {
    expect(componentSource).toContain('{card.description}');
    expect(componentSource).toMatch(/<p[\s\S]*?card\.description/);
  });

  it('should pass stagger index via CSS custom property --i', () => {
    expect(componentSource).toContain('--i:');
  });

  it('should have a vertical accent bar on the left of each row', () => {
    expect(componentSource).toContain('w-0.5 bg-primary');
    expect(componentSource).toContain('group-hover:h-full');
  });

  it('should have hover effect on the icon container', () => {
    expect(componentSource).toContain('group-hover:bg-primary/20');
  });

  it('should have hover color transition on the label number', () => {
    expect(componentSource).toContain('group-hover:text-primary/40');
  });

  it('should use a horizontal divider between rows', () => {
    expect(componentSource).toContain('divide-y divide-slate-800');
  });

  it('should switch to horizontal layout on md breakpoint', () => {
    expect(componentSource).toContain('md:flex-row');
    expect(componentSource).toContain('md:items-center');
  });
});

describe('Vision animations and reduced motion', () => {
  it('should define .vision-row with initial hidden state', () => {
    expect(componentSource).toContain('.vision-row');
    expect(componentSource).toMatch(/\.vision-row\s*\{[\s\S]*?opacity: 0/);
  });

  it('should define .vision-row.visible with animated state', () => {
    expect(componentSource).toContain('.vision-row.visible');
    expect(componentSource).toMatch(/\.vision-row\.visible\s*\{[\s\S]*?opacity: 1/);
  });

  it('should use staggered transition delay via --i variable', () => {
    expect(componentSource).toContain('var(--i)');
    expect(componentSource).toContain('calc(var(--i)');
  });

  it('should respect prefers-reduced-motion', () => {
    expect(componentSource).toContain('prefers-reduced-motion: reduce');
    expect(componentSource).toMatch(/prefers-reduced-motion: reduce[\s\S]*?opacity: 1/);
    expect(componentSource).toMatch(/prefers-reduced-motion: reduce[\s\S]*?transform: none/);
  });

  it('should use IntersectionObserver to trigger animations', () => {
    expect(componentSource).toContain('IntersectionObserver');
    expect(componentSource).toContain("classList.add('visible')");
    expect(componentSource).toContain("querySelectorAll('.vision-row')");
  });
});
