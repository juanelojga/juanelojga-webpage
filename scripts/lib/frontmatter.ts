import type { FaqItem, ResearchSource } from './types';

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
  sources?: ResearchSource[];
}

function yamlQuote(value: string): string {
  return JSON.stringify(value);
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
  const tags = data.tags.map(yamlQuote).join(', ');
  let frontmatter = `---
title: ${yamlQuote(data.title)}
date: ${data.date}
tags: [${tags}]
summary: ${yamlQuote(data.summary)}
language: ${data.language}
slug: ${data.slug}
category: ${data.category}
draft: false
readingTime: ${data.readingTime}`;

  if (data.faq?.length) {
    frontmatter += '\nfaq:';
    for (const item of data.faq) {
      frontmatter += `\n  - question: ${yamlQuote(item.question)}`;
      frontmatter += `\n    answer: ${yamlQuote(item.answer)}`;
    }
  }

  if (data.sources?.length) {
    frontmatter += '\nsources:';
    for (const source of data.sources) {
      frontmatter += `\n  - title: ${yamlQuote(source.title)}`;
      frontmatter += `\n    url: ${yamlQuote(source.url)}`;
      frontmatter += `\n    publisher: ${yamlQuote(source.publisher)}`;
      if (source.publishedAt) {
        frontmatter += `\n    publishedAt: ${yamlQuote(source.publishedAt)}`;
      }
      frontmatter += `\n    sourceType: ${source.sourceType}`;
    }
  }

  frontmatter += '\n---';
  return frontmatter;
}

export function buildMarkdownFile(frontmatter: string, content: string): string {
  return `${frontmatter}\n\n${content}\n`;
}
