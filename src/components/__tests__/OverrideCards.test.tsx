import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import OverrideCards from '../OverrideCards';

const mockOverrides = [
  {
    label: 'Autonomous PC Assembly Logic',
    description:
      'Specialized bundle creation that validates hardware compatibility — CPU sockets, RAM types, power requirements.',
    proofMetric: 'Zero incompatible component bundles shipped',
  },
  {
    label: 'Marketplace-Specific Enrichment',
    description:
      'Tailored content pipeline for MercadoLibre-optimized listings with upscaled images.',
    proofMetric: '100% automation of listing creation',
  },
];

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(el: Element) {
    this.callback(
      [{ isIntersecting: true, target: el } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }

  unobserve() {}
  disconnect() {}
}

describe('OverrideCards', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(cleanup);

  it('should render group with label', () => {
    render(<OverrideCards overrides={mockOverrides} label="Overrides" />);
    const group = screen.getByRole('group', { name: 'Overrides' });
    expect(group).toBeTruthy();
  });

  it('should render section heading', () => {
    render(<OverrideCards overrides={mockOverrides} label="Overrides" />);
    expect(screen.getByText('Overrides')).toBeTruthy();
  });

  it('should render all override labels', () => {
    render(<OverrideCards overrides={mockOverrides} label="Overrides" />);
    expect(screen.getByText('Autonomous PC Assembly Logic')).toBeTruthy();
    expect(screen.getByText('Marketplace-Specific Enrichment')).toBeTruthy();
  });

  it('should render override buttons with aria-expanded="false"', () => {
    render(<OverrideCards overrides={mockOverrides} label="Overrides" />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2);
    buttons.forEach(btn => {
      expect(btn.getAttribute('aria-expanded')).toBe('false');
    });
  });

  it('should expand override on click to show description', () => {
    render(<OverrideCards overrides={mockOverrides} label="Overrides" />);
    const buttons = screen.getAllByRole('button');

    fireEvent.click(buttons[0]);
    expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
    expect(
      screen.getByText(/Specialized bundle creation that validates hardware compatibility/)
    ).toBeTruthy();
  });

  it('should show proof metric badge when override is expanded', () => {
    render(<OverrideCards overrides={mockOverrides} label="Overrides" />);
    const buttons = screen.getAllByRole('button');

    fireEvent.click(buttons[0]);
    expect(screen.getByText('Zero incompatible component bundles shipped')).toBeTruthy();
  });

  it('should collapse previous override when expanding another', () => {
    render(<OverrideCards overrides={mockOverrides} label="Overrides" />);
    const buttons = screen.getAllByRole('button');

    fireEvent.click(buttons[0]);
    expect(buttons[0].getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(buttons[1]);
    expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
    expect(buttons[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('should handle overrides without proof metric', () => {
    const noMetricOverrides = [
      {
        label: 'Custom Logic',
        description: 'A specialized override without metrics.',
      },
    ];
    render(<OverrideCards overrides={noMetricOverrides} label="Overrides" />);
    const buttons = screen.getAllByRole('button');

    fireEvent.click(buttons[0]);
    expect(screen.getByText('A specialized override without metrics.')).toBeTruthy();
  });
});
