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
}

interface Props {
  labels: HeroNarrativeLabels;
  lang: string;
}

export default function HeroNarrative({ labels }: Props) {
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
            src="/images/hero-build-final.jpg"
            alt={`${labels.name} — Build Mode`}
            width={760}
            height={950}
            loading="eager"
            className="absolute inset-0 size-full object-cover [[data-theme='after-hours']_&]:hidden"
          />
          {/* After Hours portrait */}
          <img
            src="/images/hero-after-hours-final.jpg"
            alt={`${labels.name} — After Hours`}
            width={760}
            height={950}
            loading="eager"
            className="absolute inset-0 hidden size-full object-cover [[data-theme='after-hours']_&]:block"
          />
        </div>
      </div>
    </section>
  );
}
