import { useState, type FormEvent } from 'react';

export interface LeadCaptureFormLabels {
  heading: string;
  fullName: string;
  fullNamePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  submit: string;
  submitting: string;
  successMessage: string;
  errorMessage: string;
  privacyNotice: string;
  requiredField: string;
  invalidEmail: string;
}

interface Props {
  lang: string;
  labels: LeadCaptureFormLabels;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  fullName?: string;
  email?: string;
}

function validate(fullName: string, email: string, labels: LeadCaptureFormLabels): FieldErrors {
  const errors: FieldErrors = {};

  if (!fullName.trim()) {
    errors.fullName = labels.requiredField;
  }

  if (!email.trim()) {
    errors.email = labels.requiredField;
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = labels.invalidEmail;
  }

  return errors;
}

export default function LeadCaptureForm({ lang, labels }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fieldErrors = validate(fullName, email, labels);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    setStatus('loading');

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      });

      if (!response.ok) {
        throw new Error(`Form submission failed: ${response.status}`);
      }

      setStatus('success');

      // Trigger PDF download on success
      const link = document.createElement('a');
      link.href = '/documents/resume.pdf';
      link.download = 'Juan_Almeida_Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setStatus('error');
    }
  };

  const isSubmitting = status === 'loading';

  return (
    <div className="mx-auto w-full max-w-md">
      <h2
        id="lead-capture-heading"
        className="mb-6 text-2xl font-bold tracking-tight text-text-primary"
      >
        {labels.heading}
      </h2>

      {status === 'success' ? (
        <div
          role="alert"
          className="border-status-success/30 rounded-lg border bg-status-success-muted p-6 text-center"
        >
          <svg
            className="mx-auto mb-3 size-10 text-status-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-semibold text-status-success">{labels.successMessage}</p>
        </div>
      ) : (
        <form
          name="lead-capture"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          data-netlify-recaptcha="true"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Hidden fields for Netlify Forms */}
          <input type="hidden" name="form-name" value="lead-capture" />
          <input type="hidden" name="lang" value={lang} />

          {/* Honeypot field — hidden from real users */}
          <p className="hidden" aria-hidden="true">
            <label>
              Don&apos;t fill this out: <input name="bot-field" tabIndex={-1} />
            </label>
          </p>

          {/* Full Name */}
          <div className="mb-4">
            <label
              htmlFor="lead-fullname"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              {labels.fullName}
            </label>
            <input
              id="lead-fullname"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              placeholder={labels.fullNamePlaceholder}
              value={fullName}
              onChange={e => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
              }}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? 'lead-fullname-error' : undefined}
              className={`placeholder:text-text-secondary/60 w-full rounded-lg border bg-surface-primary px-4 py-2.5 text-sm text-text-primary shadow-sm transition focus:outline-none focus:ring-2 ${
                errors.fullName
                  ? 'focus:ring-status-error/20 border-status-error focus:border-status-error'
                  : 'focus:ring-signal-primary/30 border-border focus:border-signal-primary'
              }`}
            />
            {errors.fullName && (
              <p id="lead-fullname-error" role="alert" className="mt-1 text-sm text-status-error">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="lead-email"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              {labels.email}
            </label>
            <input
              id="lead-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={labels.emailPlaceholder}
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'lead-email-error' : undefined}
              className={`placeholder:text-text-secondary/60 w-full rounded-lg border bg-surface-primary px-4 py-2.5 text-sm text-text-primary shadow-sm transition focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'focus:ring-status-error/20 border-status-error focus:border-status-error'
                  : 'focus:ring-signal-primary/30 border-border focus:border-signal-primary'
              }`}
            />
            {errors.email && (
              <p id="lead-email-error" role="alert" className="mt-1 text-sm text-status-error">
                {errors.email}
              </p>
            )}
          </div>

          {/* reCAPTCHA placeholder */}
          <div className="mb-4" data-netlify-recaptcha="true"></div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="hover:bg-primary/90 focus:ring-signal-primary/30 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-text-inverse shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="size-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                {labels.submitting}
              </>
            ) : (
              labels.submit
            )}
          </button>

          {/* Error message */}
          {status === 'error' && (
            <div
              role="alert"
              className="border-status-error/30 mt-4 rounded-lg border bg-status-error-muted p-3"
            >
              <p className="text-sm text-status-error">{labels.errorMessage}</p>
            </div>
          )}

          {/* Privacy notice */}
          <p className="mt-4 text-center text-xs leading-relaxed text-text-secondary">
            {labels.privacyNotice}
          </p>
        </form>
      )}
    </div>
  );
}
