import { useEffect, useRef, useState, useCallback } from 'react';

export interface HeroNarrativeLabels {
  name: string;
  role: string;
  headline: string;
  translatorLine: string;
  primaryCta: string;
  secondaryCta: string;
}

interface Props {
  labels: HeroNarrativeLabels;
  lang: string;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

export default function HeroNarrative({ labels, lang }: Props) {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [animationDone, setAnimationDone] = useState(false);
  const [portraitRevealed, setPortraitRevealed] = useState(false);
  const reducedMotion = useReducedMotion();
  const animationRan = useRef(false);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Typing/resolve animation for the headline
  useEffect(() => {
    if (animationRan.current) return;
    animationRan.current = true;

    const el = headlineRef.current;
    if (!el) return;

    // Reduced motion: show immediately, dispatch event
    if (reducedMotion) {
      setAnimationDone(true);
      setPortraitRevealed(true);
      window.dispatchEvent(new CustomEvent('hero:boot-complete'));
      return;
    }

    const text = el.textContent || '';
    el.textContent = '';
    el.setAttribute('aria-label', text);

    // Create character spans
    const chars = text.split('').map((char, i) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.className = 'hero-char';
      span.style.opacity = '0';
      span.style.setProperty('--char-index', String(i));
      el.appendChild(span);
      return span;
    });

    // Reveal portrait after a short delay
    const portraitTimer = setTimeout(() => setPortraitRevealed(true), 400);

    // Animate characters sequentially
    const charDelay = Math.min(70, 1800 / Math.max(chars.length, 1));
    chars.forEach((span, i) => {
      setTimeout(() => {
        span.style.opacity = '1';
        span.classList.add('hero-char-reveal');
      }, i * charDelay);
    });

    // On completion, dispatch event
    const totalDuration = chars.length * charDelay + 300;
    const completeTimer = setTimeout(() => {
      setAnimationDone(true);
      window.dispatchEvent(new CustomEvent('hero:boot-complete'));
    }, totalDuration);

    return () => {
      clearTimeout(portraitTimer);
      clearTimeout(completeTimer);
    };
  }, [reducedMotion]);

  return (
    <section
      id="home"
      className="flex min-h-screen items-center px-6 py-16 lg:px-12 xl:px-20"
      aria-labelledby="hero-headline"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
        {/* Text column */}
        <div className="flex flex-1 flex-col justify-center lg:py-12">
          {/* Name + role meta */}
          <p className="mb-4 font-mono text-meta text-text-secondary">
            <span>{labels.name}</span>
            <span className="mx-2 text-border" aria-hidden="true">
              /
            </span>
            <span className="text-signal-primary">{labels.role}</span>
          </p>

          {/* Headline */}
          <h1
            ref={headlineRef}
            id="hero-headline"
            className="font-mono text-hero text-text-primary"
          >
            {labels.headline}
          </h1>

          {/* Translator line */}
          <p
            className={`mt-6 max-w-lg text-body text-text-secondary transition-opacity duration-500 ${
              animationDone || reducedMotion ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {labels.translatorLine}
          </p>

          {/* CTAs */}
          <div
            className={`mt-10 flex flex-wrap gap-4 transition-opacity duration-500 ${
              animationDone || reducedMotion ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button
              type="button"
              onClick={() => scrollTo('projects')}
              className="rounded-lg bg-signal-primary px-6 py-3 font-mono text-label font-semibold text-text-inverse transition-all hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-primary"
            >
              {labels.primaryCta}
            </button>
            <button
              type="button"
              onClick={() => scrollTo('contact')}
              className="rounded-lg border border-border px-6 py-3 font-mono text-label text-text-primary transition-all hover:border-signal-primary hover:text-signal-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-primary"
            >
              {labels.secondaryCta}
            </button>
          </div>
        </div>

        {/* Portrait placeholder */}
        <div
          className={`relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-xl lg:w-[340px] lg:shrink-0 xl:w-[380px] ${
            portraitRevealed || reducedMotion ? 'hero-portrait-revealed' : 'hero-portrait-hidden'
          }`}
          data-portrait-slot
          role="img"
          aria-label={`${labels.name} portrait`}
        >
          {/* Themed gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-surface-secondary via-surface-tertiary to-surface-secondary" />
          {/* Geometric accent */}
          <div className="absolute inset-0 opacity-20">
            <div className="border-signal-primary/30 absolute bottom-0 right-0 size-2/3 rounded-tl-[4rem] border-l border-t" />
            <div className="bg-signal-primary/40 absolute left-4 top-4 size-3 rounded-full" />
            <div className="bg-signal-secondary/40 absolute bottom-8 left-8 size-2 rounded-full" />
          </div>
          {/* Placeholder label */}
          <span className="text-text-secondary/50 relative z-10 font-mono text-meta">
            {'{ portrait }'}
          </span>
        </div>
      </div>
    </section>
  );
}
