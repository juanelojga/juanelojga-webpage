import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../utils/useReducedMotion';
import BlogCard from './BlogCard';
import type { BlogCardPost } from './BlogCard';
import { DURATION, EASE_OUT } from '../../utils/animation';

interface BlogLabels {
  filterAll: string;
  filterByTag: string;
  noPostsFound: string;
  readMore: string;
  readingTime: string;
  previousPage: string;
  nextPage: string;
  pageOf: string;
}

interface BlogIndexProps {
  posts: BlogCardPost[];
  tags: string[];
  lang: string;
  labels: BlogLabels;
  postsPerPage: number;
}

export default function BlogIndex({ posts, tags, lang, labels, postsPerPage }: BlogIndexProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reducedMotion = useReducedMotion();

  const filteredPosts = useMemo(() => {
    if (!activeTag) return posts;
    return posts.filter(p => p.tags.includes(activeTag));
  }, [posts, activeTag]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage));
  const page = Math.min(currentPage, totalPages);
  const paginatedPosts = filteredPosts.slice((page - 1) * postsPerPage, page * postsPerPage);

  const handleTagClick = (tag: string | null) => {
    setActiveTag(tag);
    setCurrentPage(1);
  };

  const pageLabel = labels.pageOf
    .replace('{current}', String(page))
    .replace('{total}', String(totalPages));

  return (
    <div>
      {/* Tag filter bar */}
      <nav
        aria-label={labels.filterByTag}
        className="mb-8 flex flex-wrap gap-2 overflow-x-auto pb-2"
      >
        <button
          onClick={() => handleTagClick(null)}
          className={`shrink-0 rounded-full px-4 py-1.5 font-mono text-meta font-medium transition-colors ${
            activeTag === null
              ? 'bg-signal-primary text-text-inverse'
              : 'border border-border bg-surface-secondary text-text-secondary hover:text-text-primary'
          }`}
        >
          {labels.filterAll}
        </button>
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`shrink-0 rounded-full px-4 py-1.5 font-mono text-meta font-medium transition-colors ${
              activeTag === tag
                ? 'bg-signal-primary text-text-inverse'
                : 'border border-border bg-surface-secondary text-text-secondary hover:text-text-primary'
            }`}
          >
            {tag}
          </button>
        ))}
      </nav>

      {/* Post grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTag ?? 'all'}-${page}`}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : DURATION.fast, ease: EASE_OUT }}
        >
          {paginatedPosts.length === 0 ? (
            <p className="py-12 text-center font-mono text-body text-text-secondary">
              {labels.noPostsFound}
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {paginatedPosts.map((post, i) => (
                <BlogCard
                  key={post.slug}
                  post={post}
                  lang={lang}
                  readMoreLabel={labels.readMore}
                  readingTimeLabel={labels.readingTime}
                  reducedMotion={reducedMotion}
                  index={i}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-border px-4 py-2 font-mono text-meta font-medium text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {labels.previousPage}
          </button>
          <span className="font-mono text-meta text-text-secondary">{pageLabel}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-border px-4 py-2 font-mono text-meta font-medium text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {labels.nextPage}
          </button>
        </nav>
      )}
    </div>
  );
}
