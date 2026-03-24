import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import AnimatedCheckIcon from '../AnimatedCheckIcon';

describe('AnimatedCheckIcon', () => {
  afterEach(cleanup);

  it('should render an SVG with correct viewBox', () => {
    const { container } = render(<AnimatedCheckIcon animate={false} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 16 16');
  });

  it('should have aria-hidden="true"', () => {
    const { container } = render(<AnimatedCheckIcon animate={false} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should render the checkmark path', () => {
    const { container } = render(<AnimatedCheckIcon animate={true} />);
    const path = container.querySelector('path');
    expect(path).toBeTruthy();
    expect(path?.getAttribute('d')).toBe('M3 8.5L6.5 12L13 4');
  });

  it('should apply signal-primary color class', () => {
    const { container } = render(<AnimatedCheckIcon animate={false} />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('text-signal-primary')).toBe(true);
  });

  it('should accept spring prop without error', () => {
    const { container } = render(<AnimatedCheckIcon animate={true} spring />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});
