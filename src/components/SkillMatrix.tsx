import { useState, useEffect, useRef, useCallback } from 'react';
import { SKILL_CLUSTERS } from '../utils/skillMatrix';

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

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function ClusterIcon({ name }: { name: string }) {
  return (
    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
      {name}
    </span>
  );
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
      className={`flex min-h-screen items-center px-6 py-20 lg:px-12 xl:px-20 ${
        reducedMotion
          ? isVisible
            ? 'opacity-100'
            : 'opacity-0'
          : isVisible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-6 opacity-0'
      }`}
      style={{
        transition: reducedMotion
          ? 'opacity 0.15s ease-out'
          : 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Section header */}
        <div className="mb-12">
          <h2 id="skills-headline" className="font-mono text-section text-text-primary">
            {labels.sectionTitle}
          </h2>
          <p className="mt-2 max-w-xl text-body text-text-secondary">{labels.subtitle}</p>
        </div>

        {/* Desktop grid (≥1024px) */}
        <div className="hidden gap-6 lg:grid lg:grid-cols-2 xl:grid-cols-4">
          {SKILL_CLUSTERS.map((cluster, clusterIdx) => (
            <div
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
                  : 'hover:border-border/80'
              }`}
              style={{
                transitionDelay: reducedMotion ? '0ms' : `${clusterIdx * 80}ms`,
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

              {/* Skill chips */}
              <div className="flex flex-wrap gap-2">
                {cluster.skills.map((skill, skillIdx) => (
                  <span
                    key={skill}
                    className={`border-border/60 rounded-full border bg-surface-primary px-3 py-1 font-mono text-meta text-text-secondary transition-all ${
                      reducedMotion ? '' : 'duration-300'
                    } ${isVisible && !reducedMotion ? 'translate-y-0 opacity-100' : ''}`}
                    style={
                      !reducedMotion && isVisible
                        ? {
                            transitionDelay: `${clusterIdx * 80 + skillIdx * 40 + 200}ms`,
                          }
                        : !reducedMotion
                          ? { opacity: 0, transform: 'translateY(8px)' }
                          : undefined
                    }
                  >
                    {skill}
                  </span>
                ))}
              </div>

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
            </div>
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
      </div>
    </section>
  );
}
