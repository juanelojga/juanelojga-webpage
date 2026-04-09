interface FaqItem {
  question: string;
  answer: string;
}

interface FrontmatterData {
  title: string;
  date: string;
  tags: string[];
  summary: string;
  language: 'en' | 'es';
  slug: string;
  category: string;
  readingTime: number;
  faq?: FaqItem[];
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function buildFrontmatter(data: FrontmatterData): string {
  const tags = data.tags.map(t => `"${t}"`).join(', ');
  let frontmatter = `---
title: "${data.title.replace(/"/g, '\\"')}"
date: ${data.date}
tags: [${tags}]
summary: "${data.summary.replace(/"/g, '\\"')}"
language: ${data.language}
slug: ${data.slug}
category: ${data.category}
draft: false
readingTime: ${data.readingTime}`;

  if (data.faq && data.faq.length > 0) {
    frontmatter += '\nfaq:';
    for (const item of data.faq) {
      frontmatter += `\n  - question: "${item.question.replace(/"/g, '\\"')}"`;
      frontmatter += `\n    answer: "${item.answer.replace(/"/g, '\\"')}"`;
    }
  }

  frontmatter += '\n---';
  return frontmatter;
}

export function buildMarkdownFile(frontmatter: string, content: string): string {
  return `${frontmatter}\n\n${content}\n`;
}
