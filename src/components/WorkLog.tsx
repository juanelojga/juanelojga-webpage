import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CASE_STUDY_PROJECTS } from '../utils/workLog';
import { useReducedMotion } from '../utils/useReducedMotion';
import { DURATION, EASE_OUT } from '../utils/animation';
import ProjectCard from './ProjectCard';

export interface WorkLogLabels {
  sectionTitle: string;
  subtitle: string;
  featuredLabel: string;
  viewCaseStudy: string;
  role: string;
  duration: string;
  techStack: string;
}

interface Props {
  labels: WorkLogLabels;
  lang: string;
}

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

  return (
    <section
      ref={sectionRef}
      id="projects"
      aria-labelledby="projects-headline"
      className="flex min-h-screen items-center px-6 py-20 lg:px-12 xl:px-20"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Section header */}
        <motion.div
          className="mb-12"
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : reducedMotion ? {} : { opacity: 0, y: 24 }}
          transition={{ duration: reducedMotion ? 0 : DURATION.normal, ease: EASE_OUT }}
        >
          <h2 id="projects-headline" className="font-mono text-section text-text-primary">
            {labels.sectionTitle}
          </h2>
          <p className="mt-2 max-w-xl text-body text-text-secondary">{labels.subtitle}</p>
        </motion.div>

        {/* Work log entries — cascade layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {CASE_STUDY_PROJECTS.map((project, idx) => (
            <ProjectCard
              key={`project-${project.slug}`}
              project={project}
              isFeatured={!!project.featured}
              labels={labels}
              lang={lang}
              isVisible={isVisible}
              reducedMotion={reducedMotion}
              delay={idx * 100 + 200}
              entryIndex={idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
