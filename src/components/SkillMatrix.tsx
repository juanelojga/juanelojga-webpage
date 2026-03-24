import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SKILL_CLUSTERS } from '../utils/skillMatrix';
import { useReducedMotion } from '../utils/useReducedMotion';
import { DURATION, EASE_OUT, STAGGER } from '../utils/animation';
import ClusterIcon from './ClusterIcon';

export interface SkillMatrixLabels {
  sectionTitle: string;
  subtitle: string;
  categories: Record<string, string>;
  proofPoints: Record<string, string>;
  expandLabel: string;
  collapseLabel: string;
}

interface Props {
  labels: SkillMatrixLabels;
  lang: string;
}

export default function SkillMatrix({ labels }: Props) {
  const [focusedCluster, setFocusedCluster] = useState<string | null>(null);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  // IntersectionObserver for section reveal
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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleMobileCluster = useCallback((id: string) => {
    setExpandedMobile(prev => (prev === id ? null : id));
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      aria-labelledby="skills-headline"
      className="flex min-h-screen items-center px-6 py-20 lg:px-12 xl:px-20"
    >
      <motion.div
        className="mx-auto w-full max-w-6xl"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : DURATION.slow, ease: EASE_OUT }}
      >
        {/* Section header */}
        <motion.div
          className="mb-12"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: reducedMotion ? 0 : DURATION.slow, ease: EASE_OUT }}
        >
          <h2 id="skills-headline" className="font-mono text-section text-text-primary">
            {labels.sectionTitle}
          </h2>
          <p className="mt-2 max-w-xl text-body text-text-secondary">{labels.subtitle}</p>
        </motion.div>

        {/* Desktop grid (≥1024px) */}
        <div className="hidden gap-6 lg:grid lg:grid-cols-2 xl:grid-cols-4">
          {SKILL_CLUSTERS.map((cluster, clusterIdx) => (
            <motion.div
              key={cluster.id}
              onMouseEnter={() => setFocusedCluster(cluster.id)}
              onMouseLeave={() => setFocusedCluster(null)}
              onFocus={() => setFocusedCluster(cluster.id)}
              onBlur={() => setFocusedCluster(null)}
              tabIndex={0}
              role="group"
              aria-label={labels.categories[cluster.id]}
              className={`bg-surface-secondary/50 cursor-default rounded-xl border border-border p-6 transition-all duration-300 ${
                focusedCluster === cluster.id
                  ? 'border-signal-primary/40 shadow-signal-primary/5 bg-surface-secondary shadow-lg'
                  : focusedCluster !== null
                    ? 'opacity-70'
                    : 'hover:border-border/80'
              }`}
              initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.97 }}
              animate={
                isVisible
                  ? {
                      opacity: focusedCluster !== null && focusedCluster !== cluster.id ? 0.7 : 1,
                      y: 0,
                      scale: 1,
                    }
                  : {}
              }
              transition={{
                duration: reducedMotion ? 0 : DURATION.slow,
                delay: reducedMotion ? 0 : clusterIdx * STAGGER.cluster,
                ease: EASE_OUT,
              }}
            >
              {/* Cluster header */}
              <div className="mb-4 flex items-center gap-3">
                <span
                  className={`flex size-9 items-center justify-center rounded-lg transition-colors duration-300 ${
                    focusedCluster === cluster.id
                      ? 'bg-signal-primary/15 text-signal-primary'
                      : 'bg-surface-tertiary text-text-secondary'
                  }`}
                >
                  <ClusterIcon name={cluster.icon} />
                </span>
                <h3 className="font-mono text-label font-semibold uppercase tracking-wider text-text-primary">
                  {labels.categories[cluster.id]}
                </h3>
              </div>

              {/* Skill chips with pulse on cluster hover */}
              <motion.div
                className="flex flex-wrap gap-2"
                animate={
                  focusedCluster === cluster.id && !reducedMotion ? { gap: '6px' } : { gap: '8px' }
                }
                transition={{ duration: DURATION.fast, ease: EASE_OUT }}
              >
                {cluster.skills.map((skill, skillIdx) => (
                  <motion.span
                    key={skill}
                    className="border-border/60 rounded-full border bg-surface-primary px-3 py-1 font-mono text-meta text-text-secondary"
                    initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
                    animate={
                      isVisible
                        ? {
                            opacity: 1,
                            scale:
                              focusedCluster === cluster.id && !reducedMotion ? [1, 1.05, 1] : 1,
                          }
                        : {}
                    }
                    transition={{
                      duration: reducedMotion ? 0 : DURATION.normal,
                      delay: reducedMotion
                        ? 0
                        : clusterIdx * STAGGER.cluster + skillIdx * STAGGER.chip + 0.2,
                      ease: EASE_OUT,
                    }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </motion.div>

              {/* Proof point (revealed on hover/focus) */}
              <div
                className={`mt-4 overflow-hidden transition-all duration-300 ${
                  focusedCluster === cluster.id ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
                }`}
                aria-hidden={focusedCluster !== cluster.id}
              >
                <p className="border-border/40 border-t pt-3 text-meta leading-relaxed text-text-secondary">
                  {labels.proofPoints[cluster.id]}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile accordion (<1024px) */}
        <div className="flex flex-col gap-3 lg:hidden">
          {SKILL_CLUSTERS.map(cluster => {
            const isExpanded = expandedMobile === cluster.id;
            return (
              <div
                key={cluster.id}
                className="bg-surface-secondary/50 overflow-hidden rounded-xl border border-border"
              >
                <button
                  type="button"
                  onClick={() => toggleMobileCluster(cluster.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`skills-panel-${cluster.id}`}
                  className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-surface-secondary"
                >
                  <span
                    className={`flex size-9 items-center justify-center rounded-lg transition-colors ${
                      isExpanded
                        ? 'bg-signal-primary/15 text-signal-primary'
                        : 'bg-surface-tertiary text-text-secondary'
                    }`}
                  >
                    <ClusterIcon name={cluster.icon} />
                  </span>
                  <span className="flex-1 font-mono text-label font-semibold uppercase tracking-wider text-text-primary">
                    {labels.categories[cluster.id]}
                  </span>
                  <span className="mr-1 font-mono text-meta text-text-secondary">
                    {cluster.skills.length}
                  </span>
                  <svg
                    className={`size-4 text-text-secondary transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div
                    id={`skills-panel-${cluster.id}`}
                    className="border-border/40 border-t px-4 pb-4 pt-3"
                  >
                    <div className="flex flex-wrap gap-2">
                      {cluster.skills.map(skill => (
                        <span
                          key={skill}
                          className="border-border/60 rounded-full border bg-surface-primary px-3 py-1.5 font-mono text-meta text-text-secondary"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-meta leading-relaxed text-text-secondary">
                      {labels.proofPoints[cluster.id]}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
