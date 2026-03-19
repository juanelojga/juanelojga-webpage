import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import SkillMatrix, { type SkillMatrixLabels } from '../SkillMatrix';

const mockLabels: SkillMatrixLabels = {
  sectionTitle: '// toolkit',
  subtitle: 'The stack I reach for — grouped by what it does.',
  categories: {
    build: 'Build',
    scale: 'Scale',
    ai: 'AI',
    ship: 'Ship',
  },
  proofPoints: {
    build: 'Shipped reactive interfaces and SSR apps.',
    scale: 'Designed backend systems handling 10M+ records.',
    ai: 'Built production ML workflows and RAG pipelines.',
    ship: 'Containerized deployments and automated CI/CD.',
  },
  expandLabel: 'Show skills',
  collapseLabel: 'Hide skills',
};

// Mock IntersectionObserver
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  elements: Element[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(el: Element) {
    this.elements.push(el);
    // Immediately trigger as visible for tests
    this.callback(
      [{ isIntersecting: true, target: el } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }

  unobserve() {}
  disconnect() {}
}

describe('SkillMatrix', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(cleanup);

  it('should render section with correct id and aria-labelledby', () => {
    const { container } = render(<SkillMatrix labels={mockLabels} lang="en" />);
    const section = container.querySelector('section#skills');
    expect(section).toBeTruthy();
    expect(section?.getAttribute('aria-labelledby')).toBe('skills-headline');
  });

  it('should render section title and subtitle', () => {
    render(<SkillMatrix labels={mockLabels} lang="en" />);
    expect(screen.getByText('// toolkit')).toBeTruthy();
    expect(screen.getByText('The stack I reach for — grouped by what it does.')).toBeTruthy();
  });

  it('should render h2 heading with correct id', () => {
    render(<SkillMatrix labels={mockLabels} lang="en" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeTruthy();
    expect(heading.id).toBe('skills-headline');
  });

  it('should render all 4 cluster categories on desktop', () => {
    render(<SkillMatrix labels={mockLabels} lang="en" />);
    // Each category label appears in both desktop and mobile layouts
    expect(screen.getAllByText('Build').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Scale').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('AI').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Ship').length).toBeGreaterThanOrEqual(1);
  });

  it('should render skill chips', () => {
    render(<SkillMatrix labels={mockLabels} lang="en" />);
    // Skills from clusters should be present (visible in desktop grid and/or mobile)
    expect(screen.getAllByText('React').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('TypeScript').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Python').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('AWS').length).toBeGreaterThanOrEqual(1);
  });

  it('should render desktop cluster cards with group role', () => {
    const { container } = render(<SkillMatrix labels={mockLabels} lang="en" />);
    const groups = container.querySelectorAll('[role="group"]');
    expect(groups.length).toBe(4);
  });

  it('should have aria-label on desktop cluster groups', () => {
    const { container } = render(<SkillMatrix labels={mockLabels} lang="en" />);
    const groups = container.querySelectorAll('[role="group"]');
    const labels = Array.from(groups).map(g => g.getAttribute('aria-label'));
    expect(labels).toContain('Build');
    expect(labels).toContain('Scale');
    expect(labels).toContain('AI');
    expect(labels).toContain('Ship');
  });

  it('should render mobile accordion buttons with aria-expanded', () => {
    render(<SkillMatrix labels={mockLabels} lang="en" />);
    const expandButtons = screen.getAllByRole('button');
    // Mobile accordion buttons have aria-expanded
    const accordionButtons = expandButtons.filter(
      btn => btn.getAttribute('aria-expanded') !== null
    );
    expect(accordionButtons.length).toBe(4);
    // All start collapsed
    accordionButtons.forEach(btn => {
      expect(btn.getAttribute('aria-expanded')).toBe('false');
    });
  });

  it('should expand mobile accordion on click', () => {
    render(<SkillMatrix labels={mockLabels} lang="en" />);
    const accordionButtons = screen
      .getAllByRole('button')
      .filter(btn => btn.getAttribute('aria-expanded') !== null);

    // Click first accordion (Build)
    fireEvent.click(accordionButtons[0]);
    expect(accordionButtons[0].getAttribute('aria-expanded')).toBe('true');

    // Proof point should be visible in the expanded mobile panel
    const proofPoints = screen.getAllByText('Shipped reactive interfaces and SSR apps.');
    expect(proofPoints.length).toBeGreaterThanOrEqual(1);
  });

  it('should collapse mobile accordion when clicking the same category again', () => {
    render(<SkillMatrix labels={mockLabels} lang="en" />);
    const accordionButtons = screen
      .getAllByRole('button')
      .filter(btn => btn.getAttribute('aria-expanded') !== null);

    // Expand then collapse
    fireEvent.click(accordionButtons[0]);
    expect(accordionButtons[0].getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(accordionButtons[0]);
    expect(accordionButtons[0].getAttribute('aria-expanded')).toBe('false');
  });

  it('should show only one expanded cluster at a time on mobile', () => {
    render(<SkillMatrix labels={mockLabels} lang="en" />);
    const accordionButtons = screen
      .getAllByRole('button')
      .filter(btn => btn.getAttribute('aria-expanded') !== null);

    // Expand Build
    fireEvent.click(accordionButtons[0]);
    expect(accordionButtons[0].getAttribute('aria-expanded')).toBe('true');

    // Expand Scale — Build should collapse
    fireEvent.click(accordionButtons[1]);
    expect(accordionButtons[0].getAttribute('aria-expanded')).toBe('false');
    expect(accordionButtons[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('should show skill count on mobile accordion buttons', () => {
    render(<SkillMatrix labels={mockLabels} lang="en" />);
    // Build has 8 skills, Scale has 7, AI has 6, Ship has 6
    expect(screen.getByText('8')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
  });

  it('should not apply animation classes when reduced motion is preferred', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { container } = render(<SkillMatrix labels={mockLabels} lang="en" />);
    const section = container.querySelector('section#skills');
    // With reduced motion, section should exist and not have translateY in inline style
    expect(section).toBeTruthy();
    const style = section?.getAttribute('style') || '';
    expect(style).not.toContain('translateY');
  });
});
