import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import LeadCaptureForm, { type LeadCaptureFormLabels } from '../LeadCaptureForm';

const mockLabels: LeadCaptureFormLabels = {
  heading: 'Download My Resume',
  fullName: 'Full Name',
  fullNamePlaceholder: 'Your full name',
  email: 'Email',
  emailPlaceholder: 'you@example.com',
  submit: 'Download Resume (PDF)',
  submitting: 'Submitting…',
  successMessage: 'Thank you! Your download will start shortly.',
  errorMessage: 'Something went wrong. Please try again.',
  privacyNotice: 'Your information will not be shared.',
  requiredField: 'This field is required.',
  invalidEmail: 'Please enter a valid email address.',
};

describe('LeadCaptureForm', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render the form heading', () => {
    render(<LeadCaptureForm lang="en" labels={mockLabels} />);
    expect(screen.getByText('Download My Resume')).toBeTruthy();
  });

  it('should render name and email fields', () => {
    render(<LeadCaptureForm lang="en" labels={mockLabels} />);
    expect(screen.getByLabelText('Full Name')).toBeTruthy();
    expect(screen.getByLabelText('Email')).toBeTruthy();
  });

  it('should render the submit button', () => {
    render(<LeadCaptureForm lang="en" labels={mockLabels} />);
    expect(screen.getByRole('button', { name: 'Download Resume (PDF)' })).toBeTruthy();
  });

  it('should render the privacy notice', () => {
    render(<LeadCaptureForm lang="en" labels={mockLabels} />);
    expect(screen.getByText('Your information will not be shared.')).toBeTruthy();
  });

  it('should have a hidden honeypot field', () => {
    render(<LeadCaptureForm lang="en" labels={mockLabels} />);
    const honeypot = document.querySelector('input[name="bot-field"]');
    expect(honeypot).toBeTruthy();
    expect(honeypot?.closest('p')?.classList.contains('hidden')).toBe(true);
  });

  it('should have Netlify form attributes', () => {
    render(<LeadCaptureForm lang="en" labels={mockLabels} />);
    const form = document.querySelector('form[name="lead-capture"]');
    expect(form).toBeTruthy();
    expect(form?.getAttribute('data-netlify')).toBe('true');
    expect(form?.getAttribute('netlify-honeypot')).toBe('bot-field');
    expect(form?.getAttribute('data-netlify-recaptcha')).toBe('true');
  });

  it('should have a hidden lang input', () => {
    render(<LeadCaptureForm lang="en" labels={mockLabels} />);
    const langInput = document.querySelector('input[name="lang"]') as HTMLInputElement;
    expect(langInput).toBeTruthy();
    expect(langInput.value).toBe('en');
  });

  it('should show validation errors when submitting empty form', async () => {
    render(<LeadCaptureForm lang="en" labels={mockLabels} />);
    const submitButton = screen.getByRole('button', { name: 'Download Resume (PDF)' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errors = screen.getAllByText('This field is required.');
      expect(errors).toHaveLength(2);
    });
  });

  it('should show invalid email error for bad email format', async () => {
    render(<LeadCaptureForm lang="en" labels={mockLabels} />);
    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Download Resume (PDF)' });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeTruthy();
    });
  });

  it('should clear field error when user types in the field', async () => {
    render(<LeadCaptureForm lang="en" labels={mockLabels} />);
    const submitButton = screen.getByRole('button', { name: 'Download Resume (PDF)' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText('This field is required.')).toHaveLength(2);
    });

    const nameInput = screen.getByLabelText('Full Name');
    fireEvent.change(nameInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(screen.getAllByText('This field is required.')).toHaveLength(1);
    });
  });

  it('should have reCAPTCHA placeholder div', () => {
    render(<LeadCaptureForm lang="en" labels={mockLabels} />);
    const recaptcha = document.querySelector('[data-netlify-recaptcha="true"]');
    expect(recaptcha).toBeTruthy();
  });

  it('should show submitting text while loading', async () => {
    // Mock fetch to hang so we can observe the loading state
    globalThis.fetch = vi.fn(() => new Promise(() => {}));

    render(<LeadCaptureForm lang="en" labels={mockLabels} />);
    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    const submitButton = screen.getByRole('button', { name: 'Download Resume (PDF)' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Submitting…')).toBeTruthy();
      expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true);
    });
  });

  it('should render success state after successful submission', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve(new Response('', { status: 200 })));

    render(<LeadCaptureForm lang="en" labels={mockLabels} />);
    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    const submitButton = screen.getByRole('button', { name: 'Download Resume (PDF)' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Thank you! Your download will start shortly.')).toBeTruthy();
    });

    // Success message should have an alert role
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('should render error state after failed submission', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve(new Response('', { status: 500 })));

    render(<LeadCaptureForm lang="en" labels={mockLabels} />);
    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    const submitButton = screen.getByRole('button', { name: 'Download Resume (PDF)' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeTruthy();
    });

    expect(screen.getByRole('alert')).toBeTruthy();
  });
});
