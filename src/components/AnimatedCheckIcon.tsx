import { motion, useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import { RAIL_TIMING, EASE_OUT } from '../utils/animation';

interface Props {
  animate: boolean;
  spring?: boolean;
}

export default function AnimatedCheckIcon({ animate, spring = false }: Props) {
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
            : spring
              ? {
                  duration: RAIL_TIMING.checkDraw,
                  ease: EASE_OUT,
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }
              : { duration: RAIL_TIMING.checkDraw, ease: EASE_OUT }
        }
      />
    </svg>
  );
}
