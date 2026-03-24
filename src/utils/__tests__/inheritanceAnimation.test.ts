import { describe, it, expect } from 'vitest';
import {
  INHERITANCE_TIMING,
  INHERITANCE_EVENTS,
  createTraitHoverEvent,
  createTraitUnhoverEvent,
  createActiveNodeEvent,
  staggerReveal,
} from '../inheritanceAnimation';

describe('inheritanceAnimation utility', () => {
  describe('INHERITANCE_TIMING', () => {
    it('should define all choreography delays', () => {
      expect(INHERITANCE_TIMING.parent).toBe(0);
      expect(INHERITANCE_TIMING.connector).toBe(0.3);
      expect(INHERITANCE_TIMING.child).toBe(0.5);
      expect(INHERITANCE_TIMING.traits).toBe(0.7);
      expect(INHERITANCE_TIMING.overrides).toBe(0.9);
    });

    it('should have core choreography (parent → child) complete within 1.2s', () => {
      const coreEnd = INHERITANCE_TIMING.child + INHERITANCE_TIMING.panelDuration;
      expect(coreEnd).toBeLessThanOrEqual(1.2);
    });

    it('should have trait stagger in 50–80ms range', () => {
      expect(INHERITANCE_TIMING.traitStagger).toBeGreaterThanOrEqual(0.05);
      expect(INHERITANCE_TIMING.traitStagger).toBeLessThanOrEqual(0.08);
    });
  });

  describe('INHERITANCE_EVENTS', () => {
    it('should define all event names', () => {
      expect(INHERITANCE_EVENTS.traitHover).toBe('inheritance:trait-hover');
      expect(INHERITANCE_EVENTS.traitUnhover).toBe('inheritance:trait-unhover');
      expect(INHERITANCE_EVENTS.activeNode).toBe('inheritance:active-node');
    });
  });

  describe('createTraitHoverEvent', () => {
    it('should create a CustomEvent with traitLabel detail', () => {
      const event = createTraitHoverEvent('Stateful Graph Execution');
      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.type).toBe('inheritance:trait-hover');
      expect(event.detail.traitLabel).toBe('Stateful Graph Execution');
      expect(event.bubbles).toBe(true);
    });
  });

  describe('createTraitUnhoverEvent', () => {
    it('should create a CustomEvent with no detail', () => {
      const event = createTraitUnhoverEvent();
      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.type).toBe('inheritance:trait-unhover');
      expect(event.bubbles).toBe(true);
    });
  });

  describe('createActiveNodeEvent', () => {
    it('should create a CustomEvent with section and labels detail', () => {
      const event = createActiveNodeEvent('traits', ['A', 'B']);
      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.type).toBe('inheritance:active-node');
      expect(event.detail.section).toBe('traits');
      expect(event.detail.labels).toEqual(['A', 'B']);
      expect(event.bubbles).toBe(true);
    });
  });

  describe('staggerReveal', () => {
    it('should return an array of delays for the given count', () => {
      const delays = staggerReveal(3);
      expect(delays).toHaveLength(3);
      expect(delays[0]).toBe(0);
      expect(delays[1]).toBeCloseTo(INHERITANCE_TIMING.traitStagger);
      expect(delays[2]).toBeCloseTo(INHERITANCE_TIMING.traitStagger * 2);
    });

    it('should apply base delay offset', () => {
      const delays = staggerReveal(2, 0.5);
      expect(delays[0]).toBe(0.5);
      expect(delays[1]).toBeCloseTo(0.5 + INHERITANCE_TIMING.traitStagger);
    });

    it('should use custom stagger value', () => {
      const delays = staggerReveal(3, 0, 0.1);
      expect(delays[0]).toBe(0);
      expect(delays[1]).toBeCloseTo(0.1);
      expect(delays[2]).toBeCloseTo(0.2);
    });

    it('should return empty array for count 0', () => {
      expect(staggerReveal(0)).toEqual([]);
    });
  });
});
