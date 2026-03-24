import { useReducer, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TodoRailLabels {
  label: string;
  bootIdentity: string;
  loadProfile: string;
  compileStrengths: string;
  unlockWorkLog: string;
  openChannel: string;
  statePending: string;
  stateActive: string;
  stateCompleted: string;
}

export type TodoItemState = 'pending' | 'active' | 'completed';

export interface TodoItem {
  id: string;
  labelKey: string;
  sectionId: string;
  state: TodoItemState;
}

// ── Default rail items ─────────────────────────────────────────────────────────

export const DEFAULT_RAIL_ITEMS: TodoItem[] = [
  { id: 'boot', labelKey: 'todoRail.bootIdentity', sectionId: 'home', state: 'pending' },
  { id: 'profile', labelKey: 'todoRail.loadProfile', sectionId: 'about', state: 'pending' },
  { id: 'compile', labelKey: 'todoRail.compileStrengths', sectionId: 'skills', state: 'pending' },
  { id: 'unlock', labelKey: 'todoRail.unlockWorkLog', sectionId: 'projects', state: 'pending' },
  { id: 'open', labelKey: 'todoRail.openChannel', sectionId: 'contact', state: 'pending' },
];

// ── Reducer ────────────────────────────────────────────────────────────────────

export type TodoRailAction =
  | { type: 'ACTIVATE'; sectionId: string }
  | { type: 'COMPLETE'; sectionId: string }
  | { type: 'RESET' };

export function todoRailReducer(items: TodoItem[], action: TodoRailAction): TodoItem[] {
  switch (action.type) {
    case 'ACTIVATE': {
      const targetIndex = items.findIndex(item => item.sectionId === action.sectionId);
      if (targetIndex === -1) return items;

      return items.map((item, i) => {
        if (i < targetIndex) return { ...item, state: 'completed' as const };
        if (i === targetIndex) return { ...item, state: 'active' as const };
        return { ...item, state: 'pending' as const };
      });
    }

    case 'COMPLETE': {
      const targetIndex = items.findIndex(item => item.sectionId === action.sectionId);
      if (targetIndex === -1) return items;

      return items.map((item, i) => {
        if (i <= targetIndex) return { ...item, state: 'completed' as const };
        return item;
      });
    }

    case 'RESET':
      return items.map(item => ({ ...item, state: 'pending' as const }));

    default:
      return items;
  }
}

// ── React hook ─────────────────────────────────────────────────────────────────

export function useTodoRail(initialItems: TodoItem[] = DEFAULT_RAIL_ITEMS) {
  const [items, dispatch] = useReducer(todoRailReducer, initialItems);

  const activate = useCallback(
    (sectionId: string) => dispatch({ type: 'ACTIVATE', sectionId }),
    []
  );

  const complete = useCallback(
    (sectionId: string) => dispatch({ type: 'COMPLETE', sectionId }),
    []
  );

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return { items, activate, complete, reset };
}

// ── Label mapping ──────────────────────────────────────────────────────────────

export const labelKeyMap: Record<string, keyof TodoRailLabels> = {
  'todoRail.bootIdentity': 'bootIdentity',
  'todoRail.loadProfile': 'loadProfile',
  'todoRail.compileStrengths': 'compileStrengths',
  'todoRail.unlockWorkLog': 'unlockWorkLog',
  'todoRail.openChannel': 'openChannel',
};

export function getLabel(item: TodoItem, labels: TodoRailLabels): string {
  const key = labelKeyMap[item.labelKey];
  return key ? labels[key] : item.labelKey;
}
