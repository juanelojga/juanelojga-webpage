import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProjectEntry } from '../utils/workLog';
import type { WorkLogLabels } from './WorkLog';
import { DURATION, EASE_OUT } from '../utils/animation';

export interface ProjectCardProps {
  project: ProjectEntry;
  isFeatured: boolean;
  labels: WorkLogLabels;
  lang: string;
  isVisible: boolean;
  reducedMotion: boolean;
  delay: number;
  entryIndex: number;
}

export default function ProjectCard({
  project,
  isFeatured,
  labels,
  lang,
  isVisible,
  reducedMotion,
  delay,
  entryIndex,
}: ProjectCardProps) {
  const [isTrayOpen, setIsTrayOpen] = useState(isFeatured);
  const [hoverDirection, setHoverDirection] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const cardRef = useRef<HTMLElement>(null);

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

  // Directional hover detection
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isFeatured) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      // Normalize to a subtle 2px shift
      const mag = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      setHoverDirection({ x: (dx / mag) * 2, y: (dy / mag) * 2 });
      setIsTrayOpen(true);
    },
    [isFeatured]
  );

  // Cascade reveal: odd entries slide from left, even from right
  const slideX = reducedMotion ? 0 : entryIndex % 2 === 0 ? -24 : 24;

  return (
    <motion.article
      ref={cardRef}
      aria-label={project.title}
      className={`group overflow-hidden rounded-xl border transition-shadow ${
        isFeatured
          ? 'border-signal-primary/30 col-span-full bg-surface-secondary shadow-lg'
          : 'bg-surface-secondary/50 hover:border-border/80 border-border hover:bg-surface-secondary hover:shadow-md'
      }`}
      initial={reducedMotion ? false : { opacity: 0, x: slideX }}
      animate={isVisible ? { opacity: 1, x: 0 } : reducedMotion ? {} : { opacity: 0, x: slideX }}
      whileHover={
        !isFeatured && !reducedMotion
          ? { x: hoverDirection.x, y: hoverDirection.y, transition: { duration: DURATION.fast } }
          : undefined
      }
      whileFocus={!isFeatured && !reducedMotion ? { scale: 1.01 } : undefined}
      transition={{
        duration: reducedMotion ? 0 : DURATION.slow,
        delay: reducedMotion ? 0 : delay / 1000,
        ease: EASE_OUT,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        if (!isFeatured) {
          setIsTrayOpen(false);
          setHoverDirection({ x: 0, y: 0 });
        }
      }}
    >
      <div
        className={`${isFeatured ? 'p-5 lg:p-8' : 'p-4 lg:p-6'} cursor-default`}
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
      <AnimatePresence initial={false}>
        {isTrayOpen && (
          <motion.div
            id={`card-tray-${project.slug}`}
            className="border-border/40 overflow-hidden border-t"
            aria-hidden={!isTrayOpen}
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : DURATION.fast, ease: EASE_OUT }}
          >
            <div className={`${isFeatured ? 'px-8 py-5' : 'px-6 py-4'}`}>
              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <span className="block font-mono text-meta text-text-secondary">
                    {labels.role}
                  </span>
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
