import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../utils/useReducedMotion';
import { DURATION, EASE_OUT, STAGGER } from '../utils/animation';
import { INHERITANCE_EVENTS } from '../utils/inheritanceAnimation';

interface Override {
  label: string;
  description: string;
  proofMetric?: string;
  codeSnippet?: string;
  relatedTraits?: string[];
}

interface Props {
  overrides: Override[];
  label: string;
}

export default function OverrideCards({ overrides, label }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [linkedTrait, setLinkedTrait] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [pulsingIndex, setPulsingIndex] = useState<number | null>(null);
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

  // Listen for trait hover events from InheritedTraitsGrid
  useEffect(() => {
    const handleTraitHover = (e: Event) => {
      const detail = (e as CustomEvent<{ traitLabel: string }>).detail;
      setLinkedTrait(detail.traitLabel);
    };
    const handleTraitUnhover = () => {
      setLinkedTrait(null);
    };

    window.addEventListener(INHERITANCE_EVENTS.traitHover, handleTraitHover);
    window.addEventListener(INHERITANCE_EVENTS.traitUnhover, handleTraitUnhover);
    return () => {
      window.removeEventListener(INHERITANCE_EVENTS.traitHover, handleTraitHover);
      window.removeEventListener(INHERITANCE_EVENTS.traitUnhover, handleTraitUnhover);
    };
  }, []);

  const toggle = (index: number) => {
    const wasActive = activeIndex === index;
    setActiveIndex(prev => (prev === index ? null : index));

    // Trigger border pulse on activation (not deactivation)
    if (!wasActive && !reducedMotion) {
      setPulsingIndex(index);
      setTimeout(() => setPulsingIndex(null), 800);
    }
  };

  const isLinkedToTrait = (override: Override): boolean => {
    if (!linkedTrait || !override.relatedTraits) return false;
    return override.relatedTraits.includes(linkedTrait);
  };

  return (
    <div ref={sectionRef} role="group" aria-label={label}>
      <h4 className="mb-4 font-mono text-meta uppercase tracking-wider text-text-secondary">
        {label}
      </h4>
      <div className="grid gap-4">
        {overrides.map((override, idx) => {
          const isActive = activeIndex === idx;
          const isPulsing = pulsingIndex === idx;
          const isLinked = isLinkedToTrait(override);
          const isDimmed =
            (activeIndex !== null && !isActive) || (linkedTrait !== null && !isLinked);
          return (
            <motion.button
              key={override.label}
              type="button"
              onClick={() => toggle(idx)}
              aria-expanded={isActive}
              className={`group w-full rounded-xl border-2 p-5 text-left transition-colors ${
                isActive
                  ? 'border-signal-primary/50 bg-surface-secondary shadow-md'
                  : 'hover:border-signal-primary/25 hover:bg-surface-secondary/50 border-border bg-surface-primary'
              } ${isPulsing ? 'inheritance-border-pulse' : ''} ${
                isLinked ? 'inheritance-trait-linked' : ''
              }`}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              animate={
                isVisible
                  ? { opacity: isDimmed ? 0.5 : 1, y: 0 }
                  : reducedMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: 16 }
              }
              transition={{
                duration: reducedMotion ? DURATION.micro : DURATION.normal,
                ease: EASE_OUT,
                delay: reducedMotion ? 0 : idx * STAGGER.child + 0.2,
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-lg transition-colors ${
                      isActive ? 'text-signal-primary' : 'text-text-secondary'
                    }`}
                    aria-hidden="true"
                  >
                    auto_fix_high
                  </span>
                  <span
                    className={`font-mono text-sm font-semibold transition-colors sm:text-base ${
                      isActive ? 'text-signal-primary' : 'text-text-primary'
                    }`}
                  >
                    {override.label}
                  </span>
                </div>
                <span
                  className="material-symbols-outlined shrink-0 text-base text-text-secondary transition-transform"
                  style={{ transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  aria-hidden="true"
                >
                  expand_more
                </span>
              </div>

              {/* Expandable content */}
              <motion.div
                initial={false}
                animate={{
                  height: isActive ? 'auto' : 0,
                  opacity: isActive ? 1 : 0,
                }}
                transition={{
                  duration: reducedMotion ? DURATION.micro : DURATION.fast,
                  ease: EASE_OUT,
                }}
                className="overflow-hidden"
              >
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {override.description}
                </p>
                {override.proofMetric && (
                  <div className="border-signal-primary/30 bg-signal-primary/10 mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1">
                    <span
                      className="material-symbols-outlined text-sm text-signal-primary"
                      aria-hidden="true"
                    >
                      verified
                    </span>
                    <span className="font-mono text-xs font-medium text-signal-primary">
                      {override.proofMetric}
                    </span>
                  </div>
                )}
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
