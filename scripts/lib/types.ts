export const NEWS_CATEGORIES = [
  'software-development',
  'ai',
  'coding',
  'software-architecture',
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export interface NewsCandidate {
  headline: string;
  summary: string;
  category: NewsCategory;
  publishedAt: string;
  sourceUrl: string;
  sourceName: string;
  whyItMatters: string;
}

export interface ResearchSource {
  title: string;
  url: string;
  publisher: string;
  publishedAt?: string;
  sourceType: 'primary' | 'reporting' | 'analysis';
}

export interface ResearchFact {
  claim: string;
  sourceUrls: string[];
}

export interface ResearchBrief {
  story: NewsCandidate;
  angle: string;
  context: string;
  keyFacts: ResearchFact[];
  technicalImplications: string[];
  openQuestions: string[];
  sources: ResearchSource[];
}

export interface BlogHistoryEntry {
  topic: string;
  sourceUrls?: string[];
}

export interface ResearchOptions {
  lookbackDays: number;
  candidateCount: number;
  minimumSources: number;
  subjects: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface GeneratedPost {
  title: string;
  content: string;
  tags: string[];
  summary: string;
  faq: FaqItem[];
}
