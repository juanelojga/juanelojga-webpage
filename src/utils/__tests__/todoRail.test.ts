import { describe, it, expect } from 'vitest';
import {
  todoRailReducer,
  DEFAULT_RAIL_ITEMS,
  type TodoItem,
  type TodoRailAction,
} from '../todoRail';

function makeItems(states: Array<'pending' | 'active' | 'completed'>): TodoItem[] {
  return DEFAULT_RAIL_ITEMS.map((item, i) => ({ ...item, state: states[i] }));
}

describe('todoRailReducer', () => {
  describe('ACTIVATE', () => {
    it('should set the targeted item to active and prior items to completed', () => {
      const initial = makeItems(['pending', 'pending', 'pending', 'pending']);
      const result = todoRailReducer(initial, { type: 'ACTIVATE', sectionId: 'about' });

      expect(result.map(i => i.state)).toEqual(['completed', 'active', 'pending', 'pending']);
    });

    it('should activate the first item', () => {
      const initial = makeItems(['pending', 'pending', 'pending', 'pending']);
      const result = todoRailReducer(initial, { type: 'ACTIVATE', sectionId: 'home' });

      expect(result.map(i => i.state)).toEqual(['active', 'pending', 'pending', 'pending']);
    });

    it('should activate the last item and complete all prior', () => {
      const initial = makeItems(['pending', 'pending', 'pending', 'pending']);
      const result = todoRailReducer(initial, { type: 'ACTIVATE', sectionId: 'contact' });

      expect(result.map(i => i.state)).toEqual(['completed', 'completed', 'completed', 'active']);
    });

    it('should allow re-activation when scrolling back up', () => {
      const initial = makeItems(['completed', 'completed', 'active', 'pending']);
      const result = todoRailReducer(initial, { type: 'ACTIVATE', sectionId: 'about' });

      expect(result.map(i => i.state)).toEqual(['completed', 'active', 'pending', 'pending']);
    });

    it('should be a no-op for an unknown sectionId', () => {
      const initial = makeItems(['pending', 'pending', 'pending', 'pending']);
      const result = todoRailReducer(initial, { type: 'ACTIVATE', sectionId: 'unknown' });

      expect(result).toBe(initial);
    });

    it('should handle activating an already-active item', () => {
      const initial = makeItems(['completed', 'active', 'pending', 'pending']);
      const result = todoRailReducer(initial, { type: 'ACTIVATE', sectionId: 'about' });

      expect(result.map(i => i.state)).toEqual(['completed', 'active', 'pending', 'pending']);
    });
  });

  describe('COMPLETE', () => {
    it('should set the targeted item and all prior to completed', () => {
      const initial = makeItems(['completed', 'active', 'pending', 'pending']);
      const result = todoRailReducer(initial, { type: 'COMPLETE', sectionId: 'about' });

      expect(result.map(i => i.state)).toEqual(['completed', 'completed', 'pending', 'pending']);
    });

    it('should complete the first item only', () => {
      const initial = makeItems(['active', 'pending', 'pending', 'pending']);
      const result = todoRailReducer(initial, { type: 'COMPLETE', sectionId: 'home' });

      expect(result.map(i => i.state)).toEqual(['completed', 'pending', 'pending', 'pending']);
    });

    it('should complete all items', () => {
      const initial = makeItems(['completed', 'completed', 'completed', 'active']);
      const result = todoRailReducer(initial, { type: 'COMPLETE', sectionId: 'contact' });

      expect(result.map(i => i.state)).toEqual([
        'completed',
        'completed',
        'completed',
        'completed',
      ]);
    });

    it('should be a no-op for an unknown sectionId', () => {
      const initial = makeItems(['pending', 'pending', 'pending', 'pending']);
      const result = todoRailReducer(initial, { type: 'COMPLETE', sectionId: 'unknown' });

      expect(result).toBe(initial);
    });

    it('should handle completing an already-completed item', () => {
      const initial = makeItems(['completed', 'active', 'pending', 'pending']);
      const result = todoRailReducer(initial, { type: 'COMPLETE', sectionId: 'home' });

      expect(result.map(i => i.state)).toEqual(['completed', 'active', 'pending', 'pending']);
    });
  });

  describe('RESET', () => {
    it('should reset all items to pending', () => {
      const initial = makeItems(['completed', 'completed', 'active', 'pending']);
      const result = todoRailReducer(initial, { type: 'RESET' });

      expect(result.map(i => i.state)).toEqual(['pending', 'pending', 'pending', 'pending']);
    });

    it('should reset already-pending items without change', () => {
      const initial = makeItems(['pending', 'pending', 'pending', 'pending']);
      const result = todoRailReducer(initial, { type: 'RESET' });

      expect(result.map(i => i.state)).toEqual(['pending', 'pending', 'pending', 'pending']);
    });
  });

  describe('unknown action', () => {
    it('should return items unchanged', () => {
      const initial = makeItems(['pending', 'active', 'pending', 'pending']);
      const result = todoRailReducer(initial, { type: 'UNKNOWN' } as unknown as TodoRailAction);

      expect(result).toBe(initial);
    });
  });
});

describe('DEFAULT_RAIL_ITEMS', () => {
  it('should have exactly 4 items', () => {
    expect(DEFAULT_RAIL_ITEMS).toHaveLength(4);
  });

  it('should map to the expected section IDs', () => {
    expect(DEFAULT_RAIL_ITEMS.map(i => i.sectionId)).toEqual([
      'home',
      'about',
      'projects',
      'contact',
    ]);
  });

  it('should all start as pending', () => {
    expect(DEFAULT_RAIL_ITEMS.every(i => i.state === 'pending')).toBe(true);
  });

  it('should have unique IDs', () => {
    const ids = DEFAULT_RAIL_ITEMS.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
