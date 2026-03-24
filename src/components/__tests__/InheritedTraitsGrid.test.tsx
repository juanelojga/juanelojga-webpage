import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import InheritedTraitsGrid from '../InheritedTraitsGrid';

const mockTraits = [
  {
    label: 'Stateful Graph Execution',
    evidence: 'LangGraph manages assembly tasks as a directed graph.',
    origin: 'Core orchestration pattern',
  },
  {
    label: 'Self-Healing Inventory',
    evidence: 'The graph automatically selects an alternative without human intervention.',
    origin: 'Resilience layer',
  },
  {
    label: 'LLM Content Generation',
    evidence: 'A Creative Director agent generates SEO-optimized titles.',
    origin: 'AI enrichment pipeline',
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

describe('InheritedTraitsGrid', () => {
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
    render(<InheritedTraitsGrid traits={mockTraits} label="Inherited Traits" />);
    const group = screen.getByRole('group', { name: 'Inherited Traits' });
    expect(group).toBeTruthy();
  });

  it('should render section heading', () => {
    render(<InheritedTraitsGrid traits={mockTraits} label="Inherited Traits" />);
    expect(screen.getByText('Inherited Traits')).toBeTruthy();
  });

  it('should render all trait labels', () => {
    render(<InheritedTraitsGrid traits={mockTraits} label="Inherited Traits" />);
    expect(screen.getByText('Stateful Graph Execution')).toBeTruthy();
    expect(screen.getByText('Self-Healing Inventory')).toBeTruthy();
    expect(screen.getByText('LLM Content Generation')).toBeTruthy();
  });

  it('should render origin badges', () => {
    render(<InheritedTraitsGrid traits={mockTraits} label="Inherited Traits" />);
    expect(screen.getByText('Core orchestration pattern')).toBeTruthy();
    expect(screen.getByText('Resilience layer')).toBeTruthy();
    expect(screen.getByText('AI enrichment pipeline')).toBeTruthy();
  });

  it('should render trait buttons with aria-expanded="false"', () => {
    render(<InheritedTraitsGrid traits={mockTraits} label="Inherited Traits" />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(3);
    buttons.forEach(btn => {
      expect(btn.getAttribute('aria-expanded')).toBe('false');
    });
  });

  it('should expand trait on click to show evidence', () => {
    render(<InheritedTraitsGrid traits={mockTraits} label="Inherited Traits" />);
    const buttons = screen.getAllByRole('button');

    fireEvent.click(buttons[0]);
    expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('LangGraph manages assembly tasks as a directed graph.')).toBeTruthy();
  });

  it('should collapse trait when clicking again', () => {
    render(<InheritedTraitsGrid traits={mockTraits} label="Inherited Traits" />);
    const buttons = screen.getAllByRole('button');

    fireEvent.click(buttons[0]);
    expect(buttons[0].getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(buttons[0]);
    expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
  });

  it('should collapse previous trait when expanding another', () => {
    render(<InheritedTraitsGrid traits={mockTraits} label="Inherited Traits" />);
    const buttons = screen.getAllByRole('button');

    fireEvent.click(buttons[0]);
    expect(buttons[0].getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(buttons[1]);
    expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
    expect(buttons[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('should dispatch trait hover event on mouseEnter', () => {
    const handler = vi.fn();
    window.addEventListener('inheritance:trait-hover', handler);

    render(<InheritedTraitsGrid traits={mockTraits} label="Inherited Traits" />);
    const buttons = screen.getAllByRole('button');

    fireEvent.mouseEnter(buttons[0]);
    expect(handler).toHaveBeenCalledTimes(1);
    expect((handler.mock.calls[0][0] as CustomEvent).detail.traitLabel).toBe(
      'Stateful Graph Execution'
    );

    window.removeEventListener('inheritance:trait-hover', handler);
  });

  it('should dispatch trait unhover event on mouseLeave', () => {
    const handler = vi.fn();
    window.addEventListener('inheritance:trait-unhover', handler);

    render(<InheritedTraitsGrid traits={mockTraits} label="Inherited Traits" />);
    const buttons = screen.getAllByRole('button');

    fireEvent.mouseLeave(buttons[0]);
    expect(handler).toHaveBeenCalledTimes(1);

    window.removeEventListener('inheritance:trait-unhover', handler);
  });

  it('should dispatch trait hover event on focus', () => {
    const handler = vi.fn();
    window.addEventListener('inheritance:trait-hover', handler);

    render(<InheritedTraitsGrid traits={mockTraits} label="Inherited Traits" />);
    const buttons = screen.getAllByRole('button');

    fireEvent.focus(buttons[1]);
    expect(handler).toHaveBeenCalledTimes(1);
    expect((handler.mock.calls[0][0] as CustomEvent).detail.traitLabel).toBe(
      'Self-Healing Inventory'
    );

    window.removeEventListener('inheritance:trait-hover', handler);
  });

  it('should dispatch trait unhover event on blur', () => {
    const handler = vi.fn();
    window.addEventListener('inheritance:trait-unhover', handler);

    render(<InheritedTraitsGrid traits={mockTraits} label="Inherited Traits" />);
    const buttons = screen.getAllByRole('button');

    fireEvent.blur(buttons[0]);
    expect(handler).toHaveBeenCalledTimes(1);

    window.removeEventListener('inheritance:trait-unhover', handler);
  });
});
