import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../utils/useReducedMotion';
import { DURATION, EASE_OUT, HERO_DELAYS } from '../utils/animation';
import { preloadFrames, playSequence } from '../utils/portraitSequence';

export interface HeroNarrativeLabels {
  name: string;
  role: string;
  headline: string;
  translatorLine: string;
  primaryCta: string;
  secondaryCta: string;
  toptalLabel: string;
  toptalSr: string;
}

interface Props {
  labels: HeroNarrativeLabels;
  lang: string;
  buildPortraitSrc: string;
  afterHoursPortraitSrc: string;
}

export default function HeroNarrative({ labels, buildPortraitSrc, afterHoursPortraitSrc }: Props) {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const [animationDone, setAnimationDone] = useState(false);
  const [portraitRevealed, setPortraitRevealed] = useState(false);
  const [ctasReady, setCtasReady] = useState(false);
  const reducedMotion = useReducedMotion();
  const animationRan = useRef(false);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Typing/resolve animation for the headline with choreographed sequence
  useEffect(() => {
    if (animationRan.current) return;
    animationRan.current = true;

    const el = headlineRef.current;
    if (!el) return;

    // Reduced motion: show immediately, dispatch event
    if (reducedMotion) {
      setAnimationDone(true);
      setPortraitRevealed(true);
      setCtasReady(true);
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

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Step 1: Animate characters sequentially (starts after HERO_DELAYS.headline)
    const charDelay = Math.min(70, 1800 / Math.max(chars.length, 1));
    const typingStart = HERO_DELAYS.headline * 1000;

    chars.forEach((span, i) => {
      timers.push(
        setTimeout(
          () => {
            span.style.opacity = '1';
            span.classList.add('hero-char-reveal');
          },
          typingStart + i * charDelay
        )
      );
    });

    const typingEnd = typingStart + chars.length * charDelay;

    // Step 2: Translator line fades in after typing completes
    timers.push(
      setTimeout(
        () => {
          setAnimationDone(true);
        },
        typingEnd + HERO_DELAYS.translatorLine * 1000
      )
    );

    // Step 3: Portrait reveals after translator line
    timers.push(
      setTimeout(
        () => {
          setPortraitRevealed(true);
        },
        typingEnd + (HERO_DELAYS.translatorLine + HERO_DELAYS.portrait) * 1000
      )
    );

    // Step 4: CTAs slide up after portrait
    timers.push(
      setTimeout(
        () => {
          setCtasReady(true);
        },
        typingEnd + (HERO_DELAYS.translatorLine + HERO_DELAYS.portrait + HERO_DELAYS.ctas) * 1000
      )
    );

    // Step 5: Dispatch boot-complete after all animations
    const totalDuration =
      typingEnd +
      (HERO_DELAYS.translatorLine + HERO_DELAYS.portrait + HERO_DELAYS.ctas) * 1000 +
      300;
    timers.push(
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('hero:boot-complete'));
      }, totalDuration)
    );

    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  // Listen for theme toggle to play portrait frame sequence
  useEffect(() => {
    if (reducedMotion) return;

    const handleThemeToggle = (e: Event) => {
      const detail = (e as CustomEvent).detail as { theme: string } | undefined;
      const container = portraitRef.current;
      if (!container || !detail) return;

      preloadFrames().then(() => {
        const direction = detail.theme === 'after-hours' ? 'forward' : 'reverse';
        playSequence(container, direction, () => {
          window.dispatchEvent(new CustomEvent('theme:toggle-complete'));
        });
      });
    };

    window.addEventListener('theme:toggle-start', handleThemeToggle);
    return () => window.removeEventListener('theme:toggle-start', handleThemeToggle);
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
          <motion.p
            className="mb-4 font-mono text-meta text-text-secondary"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reducedMotion ? 0 : DURATION.normal, ease: EASE_OUT }}
          >
            <span>{labels.name}</span>
            <span className="mx-2 text-border" aria-hidden="true">
              /
            </span>
            <span className="text-signal-primary">{labels.role}</span>
          </motion.p>

          {/* Headline */}
          <h1
            ref={headlineRef}
            id="hero-headline"
            className="font-mono text-hero text-text-primary"
          >
            {labels.headline}
          </h1>

          {/* Translator line */}
          <motion.p
            id="hero-narrative"
            className="mt-6 max-w-lg text-body text-text-secondary"
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={animationDone || reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: reducedMotion ? 0 : DURATION.slow, ease: EASE_OUT }}
          >
            {labels.translatorLine}
          </motion.p>

          {/* CTAs */}
          <AnimatePresence>
            {(ctasReady || reducedMotion) && (
              <motion.div
                className="mt-10 flex flex-wrap gap-4"
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : DURATION.slow, ease: EASE_OUT }}
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toptal credential */}
          <AnimatePresence>
            {(ctasReady || reducedMotion) && (
              <motion.a
                href="https://www.toptal.com/developers/resume/juan-almeida-duplicate#BxjOz6"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-border px-4 py-2 font-mono text-meta text-text-secondary transition-colors hover:border-signal-primary hover:text-signal-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-primary"
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : DURATION.normal,
                  delay: reducedMotion ? 0 : 0.15,
                  ease: EASE_OUT,
                }}
              >
                <svg
                  width="14"
                  height="20"
                  viewBox="0 0 21 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path
                    d="M8.11 0L14.82 6.7C14.87 6.75 14.91 6.8 14.97 6.85L20.82 12.7L11.31 22.16L15.66 26.52L12.75 29.41L6.09 22.75C6.01 22.68 5.93 22.6 5.85 22.52L0 16.68L9.48 7.25L5.16 2.94L8.11 0ZM12.36 10.5C12.27 10.48 12.18 10.48 12.1 10.5C12.01 10.53 11.94 10.57 11.78 10.72L6.37 16.11C6.21 16.27 6.17 16.34 6.15 16.42C6.12 16.51 6.12 16.6 6.15 16.68C6.17 16.77 6.22 16.85 6.37 17L8.09 18.72C8.24 18.87 8.31 18.91 8.4 18.94C8.49 18.96 8.57 18.96 8.66 18.94C8.75 18.91 8.82 18.87 8.97 18.72L14.38 13.33C14.54 13.18 14.58 13.1 14.61 13.02C14.63 12.93 14.63 12.85 14.61 12.76C14.59 12.67 14.54 12.6 14.39 12.45L12.67 10.73C12.52 10.57 12.44 10.53 12.36 10.5Z"
                    fill="currentColor"
                  />
                </svg>
                <span>{labels.toptalLabel}</span>
                <span className="sr-only">{labels.toptalSr}</span>
              </motion.a>
            )}
          </AnimatePresence>
        </div>

        {/* Portrait */}
        <div
          ref={portraitRef}
          className={`relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-xl lg:w-[340px] lg:shrink-0 xl:w-[380px] ${
            portraitRevealed || reducedMotion ? 'hero-portrait-revealed' : 'hero-portrait-hidden'
          }`}
          data-portrait-slot
          role="img"
          aria-label={`${labels.name} portrait`}
        >
          {/* Build Mode portrait */}
          <img
            src={buildPortraitSrc}
            alt={`${labels.name} — Build Mode`}
            width={760}
            height={950}
            loading="eager"
            className="absolute inset-0 size-full object-cover [[data-theme='after-hours']_&]:hidden"
          />
          {/* After Hours portrait */}
          <img
            src={afterHoursPortraitSrc}
            alt={`${labels.name} — After Hours`}
            width={760}
            height={950}
            loading="lazy"
            className="absolute inset-0 hidden size-full object-cover [[data-theme='after-hours']_&]:block"
          />
        </div>
      </div>
    </section>
  );
}
