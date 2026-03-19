import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WorkLog, { type WorkLogLabels } from '../WorkLog';

const mockLabels: WorkLogLabels = {
  sectionTitle: '// work log',
  subtitle: "Projects and milestones — what I've built and where.",
  featuredLabel: 'Featured',
  viewCaseStudy: 'View case study',
  role: 'Role',
  duration: 'Duration',
  techStack: 'Tech Stack',
  milestone: 'Milestone',
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
    expect(screen.getByText("Projects and milestones — what I've built and where.")).toBeTruthy();
  });

  it('should render h2 heading with correct id', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeTruthy();
    expect(heading.id).toBe('projects-headline');
  });

  it('should render case study projects (excludes projects without metadata)', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    // 3 case study projects should render
    expect(screen.getByText('Upwork - Search & Jobs Section')).toBeTruthy();
    expect(screen.getByText('Narbox')).toBeTruthy();
    expect(screen.getByText('Personal Page')).toBeTruthy();
    // JuaneloJGAC Tech should NOT be rendered (no metadata)
    expect(screen.queryByText('JuaneloJGAC Tech LLC')).toBeNull();
  });

  it('should render featured label on the featured project', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    expect(screen.getByText('Featured')).toBeTruthy();
  });

  it('should render project descriptions', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    expect(screen.getByText(/Led Vue\.js and TypeScript development for Upwork/)).toBeTruthy();
  });

  it('should render project tags', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    expect(screen.getAllByText('Vue').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('TypeScript').length).toBeGreaterThanOrEqual(1);
  });

  it('should render milestone markers', () => {
    const { container } = render(<WorkLog labels={mockLabels} lang="en" />);
    const separators = container.querySelectorAll('[role="separator"]');
    expect(separators.length).toBeGreaterThanOrEqual(1);
  });

  it('should render milestone marker with role and company text', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    // Milestones from experience.json
    expect(screen.getAllByText(/Full-Stack Lead & Co-Founder/).length).toBeGreaterThanOrEqual(1);
  });

  it('should render project articles with aria-label', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    const articles = screen.getAllByRole('article');
    expect(articles.length).toBe(3);
    const labels = articles.map(a => a.getAttribute('aria-label'));
    expect(labels).toContain('Upwork - Search & Jobs Section');
    expect(labels).toContain('Narbox');
    expect(labels).toContain('Personal Page');
  });

  it('should have case study links with correct hrefs', () => {
    const { container } = render(<WorkLog labels={mockLabels} lang="en" />);
    // Only the featured project's tray is open by default; non-featured trays are collapsed
    const caseStudyLinks = container.querySelectorAll('a[href*="/projects/"]');
    const hrefs = Array.from(caseStudyLinks).map(a => a.getAttribute('href'));
    expect(hrefs).toContain('/en/projects/upwork-search-jobs');
  });

  it('should render case study links for Spanish locale', () => {
    const { container } = render(<WorkLog labels={mockLabels} lang="es" />);
    const caseStudyLinks = container.querySelectorAll('a[href*="/projects/"]');
    const hrefs = Array.from(caseStudyLinks).map(a => a.getAttribute('href'));
    expect(hrefs).toContain('/es/projects/upwork-search-jobs');
  });

  it('should render "View case study" text on links', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    const links = screen.getAllByText('View case study');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it('should show featured project metadata tray expanded by default', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    // Featured project's tray should not be aria-hidden
    const featuredArticle = screen.getByLabelText('Upwork - Search & Jobs Section');
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
    expect(screen.getAllByText('Senior Frontend Engineer').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('2+ Years').length).toBeGreaterThanOrEqual(1);
  });

  it('should toggle non-featured card tray on click', () => {
    render(<WorkLog labels={mockLabels} lang="en" />);
    // Find a non-featured card's toggle button
    const narboxArticle = screen.getByLabelText('Narbox');
    const toggleBtn = narboxArticle.querySelector('[role="button"]');
    expect(toggleBtn).toBeTruthy();

    // Initially collapsed
    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('false');

    // Click to expand
    fireEvent.click(toggleBtn!);
    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('true');

    // Click to collapse
    fireEvent.click(toggleBtn!);
    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('false');
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
