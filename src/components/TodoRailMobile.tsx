import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import type { TodoItem } from '../utils/todoRail';
import type { TodoRailLabels } from './TodoRail';
import { RAIL_TIMING, EASE_OUT, DURATION } from '../utils/animation';

interface Props {
  items: TodoItem[];
  labels: TodoRailLabels;
  onItemClick: (sectionId: string) => void;
}

const labelKeyMap: Record<string, keyof TodoRailLabels> = {
  'todoRail.bootIdentity': 'bootIdentity',
  'todoRail.loadProfile': 'loadProfile',
  'todoRail.compileStrengths': 'compileStrengths',
  'todoRail.unlockWorkLog': 'unlockWorkLog',
  'todoRail.openChannel': 'openChannel',
};

function getLabel(item: TodoItem, labels: TodoRailLabels): string {
  const key = labelKeyMap[item.labelKey];
  return key ? labels[key] : item.labelKey;
}

/* ── Animated check icon for mobile ──────────────────────────────── */

function AnimatedCheckIconMobile({ animate }: { animate: boolean }) {
  const reducedMotion = useFramerReducedMotion();
  return (
    <svg
      className="size-4 text-signal-primary"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <motion.path
        d="M3 8.5L6.5 12L13 4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={animate ? { pathLength: 1 } : { pathLength: 0 }}
        transition={
          reducedMotion ? { duration: 0 } : { duration: RAIL_TIMING.checkDraw, ease: EASE_OUT }
        }
      />
    </svg>
  );
}

export default function TodoRailMobile({ items, labels, onItemClick }: Props) {
  const [expanded, setExpanded] = useState(false);
  const reducedMotion = useFramerReducedMotion();

  // Track previous states for animation triggers
  const prevStatesRef = useRef<Map<string, TodoItem['state']>>(new Map());

  useEffect(() => {
    const map = new Map<string, TodoItem['state']>();
    items.forEach(item => map.set(item.id, item.state));
    const timer = setTimeout(() => {
      prevStatesRef.current = map;
    }, 0);
    return () => clearTimeout(timer);
  }, [items]);

  const completedCount = items.filter(i => i.state === 'completed').length;
  const activeItem = items.find(i => i.state === 'active');
  const panelId = 'todo-rail-mobile-panel';

  return (
    <div className="bg-surface-primary/95 sticky top-0 z-50 border-b border-border backdrop-blur-md lg:hidden">
      {/* Collapsed progress strip */}
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-label={`${labels.label}: ${completedCount}/${items.length}`}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        {/* Progress dots */}
        <div className="flex items-center gap-2" aria-hidden="true">
          {items.map(item => {
            const prevState = prevStatesRef.current.get(item.id);
            const justCompleted =
              prevState !== undefined && prevState !== 'completed' && item.state === 'completed';

            return (
              <motion.span
                key={item.id}
                className={`size-2 rounded-full transition-colors ${
                  item.state === 'completed'
                    ? 'bg-signal-primary'
                    : item.state === 'active'
                      ? 'bg-signal-primary/50 rail-pulse'
                      : 'bg-border'
                }`}
                animate={justCompleted && !reducedMotion ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={{ duration: DURATION.fast, ease: EASE_OUT }}
              />
            );
          })}
        </div>

        {/* Active label */}
        <span className="ml-3 flex-1 truncate text-left font-mono text-meta text-text-secondary">
          {activeItem ? getLabel(activeItem, labels) : `${completedCount}/${items.length}`}
        </span>

        {/* Expand icon */}
        <motion.svg
          className="ml-2 size-4 text-text-secondary"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: reducedMotion ? 0 : DURATION.fast, ease: EASE_OUT }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Expanded checklist panel with smooth animation */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            id={panelId}
            role="navigation"
            aria-label={labels.label}
            className="border-t border-border px-4 pb-4 pt-2"
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : DURATION.fast, ease: EASE_OUT }}
            style={{ overflow: 'hidden' }}
          >
            <ol className="flex flex-col gap-1">
              {items.map(item => {
                const displayLabel = getLabel(item, labels);
                const prevState = prevStatesRef.current.get(item.id);
                const justCompleted =
                  prevState !== undefined &&
                  prevState !== 'completed' &&
                  item.state === 'completed';

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onItemClick(item.sectionId);
                        setExpanded(false);
                      }}
                      aria-current={item.state === 'active' ? 'step' : undefined}
                      className={`relative flex w-full items-center gap-3 rounded-lg p-3 text-left font-mono text-label transition-colors ${
                        item.state === 'active'
                          ? 'bg-signal-primary/10 text-signal-primary'
                          : item.state === 'completed'
                            ? 'text-text-secondary'
                            : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <span
                        className="flex size-5 shrink-0 items-center justify-center"
                        aria-hidden="true"
                      >
                        {item.state === 'completed' ? (
                          <AnimatedCheckIconMobile animate={justCompleted} />
                        ) : item.state === 'active' ? (
                          <span className="rail-pulse size-2.5 rounded-full bg-signal-primary" />
                        ) : (
                          <span className="size-2.5 rounded-full border border-border" />
                        )}
                      </span>
                      <span className="relative">
                        {displayLabel}
                        {item.state === 'completed' && (
                          <motion.span
                            className="absolute inset-0 flex items-center"
                            aria-hidden="true"
                            initial={
                              justCompleted && !reducedMotion ? { scaleX: 0 } : { scaleX: 1 }
                            }
                            animate={{ scaleX: 1 }}
                            style={{ transformOrigin: 'left' }}
                            transition={
                              reducedMotion
                                ? { duration: 0 }
                                : { duration: RAIL_TIMING.strikeThrough, ease: EASE_OUT }
                            }
                          >
                            <span className="bg-text-secondary/50 block h-px w-full" />
                          </motion.span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
