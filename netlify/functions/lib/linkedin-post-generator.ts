import { createClient, chat } from './github-models';

export interface BlogContent {
  title: string;
  summary: string;
  tags: string[];
  slug: string;
  body: string;
}

const SYSTEM_PROMPT = `You are a LinkedIn post writer for a software engineer's personal brand.

Write a LinkedIn post that summarizes the given blog post. Follow these rules:
- Length: between 100 and 300 words
- Include the blog URL at the end of the post, right before the hashtags, on its own line
- End with a discussion question to encourage engagement
- Use a conversational, professional tone — not salesy or generic
- Include relevant hashtags (3–5) at the end
- Output valid JSON with a single "post" field containing the full post text

Output format: { "post": "..." }`;

export async function generateLinkedInPost(blog: BlogContent, blogUrl: string): Promise<string> {
  const client = createClient();

  const userPrompt = `Blog title: ${blog.title}
Summary: ${blog.summary}
Tags: ${blog.tags.join(', ')}
Blog URL: ${blogUrl}

Full content:
${blog.body}`;

  const response = await chat(client, SYSTEM_PROMPT, userPrompt, 'gpt-4o');

  let parsed: { post: string };
  try {
    parsed = JSON.parse(response);
  } catch {
    throw new Error(`AI returned malformed JSON: ${response}`);
  }

  if (!parsed.post) {
    throw new Error('AI returned empty post content');
  }

  return parsed.post;
}
