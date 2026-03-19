import { useState, useEffect, useRef, useCallback } from 'react';
import { WORK_LOG_ENTRIES, type ProjectEntry, type ExperienceEntry } from '../utils/workLog';

export interface WorkLogLabels {
  sectionTitle: string;
  subtitle: string;
  featuredLabel: string;
  viewCaseStudy: string;
  role: string;
  duration: string;
  techStack: string;
  milestone: string;
}

interface Props {
  labels: WorkLogLabels;
  lang: string;
}

/* ------------------------------------------------------------------ */
/*  useReducedMotion                                                    */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  MilestoneMarker                                                    */
/* ------------------------------------------------------------------ */

interface MilestoneMarkerProps {
  entry: ExperienceEntry;
  milestoneLabel: string;
  isVisible: boolean;
  reducedMotion: boolean;
  delay: number;
}

function MilestoneMarker({
  entry,
  milestoneLabel,
  isVisible,
  reducedMotion,
  delay,
}: MilestoneMarkerProps) {
  return (
    <div
      role="separator"
      aria-label={`${milestoneLabel}: ${entry.role} at ${entry.company}`}
      className="flex items-center gap-4 py-4"
      style={{
        transition: reducedMotion ? 'opacity 0.15s ease-out' : 'opacity 0.6s ease-out',
        transitionDelay: reducedMotion ? '0ms' : `${delay}ms`,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Completed checkpoint */}
      <span className="bg-signal-primary/10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-signal-primary">
        <svg
          className="size-3 text-signal-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>

      {/* Label */}
      <div className="border-border/40 flex flex-1 items-baseline gap-2 border-b pb-1">
        <span className="font-mono text-meta font-medium text-text-primary">{entry.role}</span>
        <span className="font-mono text-meta text-text-secondary">@ {entry.company}</span>
        <span className="ml-auto font-mono text-meta text-text-secondary">{entry.duration}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ProjectCard                                                        */
/* ------------------------------------------------------------------ */

interface ProjectCardProps {
  project: ProjectEntry;
  isFeatured: boolean;
  labels: WorkLogLabels;
  lang: string;
  isVisible: boolean;
  reducedMotion: boolean;
  delay: number;
}

function ProjectCard({
  project,
  isFeatured,
  labels,
  lang,
  isVisible,
  reducedMotion,
  delay,
}: ProjectCardProps) {
  const [isTrayOpen, setIsTrayOpen] = useState(isFeatured);

  const handleToggleTray = useCallback(() => {
    if (!isFeatured) setIsTrayOpen(prev => !prev);
  }, [isFeatured]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isFeatured && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        setIsTrayOpen(prev => !prev);
      }
    },
    [isFeatured]
  );

  return (
    <article
      aria-label={project.title}
      className={`group overflow-hidden rounded-xl border transition-all ${
        reducedMotion ? 'duration-150' : 'duration-500'
      } ${
        isFeatured
          ? 'border-signal-primary/30 col-span-full bg-surface-secondary shadow-lg'
          : 'bg-surface-secondary/50 hover:border-border/80 border-border hover:bg-surface-secondary hover:shadow-md'
      }`}
      style={{
        transition: reducedMotion
          ? 'opacity 0.15s ease-out'
          : `opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)`,
        transitionDelay: reducedMotion ? '0ms' : `${delay}ms`,
        opacity: isVisible ? 1 : 0,
        transform: reducedMotion ? undefined : isVisible ? 'translateY(0)' : 'translateY(24px)',
      }}
      onMouseEnter={() => !isFeatured && setIsTrayOpen(true)}
      onMouseLeave={() => !isFeatured && setIsTrayOpen(false)}
    >
      <div
        className={`${isFeatured ? 'p-8' : 'p-6'} cursor-default`}
        onClick={handleToggleTray}
        onKeyDown={handleKeyDown}
        tabIndex={isFeatured ? undefined : 0}
        role={isFeatured ? undefined : 'button'}
        aria-expanded={isFeatured ? undefined : isTrayOpen}
        aria-controls={isFeatured ? undefined : `card-tray-${project.slug}`}
      >
        {/* Header row */}
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="flex-1">
            {isFeatured && (
              <span className="bg-signal-primary/15 mb-2 inline-block rounded-full px-3 py-0.5 font-mono text-meta font-medium text-signal-primary">
                {labels.featuredLabel}
              </span>
            )}
            <h3
              className={`font-mono font-semibold text-text-primary ${
                isFeatured ? 'text-subsection' : 'text-label'
              }`}
            >
              {project.title}
            </h3>
          </div>
          {!isFeatured && (
            <svg
              className={`mt-1 size-4 shrink-0 text-text-secondary transition-transform duration-200 ${
                isTrayOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>

        {/* Description */}
        <p
          className={`leading-relaxed text-text-secondary ${
            isFeatured ? 'text-body' : 'text-meta'
          }`}
        >
          {project.description}
        </p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map(tag => (
            <span
              key={tag}
              className="border-border/60 rounded-full border bg-surface-primary px-3 py-1 font-mono text-meta text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Metadata tray */}
      <div
        id={`card-tray-${project.slug}`}
        className={`border-border/40 border-t transition-all ${
          reducedMotion ? 'duration-150' : 'duration-300'
        } ${isTrayOpen ? 'max-h-80 opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}
        aria-hidden={!isTrayOpen}
      >
        <div className={`${isFeatured ? 'px-8 py-5' : 'px-6 py-4'}`}>
          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <span className="block font-mono text-meta text-text-secondary">{labels.role}</span>
              <span className="font-mono text-meta font-medium text-text-primary">
                {project.metadata.role}
              </span>
            </div>
            <div>
              <span className="block font-mono text-meta text-text-secondary">
                {labels.duration}
              </span>
              <span className="font-mono text-meta font-medium text-text-primary">
                {project.metadata.duration}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block font-mono text-meta text-text-secondary">
                {labels.techStack}
              </span>
              <span className="font-mono text-meta font-medium text-text-primary">
                {project.metadata.techStack.slice(0, 4).join(', ')}
              </span>
            </div>
          </div>

          {/* Case study CTA */}
          <a
            href={`/${lang}/projects/${project.slug}`}
            className={`mt-4 inline-flex items-center gap-2 font-mono text-meta font-medium transition-colors ${
              isFeatured
                ? 'border-signal-primary/50 bg-signal-primary/10 hover:bg-signal-primary/20 rounded-lg border px-4 py-2 text-signal-primary hover:border-signal-primary'
                : 'hover:text-signal-primary-vivid text-signal-primary'
            }`}
          >
            {labels.viewCaseStudy}
            <svg
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  WorkLog (main section)                                             */
/* ------------------------------------------------------------------ */

export default function WorkLog({ labels, lang }: Props) {
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

  // Separate entries by kind for layout
  let entryIndex = 0;

  return (
    <section
      ref={sectionRef}
      id="projects"
      aria-labelledby="projects-headline"
      className="flex min-h-screen items-center px-6 py-20 lg:px-12 xl:px-20"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Section header */}
        <div
          className="mb-12"
          style={{
            transition: reducedMotion
              ? 'opacity 0.15s ease-out'
              : 'opacity 0.6s ease-out, transform 0.6s ease-out',
            opacity: isVisible ? 1 : 0,
            transform: reducedMotion ? undefined : isVisible ? 'translateY(0)' : 'translateY(24px)',
          }}
        >
          <h2 id="projects-headline" className="font-mono text-section text-text-primary">
            {labels.sectionTitle}
          </h2>
          <p className="mt-2 max-w-xl text-body text-text-secondary">{labels.subtitle}</p>
        </div>

        {/* Work log entries — cascade layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {WORK_LOG_ENTRIES.map(entry => {
            const delay = entryIndex * 100 + 200;
            entryIndex++;

            if (entry.kind === 'milestone') {
              return (
                <div key={`milestone-${entry.data.id}`} className="col-span-full">
                  <MilestoneMarker
                    entry={entry.data}
                    milestoneLabel={labels.milestone}
                    isVisible={isVisible}
                    reducedMotion={reducedMotion}
                    delay={delay}
                  />
                </div>
              );
            }

            return (
              <ProjectCard
                key={`project-${entry.data.slug}`}
                project={entry.data}
                isFeatured={!!entry.data.featured}
                labels={labels}
                lang={lang}
                isVisible={isVisible}
                reducedMotion={reducedMotion}
                delay={delay}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
