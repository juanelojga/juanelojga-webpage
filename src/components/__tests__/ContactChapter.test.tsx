import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import ContactChapter, { type ContactLabels } from '../ContactChapter';

const mockLabels: ContactLabels = {
  sectionTitle: '// open channel',
  headline: "Let's build something.",
  description: 'Always open to interesting projects and collaborations.',
  emailCta: 'Copy email',
  emailToast: 'Email copied to clipboard',
  resumeLink: 'View resume',
  socialLabel: 'Find me elsewhere',
  ariaEmailCopied: 'Email address copied to clipboard',
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

describe('ContactChapter', () => {
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

    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render section with correct id and aria-labelledby', () => {
    const { container } = render(<ContactChapter labels={mockLabels} lang="en" />);
    const section = container.querySelector('section#contact');
    expect(section).toBeTruthy();
    expect(section?.getAttribute('aria-labelledby')).toBe('contact-headline');
  });

  it('should render section title', () => {
    render(<ContactChapter labels={mockLabels} lang="en" />);
    expect(screen.getByText('// open channel')).toBeTruthy();
  });

  it('should render h2 heading with correct id', () => {
    render(<ContactChapter labels={mockLabels} lang="en" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeTruthy();
    expect(heading.id).toBe('contact-headline');
    expect(heading.textContent).toBe("Let's build something.");
  });

  it('should render description text', () => {
    render(<ContactChapter labels={mockLabels} lang="en" />);
    expect(
      screen.getByText('Always open to interesting projects and collaborations.')
    ).toBeTruthy();
  });

  it('should render email CTA button with correct label', () => {
    render(<ContactChapter labels={mockLabels} lang="en" />);
    const button = screen.getByRole('button', { name: 'Copy email' });
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Copy email');
  });

  it('should display email address', () => {
    render(<ContactChapter labels={mockLabels} lang="en" />);
    expect(screen.getByText('juanelojga@gmail.com')).toBeTruthy();
  });

  it('should copy email to clipboard on button click', async () => {
    vi.useFakeTimers();
    render(<ContactChapter labels={mockLabels} lang="en" />);
    const button = screen.getByRole('button', { name: 'Copy email' });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('juanelojga@gmail.com');
    vi.useRealTimers();
  });

  it('should show toast after copying email', async () => {
    vi.useFakeTimers();
    render(<ContactChapter labels={mockLabels} lang="en" />);
    const button = screen.getByRole('button', { name: 'Copy email' });

    await act(async () => {
      fireEvent.click(button);
    });

    // Toast message should be visible
    expect(screen.getByText('Email address copied to clipboard')).toBeTruthy();

    // Button should show toast text
    expect(screen.getByText('Email copied to clipboard')).toBeTruthy();

    vi.useRealTimers();
  });

  it('should have ARIA live region for toast', () => {
    const { container } = render(<ContactChapter labels={mockLabels} lang="en" />);
    const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
    expect(liveRegion).toBeTruthy();
  });

  it('should auto-dismiss toast after 3 seconds', async () => {
    vi.useFakeTimers();
    render(<ContactChapter labels={mockLabels} lang="en" />);
    const button = screen.getByRole('button', { name: 'Copy email' });

    await act(async () => {
      fireEvent.click(button);
    });

    // Toast visible immediately after click
    expect(screen.getByText('Email address copied to clipboard')).toBeTruthy();

    // Advance past 3s timeout
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Toast should be dismissed
    expect(screen.queryByText('Email address copied to clipboard')).toBeNull();

    vi.useRealTimers();
  });

  it('should render social links with correct attributes', () => {
    render(<ContactChapter labels={mockLabels} lang="en" />);

    const linkedin = screen.getByLabelText('LinkedIn');
    expect(linkedin).toBeTruthy();
    expect(linkedin.getAttribute('href')).toBe(
      'https://www.linkedin.com/in/juan-almeida-03806367/'
    );
    expect(linkedin.getAttribute('target')).toBe('_blank');
    expect(linkedin.getAttribute('rel')).toBe('noopener noreferrer');

    const github = screen.getByLabelText('GitHub');
    expect(github).toBeTruthy();
    expect(github.getAttribute('href')).toBe('https://github.com/juanelojga');
  });

  it('should render resume link for English locale', () => {
    render(<ContactChapter labels={mockLabels} lang="en" />);
    const resumeLink = screen.getByText('View resume');
    expect(resumeLink).toBeTruthy();
    expect(resumeLink.closest('a')?.getAttribute('href')).toBe('/en/resume');
  });

  it('should render resume link for Spanish locale', () => {
    render(<ContactChapter labels={mockLabels} lang="es" />);
    const resumeLink = screen.getByText('View resume');
    expect(resumeLink.closest('a')?.getAttribute('href')).toBe('/es/resume');
  });

  it('should render social links navigation with aria-label', () => {
    render(<ContactChapter labels={mockLabels} lang="en" />);
    const nav = screen.getByRole('navigation', { name: 'Find me elsewhere' });
    expect(nav).toBeTruthy();
  });

  it('should render social label text', () => {
    render(<ContactChapter labels={mockLabels} lang="en" />);
    expect(screen.getByText('Find me elsewhere')).toBeTruthy();
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

    const { container } = render(<ContactChapter labels={mockLabels} lang="en" />);
    const contentDiv = container.querySelector('section > div');
    const style = contentDiv?.getAttribute('style') || '';
    expect(style).not.toContain('translateY');
  });

  it('should update button aria-label when copied', async () => {
    vi.useFakeTimers();
    render(<ContactChapter labels={mockLabels} lang="en" />);
    const button = screen.getByRole('button', { name: 'Copy email' });

    await act(async () => {
      fireEvent.click(button);
    });

    // After copy, button aria-label should update
    expect(screen.getByRole('button', { name: 'Email address copied to clipboard' })).toBeTruthy();

    vi.useRealTimers();
  });

  it('should have minimum touch target sizes', () => {
    const { container } = render(<ContactChapter labels={mockLabels} lang="en" />);
    const button = container.querySelector('button');
    expect(button?.classList.contains('min-h-[44px]')).toBe(true);
    expect(button?.classList.contains('min-w-[44px]')).toBe(true);
  });
});
