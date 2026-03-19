/* ================================================================== */
/*  Shared Animation Constants                                         */
/*  Centralises timing, easing, and stagger values so every component  */
/*  in Phase 7 uses a consistent motion language.                       */
/* ================================================================== */

import type { Transition, Variants } from 'framer-motion';

// ── Easing ─────────────────────────────────────────────────────────────

/** Decelerating ease — enters the viewport and settles. */
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Accelerating ease — exits or shrinks away. */
export const EASE_IN: [number, number, number, number] = [0.55, 0.055, 0.675, 0.19];

/** Smooth spring-like ease for UI micro-interactions. */
export const EASE_SPRING: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

// ── Durations (ms) ────────────────────────────────────────────────────

export const DURATION = {
  instant: 0,
  micro: 0.15, // reduced-motion fallback
  fast: 0.25,
  normal: 0.4,
  slow: 0.6,
  reveal: 0.8,
  theme: 0.65,
} as const;

// ── Stagger delays (seconds) ──────────────────────────────────────────

export const STAGGER = {
  /** Per-character headline reveal. */
  char: 0.07,
  /** Per-chip cascade in SkillMatrix. */
  chip: 0.04,
  /** Per-cluster cascade in SkillMatrix. */
  cluster: 0.08,
  /** Per-entry cascade in WorkLog. */
  entry: 0.1,
  /** Per-child in reveal families. */
  child: 0.08,
} as const;

// ── Hero choreography delays (seconds) ────────────────────────────────

export const HERO_DELAYS = {
  headline: 0.3,
  translatorLine: 0.2, // after typing finishes
  portrait: 0.2, // after translator line
  ctas: 0.2, // after portrait
} as const;

// ── Rail micro-interaction timings (seconds) ──────────────────────────

export const RAIL_TIMING = {
  sweep: 0.4,
  checkDraw: 0.3,
  strikeThrough: 0.25,
  /** Overlap between sweep end and check start. */
  sweepCheckOverlap: 0.1,
} as const;

// ── Transition presets ────────────────────────────────────────────────

export const fadeIn: Transition = {
  duration: DURATION.slow,
  ease: EASE_OUT,
};

export const revealTransition: Transition = {
  duration: DURATION.reveal,
  ease: EASE_OUT,
};

export const microTransition: Transition = {
  duration: DURATION.micro,
  ease: 'easeOut',
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

// ── Shared variants ───────────────────────────────────────────────────

/** Fade + slide-up reveal (default section entry). */
export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: fadeIn },
};

/** Fade only (reduced-motion safe). */
export const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.micro, ease: 'easeOut' } },
};

/** Staggered children container. */
export const staggerContainer = (stagger: number = STAGGER.child): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
});

/** Slide from left. */
export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: fadeIn },
};

/** Slide from right. */
export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: fadeIn },
};

/** Scale pulse for skill chips on hover. */
export const chipPulse: Variants = {
  idle: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: DURATION.normal, ease: EASE_SPRING },
  },
};

/** Portrait frame sequence timing (ms between frames). */
export const PORTRAIT_FRAME_INTERVAL = 80;
export const PORTRAIT_FRAME_COUNT = 6;
