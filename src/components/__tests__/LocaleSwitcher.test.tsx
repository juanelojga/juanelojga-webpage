import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import LocaleSwitcher from '../LocaleSwitcher';

describe('LocaleSwitcher', () => {
  afterEach(cleanup);

  it('should render a button with accessible label', () => {
    render(<LocaleSwitcher currentLang="en" labels={{ label: 'Change language' }} />);
    expect(screen.getByRole('button', { name: 'Change language' })).toBeTruthy();
  });

  it('should highlight EN when currentLang is "en"', () => {
    render(<LocaleSwitcher currentLang="en" labels={{ label: 'Change language' }} />);
    const en = screen.getByText('EN');
    const es = screen.getByText('ES');

    expect(en.className).toContain('text-text-primary');
    expect(es.className).toContain('text-text-secondary');
  });

  it('should highlight ES when currentLang is "es"', () => {
    render(<LocaleSwitcher currentLang="es" labels={{ label: 'Change language' }} />);
    const en = screen.getByText('EN');
    const es = screen.getByText('ES');

    expect(en.className).toContain('text-text-secondary');
    expect(es.className).toContain('text-text-primary');
  });
});
