/* ================================================================== */
/*  Inheritance Section — Animation Orchestration                      */
/*  Choreography timing, event factories, and stagger helpers for the  */
/*  class-lineage section on project detail pages.                     */
/* ================================================================== */

import { DURATION, EASE_OUT } from './animation';

// ── Choreography delays (seconds) ─────────────────────────────────────
// Total hero choreography completes visually within ~1.2s.
// Trailing stagger on traits/overrides may extend slightly.

export const INHERITANCE_TIMING = {
  /** Parent panel reveal start. */
  parent: 0,
  /** Connector draw start (after parent begins). */
  connector: 0.3,
  /** Connector draw duration. */
  connectorDuration: 0.4,
  /** Child panel reveal start. */
  child: 0.5,
  /** Inherited traits grid start (after child settles). */
  traits: 0.7,
  /** Override cards start. */
  overrides: 0.9,
  /** Per-trait stagger delay (50–80ms range, using 60ms). */
  traitStagger: 0.06,
  /** Panel reveal duration. */
  panelDuration: DURATION.normal,
} as const;

// ── Custom event names ────────────────────────────────────────────────

export const INHERITANCE_EVENTS = {
  /** Dispatched when a trait chip is hovered/focused. Detail: { traitLabel: string } */
  traitHover: 'inheritance:trait-hover',
  /** Dispatched when trait hover/focus ends. */
  traitUnhover: 'inheritance:trait-unhover',
  /** Dispatched when the active lineage section changes on scroll. Detail: { section: string, labels: string[] } */
  activeNode: 'inheritance:active-node',
} as const;

// ── Event factory functions ───────────────────────────────────────────

export function createTraitHoverEvent(traitLabel: string): CustomEvent<{ traitLabel: string }> {
  return new CustomEvent(INHERITANCE_EVENTS.traitHover, {
    detail: { traitLabel },
    bubbles: true,
  });
}

export function createTraitUnhoverEvent(): CustomEvent {
  return new CustomEvent(INHERITANCE_EVENTS.traitUnhover, { bubbles: true });
}

export function createActiveNodeEvent(
  section: string,
  labels: string[]
): CustomEvent<{ section: string; labels: string[] }> {
  return new CustomEvent(INHERITANCE_EVENTS.activeNode, {
    detail: { section, labels },
    bubbles: true,
  });
}

// ── Stagger helpers ───────────────────────────────────────────────────

/**
 * Returns an array of delay values for `count` items, evenly staggered.
 * @param count Number of items to stagger.
 * @param baseDelay Starting delay offset (seconds).
 * @param stagger Per-item delay increment (seconds).
 */
export function staggerReveal(
  count: number,
  baseDelay: number = 0,
  stagger: number = INHERITANCE_TIMING.traitStagger
): number[] {
  return Array.from({ length: count }, (_, i) => baseDelay + i * stagger);
}

// ── Framer Motion transition preset ───────────────────────────────────

export const inheritanceRevealTransition = {
  duration: DURATION.normal,
  ease: EASE_OUT,
} as const;
