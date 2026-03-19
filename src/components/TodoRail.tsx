import { useEffect, useRef } from 'react';
import { motion, useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import type { TodoItem } from '../utils/todoRail';
import { RAIL_TIMING, EASE_OUT } from '../utils/animation';

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

/* ── Animated check icon with SVG path draw ──────────────────────── */

function AnimatedCheckIcon({ animate }: { animate: boolean }) {
  const reducedMotion = useFramerReducedMotion();
  return (
    <svg
      className="size-4 text-signal-primary"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <motion.path
        d="M3 8.5L6.5 12L13 4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={animate ? { pathLength: 1 } : { pathLength: 0 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : {
                duration: RAIL_TIMING.checkDraw,
                ease: EASE_OUT,
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }
        }
      />
    </svg>
  );
}

/* ── Rail item with micro-interactions ────────────────────────────── */

function RailItem({
  item,
  displayLabel,
  stateLabel,
  onItemClick,
  prevState,
}: {
  item: TodoItem;
  displayLabel: string;
  stateLabel: string;
  onItemClick: (sectionId: string) => void;
  prevState: TodoItem['state'] | undefined;
}) {
  const reducedMotion = useFramerReducedMotion();
  const justActivated =
    prevState !== undefined && prevState !== 'active' && item.state === 'active';
  const justCompleted =
    prevState !== undefined && prevState !== 'completed' && item.state === 'completed';

  return (
    <li>
      <button
        type="button"
        onClick={() => onItemClick(item.sectionId)}
        aria-current={item.state === 'active' ? 'step' : undefined}
        aria-label={`${displayLabel} — ${stateLabel}`}
        className={`group relative flex w-full items-center gap-3 rounded-lg p-3 text-left font-mono transition-colors ${
          item.state === 'active'
            ? 'bg-signal-primary/10 text-signal-primary'
            : item.state === 'completed'
              ? 'text-text-secondary hover:bg-surface-secondary'
              : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
        }`}
      >
        {/* Cursor sweep overlay */}
        {justActivated && !reducedMotion && (
          <motion.span
            className="bg-signal-primary/5 absolute inset-0 rounded-lg"
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={{ scaleX: [0, 1, 0] }}
            transition={{ duration: RAIL_TIMING.sweep, ease: EASE_OUT }}
            aria-hidden="true"
          />
        )}

        {/* State indicator */}
        <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
          {item.state === 'completed' ? (
            <AnimatedCheckIcon animate={justCompleted} />
          ) : item.state === 'active' ? (
            <span className="rail-pulse size-2.5 rounded-full bg-signal-primary" />
          ) : (
            <span className="size-2.5 rounded-full border border-border" />
          )}
        </span>

        {/* Label with strike-through animation */}
        <span className="relative text-label">
          {displayLabel}
          {item.state === 'completed' && (
            <motion.span
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
              initial={justCompleted && !reducedMotion ? { scaleX: 0 } : { scaleX: 1 }}
              animate={{ scaleX: 1 }}
              style={{ transformOrigin: 'left' }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : {
                      duration: RAIL_TIMING.strikeThrough,
                      delay:
                        RAIL_TIMING.sweep + RAIL_TIMING.checkDraw - RAIL_TIMING.sweepCheckOverlap,
                      ease: EASE_OUT,
                    }
              }
            >
              <span className="block h-px w-full bg-text-secondary opacity-50" />
            </motion.span>
          )}
          {item.state === 'completed' && <span className="opacity-60" aria-hidden="true" />}
        </span>
      </button>
    </li>
  );
}

export default function TodoRail({ items, labels, onItemClick }: Props) {
  // Track previous states for animation triggers
  const prevStatesRef = useRef<Map<string, TodoItem['state']>>(new Map());

  useEffect(() => {
    const map = new Map<string, TodoItem['state']>();
    items.forEach(item => map.set(item.id, item.state));
    // Defer update to allow render to read previous values
    const timer = setTimeout(() => {
      prevStatesRef.current = map;
    }, 0);
    return () => clearTimeout(timer);
  }, [items]);

  return (
    <nav
      aria-label={labels.label}
      className="hidden h-screen w-[280px] shrink-0 flex-col justify-center border-l border-border px-6 lg:sticky lg:top-0 lg:flex xl:w-[300px]"
    >
      <ol className="flex min-h-0 flex-col gap-1 overflow-y-auto">
        {items.map(item => {
          const labelProp = labelKeyMap[item.labelKey];
          const displayLabel = labelProp ? labels[labelProp] : item.labelKey;
          const stateLabel =
            item.state === 'active'
              ? labels.stateActive
              : item.state === 'completed'
                ? labels.stateCompleted
                : labels.statePending;

          return (
            <RailItem
              key={item.id}
              item={item}
              displayLabel={displayLabel as string}
              stateLabel={stateLabel}
              onItemClick={onItemClick}
              prevState={prevStatesRef.current.get(item.id)}
            />
          );
        })}
      </ol>
    </nav>
  );
}
