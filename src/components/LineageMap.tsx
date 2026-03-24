import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../utils/useReducedMotion';
import { DURATION, EASE_OUT } from '../utils/animation';

interface Props {
  parentName: string;
  childName: string;
  traits: string[];
  overrides: string[];
  compact?: boolean;
}

interface NodeDef {
  label: string;
  type: 'parent' | 'trait' | 'override' | 'child';
}

export default function LineageMap({
  parentName,
  childName,
  traits,
  overrides,
  compact = false,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const mapRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = mapRef.current;
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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const nodes: NodeDef[] = [
    { label: parentName, type: 'parent' },
    ...traits.map(t => ({ label: t, type: 'trait' as const })),
    ...overrides.map(o => ({ label: o, type: 'override' as const })),
    { label: childName, type: 'child' },
  ];

  const nodeStyles: Record<NodeDef['type'], string> = {
    parent: 'border-signal-secondary/40 bg-surface-tertiary/30 text-text-primary',
    trait: 'border-border/60 bg-surface-primary text-text-secondary',
    override: 'border-signal-primary/30 bg-signal-primary/5 text-signal-primary',
    child: 'border-signal-primary/50 bg-surface-secondary text-text-primary',
  };

  const dotStyles: Record<NodeDef['type'], string> = {
    parent: 'bg-signal-secondary',
    trait: 'bg-border',
    override: 'bg-signal-primary',
    child: 'bg-signal-primary',
  };

  if (compact) {
    return (
      <nav
        ref={mapRef}
        aria-label="Class lineage"
        className="bg-surface-secondary/50 rounded-xl border border-border p-4"
      >
        <ol className="flex flex-wrap items-center gap-2">
          {nodes.map((node, idx) => (
            <li key={node.label} className="flex items-center gap-2">
              <motion.span
                className={`inline-block rounded-full border px-3 py-1 font-mono text-xs ${nodeStyles[node.type]}`}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : undefined}
                transition={{
                  duration: reducedMotion ? DURATION.micro : DURATION.fast,
                  ease: EASE_OUT,
                  delay: reducedMotion ? 0 : idx * 0.05,
                }}
              >
                {node.label}
              </motion.span>
              {idx < nodes.length - 1 && (
                <span className="text-text-secondary/40" aria-hidden="true">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  return (
    <nav ref={mapRef} aria-label="Class lineage">
      <ol className="relative space-y-0">
        {nodes.map((node, idx) => (
          <li key={node.label} className="relative flex items-start gap-3 pb-4 last:pb-0">
            {/* Vertical connector line */}
            {idx < nodes.length - 1 && (
              <div
                className="bg-border/40 absolute left-[7px] top-5 h-full w-px"
                aria-hidden="true"
              />
            )}

            {/* Node dot */}
            <motion.div
              className={`relative z-10 mt-1.5 size-[15px] shrink-0 rounded-full border-2 border-surface-primary ${dotStyles[node.type]}`}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : undefined}
              transition={{
                duration: reducedMotion ? DURATION.micro : DURATION.fast,
                ease: EASE_OUT,
                delay: reducedMotion ? 0 : idx * 0.08,
              }}
            />

            {/* Node label */}
            <motion.div
              className={`rounded-lg border px-3 py-2 ${nodeStyles[node.type]}`}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -8 }}
              animate={isVisible ? { opacity: 1, x: 0 } : undefined}
              transition={{
                duration: reducedMotion ? DURATION.micro : DURATION.fast,
                ease: EASE_OUT,
                delay: reducedMotion ? 0 : idx * 0.08 + 0.05,
              }}
            >
              <span className="font-mono text-xs leading-tight">{node.label}</span>
              {node.type === 'parent' && (
                <span className="ml-2 font-mono text-[10px] uppercase text-text-secondary">
                  base
                </span>
              )}
              {node.type === 'override' && (
                <span className="ml-2 font-mono text-[10px] uppercase text-signal-primary">
                  override
                </span>
              )}
            </motion.div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
