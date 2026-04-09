import type OpenAI from 'openai';
import { chat } from './github-models';

interface GenerationRules {
  wordsMin: number;
  wordsMax: number;
  tone: string;
  persona: string;
  avoid: string[];
}

interface FaqItem {
  question: string;
  answer: string;
}

interface GeneratedPost {
  title: string;
  content: string;
  tags: string[];
  summary: string;
  faq: FaqItem[];
}

export async function generateEnglishPost(
  client: OpenAI,
  topic: string,
  category: string,
  rules: GenerationRules
): Promise<GeneratedPost> {
  const systemPrompt = `You are ${rules.persona}. Write a technical blog post.
Your tone is: ${rules.tone}.

Rules:
- Write between ${rules.wordsMin} and ${rules.wordsMax} words
- Use markdown with ## for main sections and ### for subsections
- Include code examples where relevant (use real, practical code)
- Do NOT include the title as an h1 — it will be rendered separately
- Avoid: ${rules.avoid.join(', ')}

SEO & AEO (Answer Engine Optimization) rules:
- The "summary" field MUST be 120-160 characters, include the primary keyword, and work as both a meta description and a standalone AI answer snippet
- Use at least 2-3 question-based H2 headings that match common search queries (e.g., "How does X work?", "What is the difference between X and Y?", "Why should you use X?")
- Start each major section with a concise 1-2 sentence direct answer before elaborating — this is critical for featured snippets and AI citation
- Include a "## Key Takeaways" section near the top (after the first introductory section) with 3-5 bullet points summarizing the post
- End with a "## Frequently Asked Questions" section containing 3-5 Q&A pairs relevant to the topic. These must be genuine questions a reader would search for.
- Use definition patterns for key concepts: "X is..." or "X refers to..."
- Do NOT use filler phrases like "In this article, we will..." or "Let's dive in"

Return a JSON object with these fields:
- "title": the post title (concise, opinionated)
- "content": the full markdown body (no frontmatter, no h1)
- "tags": array of 3-5 lowercase tags
- "summary": 1-2 sentence summary (120-160 characters) for meta description and blog card
- "faq": array of {question, answer} objects (3-5 items matching the FAQ section in the content)`;

  const userPrompt = `Write a blog post about: ${topic}
Category: ${category}`;

  const response = await chat(client, systemPrompt, userPrompt);

  try {
    return JSON.parse(response);
  } catch {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse generated post as JSON');
  }
}

export async function generateSpanishPost(
  client: OpenAI,
  englishPost: GeneratedPost,
  rules: GenerationRules
): Promise<GeneratedPost> {
  const systemPrompt = `You are ${rules.persona}. Adapt the following English blog post into natural Spanish.
This is NOT a literal translation — adapt idioms, examples, and phrasing to feel native in Spanish.
Keep the same technical depth and code examples.
Keep the same SEO/AEO structure: question-based H2 headings, Key Takeaways section, and FAQ section.
The "summary" field MUST be 120-160 characters in Spanish.

Return a JSON object with these fields:
- "title": Spanish title
- "content": Spanish markdown body (no frontmatter, no h1)
- "tags": array of 3-5 lowercase Spanish tags
- "summary": 1-2 sentence Spanish summary (120-160 characters)
- "faq": array of {question, answer} objects in Spanish (matching the FAQ section in the content)`;

  const userPrompt = `English post to adapt:

Title: ${englishPost.title}

Content:
${englishPost.content}

Tags: ${englishPost.tags.join(', ')}
Summary: ${englishPost.summary}`;

  const response = await chat(client, systemPrompt, userPrompt);

  try {
    return JSON.parse(response);
  } catch {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse Spanish post as JSON');
  }
}
