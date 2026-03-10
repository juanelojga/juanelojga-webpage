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
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">{labels.heading}</h2>

      {status === 'success' ? (
        <div
          role="alert"
          className="rounded-lg border border-green-200 bg-green-50 p-6 text-center"
        >
          <svg
            className="mx-auto mb-3 size-10 text-green-500"
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
          <p className="text-lg font-semibold text-green-800">{labels.successMessage}</p>
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
              className="mb-1.5 block text-sm font-medium text-slate-700"
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
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.fullName
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                  : 'border-slate-300 focus:border-primary focus:ring-primary/20'
              }`}
            />
            {errors.fullName && (
              <p id="lead-fullname-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="lead-email" className="mb-1.5 block text-sm font-medium text-slate-700">
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
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                  : 'border-slate-300 focus:border-primary focus:ring-primary/20'
              }`}
            />
            {errors.email && (
              <p id="lead-email-error" role="alert" className="mt-1 text-sm text-red-600">
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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
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
            <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{labels.errorMessage}</p>
            </div>
          )}

          {/* Privacy notice */}
          <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
            {labels.privacyNotice}
          </p>
        </form>
      )}
    </div>
  );
}
