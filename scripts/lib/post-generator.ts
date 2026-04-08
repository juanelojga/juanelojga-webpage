import type OpenAI from 'openai';
import { chat } from './github-models';

interface GenerationRules {
  wordsMin: number;
  wordsMax: number;
  tone: string;
  persona: string;
  avoid: string[];
}

interface GeneratedPost {
  title: string;
  content: string;
  tags: string[];
  summary: string;
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

Return a JSON object with these fields:
- "title": the post title (concise, opinionated)
- "content": the full markdown body (no frontmatter, no h1)
- "tags": array of 3-5 lowercase tags
- "summary": 1-2 sentence summary for the blog card`;

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

Return a JSON object with these fields:
- "title": Spanish title
- "content": Spanish markdown body (no frontmatter, no h1)
- "tags": array of 3-5 lowercase Spanish tags
- "summary": 1-2 sentence Spanish summary`;

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
