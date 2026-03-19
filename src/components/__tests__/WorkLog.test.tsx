import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import WorkLog, { type WorkLogLabels } from '../WorkLog';

const mockLabels: WorkLogLabels = {
  sectionTitle: '// work log',
  subtitle: "Projects I've built and the problems they solve.",
  featuredLabel: 'Featured',
  viewCaseStudy: 'View case study',
  role: 'Role',
  duration: 'Duration',
  techStack: 'Tech Stack',
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
    this.callback(
      [{ isIntersecting: true, target: el } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }

  unobserve() {}
  disconnect() {}
}

describe('WorkLog', () => {
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
    const { container } = render(<WorkLog labels={mockLabels} lang="en" />);
    const section = container.querySelector('section#projects');
    expect(section).toBeTruthy();
    expect(section?.getAttribute('aria-labelledby')).toBe('projects-headline');
  });

  it('should render section title and subtitle', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    expect(screen.getByText('// work log')).toBeTruthy();
    expect(screen.getByText("Projects I've built and the problems they solve.")).toBeTruthy();
  });

  it('should render h2 heading with correct id', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeTruthy();
    expect(heading.id).toBe('projects-headline');
  });

  it('should render case study projects', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    // 3 case study projects should render
    expect(
      screen.getByText('AIEcommerce - Autonomous PC Assembly & Marketplace Pipeline')
    ).toBeTruthy();
    expect(screen.getByText('Narbox - Package Consolidation & Global Logistics')).toBeTruthy();
    expect(screen.getByText('PBXAI - Real-time Voice AI Orchestration Engine')).toBeTruthy();
  });

  it('should render featured label on featured projects', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    expect(screen.getAllByText('Featured').length).toBe(3);
  });

  it('should render project descriptions', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    expect(screen.getByText(/Architected a distributed system using LangGraph/)).toBeTruthy();
  });

  it('should render project tags', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    expect(screen.getAllByText('Python').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Django').length).toBeGreaterThanOrEqual(1);
  });

  it('should render project articles with aria-label', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    const articles = screen.getAllByRole('article');
    expect(articles.length).toBe(3);
    const labels = articles.map(a => a.getAttribute('aria-label'));
    expect(labels).toContain('AIEcommerce - Autonomous PC Assembly & Marketplace Pipeline');
    expect(labels).toContain('Narbox - Package Consolidation & Global Logistics');
    expect(labels).toContain('PBXAI - Real-time Voice AI Orchestration Engine');
  });

  it('should have case study links with correct hrefs', () => {
    const { container } = render(<WorkLog labels={mockLabels} lang="en" />);
    // Only the featured project's tray is open by default; non-featured trays are collapsed
    const caseStudyLinks = container.querySelectorAll('a[href*="/projects/"]');
    const hrefs = Array.from(caseStudyLinks).map(a => a.getAttribute('href'));
    expect(hrefs).toContain('/en/projects/aiecommerce-agent-pipeline');
  });

  it('should render case study links for Spanish locale', () => {
    const { container } = render(<WorkLog labels={mockLabels} lang="es" />);
    const caseStudyLinks = container.querySelectorAll('a[href*="/projects/"]');
    const hrefs = Array.from(caseStudyLinks).map(a => a.getAttribute('href'));
    expect(hrefs).toContain('/es/projects/aiecommerce-agent-pipeline');
  });

  it('should render "View case study" text on links', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    const links = screen.getAllByText('View case study');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it('should show featured project metadata tray expanded by default', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    // Featured project's tray should not be aria-hidden
    const featuredArticle = screen.getByLabelText(
      'AIEcommerce - Autonomous PC Assembly & Marketplace Pipeline'
    );
    const tray = featuredArticle.querySelector('[id^="card-tray-"]');
    expect(tray?.getAttribute('aria-hidden')).toBe('false');
  });

  it('should show metadata labels (Role, Duration, Tech Stack)', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    // Featured project has metadata visible by default
    expect(screen.getAllByText('Role').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Duration').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Tech Stack').length).toBeGreaterThanOrEqual(1);
  });

  it('should show metadata values for featured project', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    expect(screen.getAllByText('Lead Software Architect').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('6+ Months').length).toBeGreaterThanOrEqual(1);
  });

  it('should not apply transform when reduced motion is preferred', () => {
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

    const { container } = render(<WorkLog labels={mockLabels} lang="en" />);
    // With reduced motion, articles should not have translateY transform
    const articles = container.querySelectorAll('article');
    articles.forEach(article => {
      const style = article.getAttribute('style') || '';
      expect(style).not.toContain('translateY');
    });
  });
});
