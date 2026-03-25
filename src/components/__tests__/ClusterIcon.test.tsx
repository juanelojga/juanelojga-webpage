import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import ClusterIcon from '../ClusterIcon';

describe('ClusterIcon', () => {
  afterEach(cleanup);

  it('should render the icon name as text content', () => {
    const { container } = render(<ClusterIcon name="code" />);
    const span = container.querySelector('span');
    expect(span).toBeTruthy();
    expect(span?.textContent).toBe('code');
  });

  it('should have aria-hidden="true"', () => {
    const { container } = render(<ClusterIcon name="terminal" />);
    const span = container.querySelector('span');
    expect(span?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should have material-symbols-outlined class', () => {
    const { container } = render(<ClusterIcon name="cloud" />);
    const span = container.querySelector('span');
    expect(span?.classList.contains('material-symbols-outlined')).toBe(true);
  });
});
