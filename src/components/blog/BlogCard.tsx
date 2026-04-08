import { motion } from 'framer-motion';
import { DURATION, EASE_OUT } from '../../utils/animation';

export interface BlogCardPost {
  title: string;
  date: string;
  tags: string[];
  summary: string;
  slug: string;
  category: string;
  readingTime?: number;
}

interface BlogCardProps {
  post: BlogCardPost;
  lang: string;
  readMoreLabel: string;
  readingTimeLabel: string;
  reducedMotion: boolean;
  index: number;
}

export default function BlogCard({
  post,
  lang,
  readMoreLabel,
  readingTimeLabel,
  reducedMotion,
  index,
}: BlogCardProps) {
  const formattedDate = new Date(post.date).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const readingTime = readingTimeLabel.replace('{minutes}', String(post.readingTime ?? 1));

  return (
    <motion.article
      className="bg-surface-secondary/50 hover:border-signal-primary/30 group overflow-hidden rounded-xl border border-border transition-shadow hover:bg-surface-secondary hover:shadow-md"
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reducedMotion ? 0 : DURATION.normal,
        delay: reducedMotion ? 0 : index * 0.08,
        ease: EASE_OUT,
      }}
    >
      <a href={`/${lang}/blog/${post.slug}/`} className="block p-5 no-underline lg:p-6">
        {/* Category */}
        <span className="bg-signal-primary/15 mb-3 inline-block rounded-full px-3 py-0.5 font-mono text-meta font-medium text-signal-primary">
          {post.category}
        </span>

        {/* Title */}
        <h3 className="mb-2 font-mono text-label font-semibold text-text-primary transition-colors group-hover:text-signal-primary">
          {post.title}
        </h3>

        {/* Summary */}
        <p className="mb-4 line-clamp-3 text-meta leading-relaxed text-text-secondary">
          {post.summary}
        </p>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="border-border/60 rounded-full border bg-surface-primary px-2.5 py-0.5 font-mono text-meta text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer: date + reading time + read more */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 font-mono text-meta text-text-secondary">
            <time dateTime={post.date}>{formattedDate}</time>
            <span aria-hidden="true" className="text-border">
              |
            </span>
            <span>{readingTime}</span>
          </div>
          <span className="flex items-center gap-1 font-mono text-meta font-medium text-signal-primary opacity-0 transition-opacity group-hover:opacity-100">
            {readMoreLabel}
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
          </span>
        </div>
      </a>
    </motion.article>
  );
}
