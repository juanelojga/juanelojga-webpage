import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../utils/useReducedMotion';
import { DURATION, EASE_OUT, STAGGER } from '../utils/animation';

export interface ContactLabels {
  sectionTitle: string;
  headline: string;
  description: string;
  emailCta: string;
  emailToast: string;
  resumeLink: string;
  socialLabel: string;
  ariaEmailCopied: string;
}

interface Props {
  labels: ContactLabels;
}

const EMAIL = 'juanelojga@gmail.com';

const SOCIALS = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/juan-almeida-03806367/',
    icon: (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    href: 'https://github.com/juanelojga',
    icon: (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  ContactChapter                                                     */
/* ------------------------------------------------------------------ */

export default function ContactChapter({ labels }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useReducedMotion();

  // IntersectionObserver for section reveal
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // Fallback for older browsers or denied permissions
      const textarea = document.createElement('textarea');
      textarea.value = EMAIL;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 3000);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-headline"
      className="flex min-h-screen items-center px-6 py-20 lg:px-12 xl:px-20"
    >
      <motion.div
        className="mx-auto w-full max-w-2xl text-center"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : reducedMotion ? {} : { opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : DURATION.normal, ease: EASE_OUT }}
      >
        {/* Section label — from top */}
        <motion.p
          className="mb-2 font-mono text-meta text-signal-primary"
          initial={reducedMotion ? false : { opacity: 0, y: -16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : reducedMotion ? {} : { opacity: 0, y: -16 }}
          transition={{
            duration: reducedMotion ? 0 : DURATION.normal,
            delay: reducedMotion ? 0 : STAGGER.child,
            ease: EASE_OUT,
          }}
        >
          {labels.sectionTitle}
        </motion.p>

        {/* Headline — from top */}
        <motion.h2
          id="contact-headline"
          className="font-mono text-section text-text-primary"
          initial={reducedMotion ? false : { opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : reducedMotion ? {} : { opacity: 0, y: -20 }}
          transition={{
            duration: reducedMotion ? 0 : DURATION.normal,
            delay: reducedMotion ? 0 : STAGGER.child * 2,
            ease: EASE_OUT,
          }}
        >
          {labels.headline}
        </motion.h2>

        {/* Description */}
        <motion.p
          className="mx-auto mt-4 max-w-lg text-body leading-relaxed text-text-secondary"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : reducedMotion ? {} : { opacity: 0 }}
          transition={{
            duration: reducedMotion ? 0 : DURATION.normal,
            delay: reducedMotion ? 0 : STAGGER.child * 3,
            ease: EASE_OUT,
          }}
        >
          {labels.description}
        </motion.p>

        {/* Primary CTA — Copy email */}
        <motion.div
          className="mt-10 flex flex-col items-center gap-3"
          initial={reducedMotion ? false : { opacity: 0, y: -12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : reducedMotion ? {} : { opacity: 0, y: -12 }}
          transition={{
            duration: reducedMotion ? 0 : DURATION.normal,
            delay: reducedMotion ? 0 : STAGGER.child * 4,
            ease: EASE_OUT,
          }}
        >
          <motion.button
            type="button"
            onClick={handleCopyEmail}
            whileTap={reducedMotion ? undefined : { scale: 0.97 }}
            className={`inline-flex min-h-[44px] min-w-[44px] items-center gap-3 rounded-xl border px-6 py-3 font-mono text-label font-medium transition-all ${
              copied
                ? 'bg-signal-primary/15 border-signal-primary text-signal-primary'
                : 'border-signal-primary/50 hover:bg-signal-primary/10 text-signal-primary hover:border-signal-primary'
            }`}
            aria-label={copied ? labels.ariaEmailCopied : labels.emailCta}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.svg
                  key="check"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DURATION.micro }}
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                    initial={reducedMotion ? undefined : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: reducedMotion ? 0 : DURATION.fast,
                      ease: EASE_OUT,
                    }}
                  />
                </motion.svg>
              ) : (
                <motion.svg
                  key="copy"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DURATION.micro }}
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </motion.svg>
              )}
            </AnimatePresence>
            {copied ? labels.emailToast : labels.emailCta}
          </motion.button>

          {/* Email address displayed as text */}
          <span className="font-mono text-meta text-text-secondary">{EMAIL}</span>

          {/* Toast — ARIA live region */}
          <div role="status" aria-live="polite" className="h-6">
            <AnimatePresence>
              {copied && (
                <motion.span
                  className="font-mono text-meta text-signal-primary"
                  initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{
                    type: reducedMotion ? 'tween' : 'spring',
                    stiffness: 400,
                    damping: 25,
                    duration: reducedMotion ? 0 : undefined,
                  }}
                >
                  {labels.ariaEmailCopied}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Secondary actions — socials + resume */}
        <motion.div
          className="mt-12"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : reducedMotion ? {} : { opacity: 0 }}
          transition={{
            duration: reducedMotion ? 0 : DURATION.normal,
            delay: reducedMotion ? 0 : STAGGER.child * 5,
            ease: EASE_OUT,
          }}
        >
          <p className="mb-4 font-mono text-meta text-text-secondary">{labels.socialLabel}</p>

          <nav
            aria-label={labels.socialLabel}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {SOCIALS.map((social, i) => (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="hover:border-signal-primary/50 flex size-11 items-center justify-center rounded-lg border border-border text-text-secondary transition-all hover:text-signal-primary"
                initial={reducedMotion ? false : { opacity: 0, x: i === 0 ? -16 : 16 }}
                animate={
                  isVisible
                    ? { opacity: 1, x: 0 }
                    : reducedMotion
                      ? {}
                      : { opacity: 0, x: i === 0 ? -16 : 16 }
                }
                whileHover={reducedMotion ? undefined : { scale: 1.1, y: -2 }}
                transition={{
                  duration: reducedMotion ? 0 : DURATION.normal,
                  delay: reducedMotion ? 0 : STAGGER.child * (6 + i),
                  ease: EASE_OUT,
                }}
              >
                {social.icon}
              </motion.a>
            ))}

            {/* Divider */}
            <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

            {/* Resume link — from bottom */}
            <motion.a
              href="/documents/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:border-signal-primary/50 flex h-11 items-center gap-2 rounded-lg border border-border px-4 font-mono text-meta font-medium text-text-secondary transition-all hover:text-signal-primary"
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={
                isVisible ? { opacity: 1, y: 0 } : reducedMotion ? {} : { opacity: 0, y: 12 }
              }
              whileHover={reducedMotion ? undefined : { scale: 1.03 }}
              transition={{
                duration: reducedMotion ? 0 : DURATION.normal,
                delay: reducedMotion ? 0 : STAGGER.child * 8,
                ease: EASE_OUT,
              }}
            >
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {labels.resumeLink}
            </motion.a>
          </nav>
        </motion.div>
      </motion.div>
    </section>
  );
}
