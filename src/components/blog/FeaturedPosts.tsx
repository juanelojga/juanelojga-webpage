import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../utils/useReducedMotion';
import { DURATION, EASE_OUT } from '../../utils/animation';
import BlogCard, { type BlogCardPost } from './BlogCard';

export interface FeaturedPostsLabels {
  sectionTitle: string;
  subtitle: string;
  viewAll: string;
  readMore: string;
  readingTime: string;
  noPosts: string;
}

interface Props {
  labels: FeaturedPostsLabels;
  lang: string;
  posts: BlogCardPost[];
}

export default function FeaturedPosts({ labels, lang, posts }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="blog"
      aria-labelledby="blog-headline"
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
          <h2 id="blog-headline" className="font-mono text-section text-text-primary">
            {labels.sectionTitle}
          </h2>
          <p className="mt-2 max-w-xl text-body text-text-secondary">{labels.subtitle}</p>
        </motion.div>

        {posts.length > 0 ? (
          <>
            {/* Post grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, idx) => (
                <BlogCard
                  key={post.slug}
                  post={post}
                  lang={lang}
                  readMoreLabel={labels.readMore}
                  readingTimeLabel={labels.readingTime}
                  reducedMotion={reducedMotion}
                  index={isVisible ? idx : -1}
                />
              ))}
            </div>

            {/* View all CTA */}
            <motion.div
              className="mt-10 text-center"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : reducedMotion ? {} : { opacity: 0 }}
              transition={{
                duration: reducedMotion ? 0 : DURATION.normal,
                delay: reducedMotion ? 0 : posts.length * 0.08 + 0.2,
                ease: EASE_OUT,
              }}
            >
              <a
                href={`/${lang}/blog/`}
                className="border-signal-primary/50 hover:bg-signal-primary/10 inline-flex items-center gap-2 rounded-lg border px-6 py-3 font-mono text-meta font-medium text-signal-primary transition-all hover:border-signal-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-primary"
              >
                {labels.viewAll}
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </motion.div>
          </>
        ) : (
          <motion.p
            className="text-body text-text-secondary"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : reducedMotion ? {} : { opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : DURATION.normal, ease: EASE_OUT }}
          >
            {labels.noPosts}
          </motion.p>
        )}
      </div>
    </section>
  );
}
