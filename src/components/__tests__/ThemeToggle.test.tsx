import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ThemeToggle, { type ThemeToggleLabels } from '../ThemeToggle';

const mockLabels: ThemeToggleLabels = {
  label: 'Switch theme',
  buildMode: 'Build Mode',
  afterHours: 'After Hours',
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Default to build theme
    document.documentElement.setAttribute('data-theme', 'build');
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render a switch with accessible label', () => {
    render(<ThemeToggle labels={mockLabels} />);
    const toggle = screen.getByRole('switch', { name: 'Switch theme' });
    expect(toggle).toBeTruthy();
  });

  it('should show "Build Mode" label when in light theme', () => {
    render(<ThemeToggle labels={mockLabels} />);
    expect(screen.getByText('Build Mode')).toBeTruthy();
  });

  it('should have aria-checked="false" when in build mode', () => {
    render(<ThemeToggle labels={mockLabels} />);
    const toggle = screen.getByRole('switch');
    expect(toggle.getAttribute('aria-checked')).toBe('false');
  });

  it('should toggle theme on click', () => {
    render(<ThemeToggle labels={mockLabels} />);
    const toggle = screen.getByRole('switch');

    fireEvent.click(toggle);

    expect(document.documentElement.getAttribute('data-theme')).toBe('after-hours');
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(screen.getByText('After Hours')).toBeTruthy();
  });

  it('should toggle back to build mode on second click', () => {
    render(<ThemeToggle labels={mockLabels} />);
    const toggle = screen.getByRole('switch');

    fireEvent.click(toggle);
    fireEvent.click(toggle);

    expect(document.documentElement.getAttribute('data-theme')).toBe('build');
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    expect(screen.getByText('Build Mode')).toBeTruthy();
  });
});
