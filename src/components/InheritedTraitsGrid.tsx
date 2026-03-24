import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../utils/useReducedMotion';
import { DURATION, EASE_OUT } from '../utils/animation';
import {
  INHERITANCE_TIMING,
  createTraitHoverEvent,
  createTraitUnhoverEvent,
} from '../utils/inheritanceAnimation';

interface Trait {
  label: string;
  evidence: string;
  origin: string;
}

interface Props {
  traits: Trait[];
  label: string;
}

export default function InheritedTraitsGrid({ traits, label }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [hoveredTrait, setHoveredTrait] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggle = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  const handleTraitHover = useCallback((traitLabel: string) => {
    setHoveredTrait(traitLabel);
    window.dispatchEvent(createTraitHoverEvent(traitLabel));
  }, []);

  const handleTraitUnhover = useCallback(() => {
    setHoveredTrait(null);
    window.dispatchEvent(createTraitUnhoverEvent());
  }, []);

  return (
    <div ref={sectionRef} role="group" aria-label={label}>
      <h4 className="mb-4 font-mono text-meta uppercase tracking-wider text-text-secondary">
        {label}
      </h4>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {traits.map((trait, idx) => {
          const isExpanded = expandedIndex === idx;
          const isDimmed = hoveredTrait !== null && hoveredTrait !== trait.label;
          return (
            <motion.button
              key={trait.label}
              type="button"
              onClick={() => toggle(idx)}
              onMouseEnter={() => handleTraitHover(trait.label)}
              onMouseLeave={handleTraitUnhover}
              onFocus={() => handleTraitHover(trait.label)}
              onBlur={handleTraitUnhover}
              aria-expanded={isExpanded}
              className={`group w-full rounded-lg border p-4 text-left transition-colors ${
                isExpanded
                  ? 'border-signal-secondary/40 bg-surface-secondary shadow-sm'
                  : 'border-border/60 hover:border-signal-secondary/30 hover:bg-surface-secondary/50 bg-surface-primary'
              } ${isDimmed ? 'inheritance-dimmed' : ''}`}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={
                isVisible
                  ? { opacity: isDimmed ? 0.5 : 1, y: 0 }
                  : reducedMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: 12 }
              }
              transition={{
                duration: reducedMotion ? DURATION.micro : DURATION.fast,
                ease: EASE_OUT,
                delay: reducedMotion ? 0 : idx * INHERITANCE_TIMING.traitStagger + 0.1,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-sm font-medium text-text-primary">
                  {trait.label}
                </span>
                <span
                  className="material-symbols-outlined shrink-0 text-base text-text-secondary transition-transform"
                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  aria-hidden="true"
                >
                  expand_more
                </span>
              </div>
              <span className="border-border/40 mt-1 inline-block rounded-full border px-2 py-0.5 font-mono text-xs text-text-secondary">
                {trait.origin}
              </span>
              <motion.div
                initial={false}
                animate={{
                  height: isExpanded ? 'auto' : 0,
                  opacity: isExpanded ? 1 : 0,
                }}
                transition={{
                  duration: reducedMotion ? DURATION.micro : DURATION.fast,
                  ease: EASE_OUT,
                }}
                className="overflow-hidden"
              >
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{trait.evidence}</p>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
