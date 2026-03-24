import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import LineageMap from '../LineageMap';

const mockProps = {
  parentName: 'Autonomous Agent Orchestration Engine',
  childName: 'AIEcommerce Pipeline',
  traits: ['Stateful Graph Execution', 'Self-Healing Inventory', 'LLM Content Generation'],
  overrides: ['Autonomous PC Assembly Logic', 'Marketplace-Specific Enrichment'],
};

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

describe('LineageMap', () => {
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

  describe('full (desktop) mode', () => {
    it('should render navigation with aria-label', () => {
      render(<LineageMap {...mockProps} />);
      const nav = screen.getByRole('navigation', { name: 'Class lineage' });
      expect(nav).toBeTruthy();
    });

    it('should render parent name', () => {
      render(<LineageMap {...mockProps} />);
      expect(screen.getByText('Autonomous Agent Orchestration Engine')).toBeTruthy();
    });

    it('should render child name', () => {
      render(<LineageMap {...mockProps} />);
      expect(screen.getByText('AIEcommerce Pipeline')).toBeTruthy();
    });

    it('should render all trait labels', () => {
      render(<LineageMap {...mockProps} />);
      expect(screen.getByText('Stateful Graph Execution')).toBeTruthy();
      expect(screen.getByText('Self-Healing Inventory')).toBeTruthy();
      expect(screen.getByText('LLM Content Generation')).toBeTruthy();
    });

    it('should render all override labels', () => {
      render(<LineageMap {...mockProps} />);
      expect(screen.getByText('Autonomous PC Assembly Logic')).toBeTruthy();
      expect(screen.getByText('Marketplace-Specific Enrichment')).toBeTruthy();
    });

    it('should render "base" badge on parent node', () => {
      render(<LineageMap {...mockProps} />);
      expect(screen.getByText('base')).toBeTruthy();
    });

    it('should render "override" badges on override nodes', () => {
      render(<LineageMap {...mockProps} />);
      expect(screen.getAllByText('override').length).toBe(2);
    });

    it('should render ordered list with correct number of items', () => {
      const { container } = render(<LineageMap {...mockProps} />);
      const listItems = container.querySelectorAll('li');
      // parent + 3 traits + 2 overrides + child = 7
      expect(listItems.length).toBe(7);
    });
  });

  describe('compact (mobile) mode', () => {
    it('should render navigation with aria-label', () => {
      render(<LineageMap {...mockProps} compact />);
      const nav = screen.getByRole('navigation', { name: 'Class lineage' });
      expect(nav).toBeTruthy();
    });

    it('should render all node labels as compact pills', () => {
      render(<LineageMap {...mockProps} compact />);
      expect(screen.getByText('Autonomous Agent Orchestration Engine')).toBeTruthy();
      expect(screen.getByText('AIEcommerce Pipeline')).toBeTruthy();
      expect(screen.getByText('Stateful Graph Execution')).toBeTruthy();
    });

    it('should render arrow separators', () => {
      const { container } = render(<LineageMap {...mockProps} compact />);
      const arrows = container.querySelectorAll('[aria-hidden="true"]');
      // 6 arrows between 7 nodes
      expect(arrows.length).toBe(6);
    });
  });
});
