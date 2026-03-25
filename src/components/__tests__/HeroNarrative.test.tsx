import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import HeroNarrative, { type HeroNarrativeLabels } from '../HeroNarrative';

const mockLabels: HeroNarrativeLabels = {
  name: 'Juan Almeida',
  role: 'Full Stack & AI Engineer',
  headline: 'Hello World',
  translatorLine: 'I build AI systems, automations, and applications that ship.',
  primaryCta: 'Explore my work',
  secondaryCta: 'Get in touch',
};

const defaultProps = {
  labels: mockLabels,
  lang: 'en',
  buildPortraitSrc: '/test/hero-build.webp',
  afterHoursPortraitSrc: '/test/hero-after-hours.webp',
};

describe('HeroNarrative', () => {
  beforeEach(() => {
    // Default: no reduced motion
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

  it('should render the headline', () => {
    render(<HeroNarrative {...defaultProps} />);
    // Animation splits headline into character spans; match via accessible name (aria-label)
    expect(screen.getByRole('heading', { name: 'Hello World' })).toBeTruthy();
  });

  it('should render name and role meta', () => {
    render(<HeroNarrative {...defaultProps} />);
    expect(screen.getByText('Juan Almeida')).toBeTruthy();
    expect(screen.getByText('Full Stack & AI Engineer')).toBeTruthy();
  });

  it('should render the translator line', () => {
    render(<HeroNarrative {...defaultProps} />);
    expect(
      screen.getByText('I build AI systems, automations, and applications that ship.')
    ).toBeTruthy();
  });

  it('should render primary and secondary CTAs', () => {
    // CTAs require reduced motion or a timer to become visible
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
    render(<HeroNarrative {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Explore my work' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Get in touch' })).toBeTruthy();
  });

  it('should have an h1 heading for the headline', () => {
    render(<HeroNarrative {...defaultProps} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeTruthy();
    expect(heading.id).toBe('hero-headline');
  });

  it('should render a section with aria-labelledby linking to headline', () => {
    const { container } = render(<HeroNarrative {...defaultProps} />);
    const section = container.querySelector('section#home');
    expect(section).toBeTruthy();
    expect(section?.getAttribute('aria-labelledby')).toBe('hero-headline');
  });

  it('should render portrait placeholder with role="img" and aria-label', () => {
    render(<HeroNarrative {...defaultProps} />);
    const portrait = screen.getByRole('img', { name: 'Juan Almeida portrait' });
    expect(portrait).toBeTruthy();
    expect(portrait.getAttribute('data-portrait-slot')).not.toBeNull();
  });

  it('should scroll to target section when primary CTA is clicked', () => {
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
    const mockScrollIntoView = vi.fn();
    const projectsSection = document.createElement('section');
    projectsSection.id = 'projects';
    projectsSection.scrollIntoView = mockScrollIntoView;
    document.body.appendChild(projectsSection);

    render(<HeroNarrative {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Explore my work' }));
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.body.removeChild(projectsSection);
  });

  it('should scroll to contact section when secondary CTA is clicked', () => {
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
    const mockScrollIntoView = vi.fn();
    const contactSection = document.createElement('section');
    contactSection.id = 'contact';
    contactSection.scrollIntoView = mockScrollIntoView;
    document.body.appendChild(contactSection);

    render(<HeroNarrative {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Get in touch' }));
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.body.removeChild(contactSection);
  });

  it('should dispatch hero:boot-complete event when reduced motion is preferred', () => {
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

    const eventSpy = vi.fn();
    window.addEventListener('hero:boot-complete', eventSpy);

    render(<HeroNarrative {...defaultProps} />);
    expect(eventSpy).toHaveBeenCalled();

    window.removeEventListener('hero:boot-complete', eventSpy);
  });

  it('should dispatch hero:boot-complete event after animation completes', async () => {
    vi.useFakeTimers();

    const eventSpy = vi.fn();
    window.addEventListener('hero:boot-complete', eventSpy);

    render(<HeroNarrative {...defaultProps} />);

    // Event should not have fired yet (animation takes time)
    expect(eventSpy).not.toHaveBeenCalled();

    // Advance timers past the full animation duration
    vi.advanceTimersByTime(5000);
    expect(eventSpy).toHaveBeenCalled();

    window.removeEventListener('hero:boot-complete', eventSpy);
    vi.useRealTimers();
  });
});
