import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ProjectCard from '../ProjectCard';
import type { WorkLogLabels } from '../WorkLog';
import type { ProjectEntry } from '../../utils/workLog';

const mockLabels: WorkLogLabels = {
  sectionTitle: '// work log',
  subtitle: "Projects I've built and the problems they solve.",
  featuredLabel: 'Featured',
  viewCaseStudy: 'View case study',
  role: 'Role',
  duration: 'Duration',
  techStack: 'Tech Stack',
};

const mockProject: ProjectEntry = {
  slug: 'test-project',
  title: 'Test Project',
  description: 'A test project description.',
  tags: ['React', 'TypeScript'],
  featured: false,
  metadata: {
    role: 'Lead Engineer',
    duration: '6 months',
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis'],
  },
};

const featuredProject: ProjectEntry = {
  ...mockProject,
  slug: 'featured-project',
  title: 'Featured Project',
  featured: true,
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

describe('ProjectCard', () => {
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

  it('should render the project title', () => {
    render(
      <ProjectCard
        project={mockProject}
        isFeatured={false}
        labels={mockLabels}
        lang="en"
        isVisible={true}
        reducedMotion={false}
        delay={0}
        entryIndex={0}
      />
    );
    expect(screen.getByText('Test Project')).toBeTruthy();
  });

  it('should render the project description', () => {
    render(
      <ProjectCard
        project={mockProject}
        isFeatured={false}
        labels={mockLabels}
        lang="en"
        isVisible={true}
        reducedMotion={false}
        delay={0}
        entryIndex={0}
      />
    );
    expect(screen.getByText('A test project description.')).toBeTruthy();
  });

  it('should render all tags', () => {
    render(
      <ProjectCard
        project={mockProject}
        isFeatured={false}
        labels={mockLabels}
        lang="en"
        isVisible={true}
        reducedMotion={false}
        delay={0}
        entryIndex={0}
      />
    );
    expect(screen.getByText('React')).toBeTruthy();
    expect(screen.getByText('TypeScript')).toBeTruthy();
  });

  it('should show featured label when isFeatured is true', () => {
    render(
      <ProjectCard
        project={featuredProject}
        isFeatured={true}
        labels={mockLabels}
        lang="en"
        isVisible={true}
        reducedMotion={false}
        delay={0}
        entryIndex={0}
      />
    );
    expect(screen.getByText('Featured')).toBeTruthy();
  });

  it('should not show featured label when isFeatured is false', () => {
    render(
      <ProjectCard
        project={mockProject}
        isFeatured={false}
        labels={mockLabels}
        lang="en"
        isVisible={true}
        reducedMotion={false}
        delay={0}
        entryIndex={0}
      />
    );
    expect(screen.queryByText('Featured')).toBeNull();
  });

  it('should render article with correct aria-label', () => {
    render(
      <ProjectCard
        project={mockProject}
        isFeatured={false}
        labels={mockLabels}
        lang="en"
        isVisible={true}
        reducedMotion={false}
        delay={0}
        entryIndex={0}
      />
    );
    expect(screen.getByRole('article', { name: 'Test Project' })).toBeTruthy();
  });

  it('should show metadata tray open by default for featured cards', () => {
    render(
      <ProjectCard
        project={featuredProject}
        isFeatured={true}
        labels={mockLabels}
        lang="en"
        isVisible={true}
        reducedMotion={true}
        delay={0}
        entryIndex={0}
      />
    );
    expect(screen.getByText('Lead Engineer')).toBeTruthy();
    expect(screen.getByText('6 months')).toBeTruthy();
  });

  it('should render case study link with correct href', () => {
    render(
      <ProjectCard
        project={featuredProject}
        isFeatured={true}
        labels={mockLabels}
        lang="en"
        isVisible={true}
        reducedMotion={true}
        delay={0}
        entryIndex={0}
      />
    );
    const link = screen.getByText('View case study').closest('a');
    expect(link?.getAttribute('href')).toBe('/en/projects/featured-project');
  });

  it('should render case study link with correct lang for Spanish', () => {
    render(
      <ProjectCard
        project={featuredProject}
        isFeatured={true}
        labels={mockLabels}
        lang="es"
        isVisible={true}
        reducedMotion={true}
        delay={0}
        entryIndex={0}
      />
    );
    const link = screen.getByText('View case study').closest('a');
    expect(link?.getAttribute('href')).toBe('/es/projects/featured-project');
  });

  it('should show first 4 tech stack items in metadata', () => {
    render(
      <ProjectCard
        project={featuredProject}
        isFeatured={true}
        labels={mockLabels}
        lang="en"
        isVisible={true}
        reducedMotion={true}
        delay={0}
        entryIndex={0}
      />
    );
    expect(screen.getByText('React, TypeScript, Node.js, PostgreSQL')).toBeTruthy();
  });

  it('should have expand/collapse button role for non-featured cards', () => {
    const { container } = render(
      <ProjectCard
        project={mockProject}
        isFeatured={false}
        labels={mockLabels}
        lang="en"
        isVisible={true}
        reducedMotion={true}
        delay={0}
        entryIndex={0}
      />
    );
    const expandButton = container.querySelector('[role="button"]');
    expect(expandButton).toBeTruthy();
    expect(expandButton?.getAttribute('aria-expanded')).toBeTruthy();
  });

  it('should toggle tray on keyboard Enter for non-featured cards', () => {
    const { container } = render(
      <ProjectCard
        project={mockProject}
        isFeatured={false}
        labels={mockLabels}
        lang="en"
        isVisible={true}
        reducedMotion={true}
        delay={0}
        entryIndex={0}
      />
    );
    const expandButton = container.querySelector('[role="button"]') as HTMLElement;
    fireEvent.keyDown(expandButton, { key: 'Enter' });
    // After Enter, tray should open and show metadata
    expect(screen.getByText('Lead Engineer')).toBeTruthy();
  });
});
