import { motion, useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import type { TodoItem } from '../utils/todoRail';
import { RAIL_TIMING, EASE_OUT } from '../utils/animation';
import AnimatedCheckIcon from './AnimatedCheckIcon';

export interface RailItemProps {
  item: TodoItem;
  displayLabel: string;
  stateLabel: string;
  onItemClick: (sectionId: string) => void;
  prevState: TodoItem['state'] | undefined;
}

export default function RailItem({
  item,
  displayLabel,
  stateLabel,
  onItemClick,
  prevState,
}: RailItemProps) {
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
            <AnimatedCheckIcon animate={justCompleted} spring />
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
