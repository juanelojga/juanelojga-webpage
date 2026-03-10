import { describe, it, expect } from 'vitest';

describe('Vitest smoke test', () => {
  it('should run a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have happy-dom environment', () => {
    expect(typeof document).toBe('object');
    expect(typeof window).toBe('object');
  });
});
