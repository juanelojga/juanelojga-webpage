import type { OpenRouterClient } from './openrouter';
import type { GeneratedPost, ResearchBrief } from './types';

interface GenerationRules {
  wordsMin: number;
  wordsMax: number;
  tone: string;
  persona: string;
  avoid: string[];
}

function wordCount(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

function markdownUrls(content: string): string[] {
  return [...content.matchAll(/\[[^\]]+\]\((https:\/\/[^\s)]+)\)/g)].map(match => match[1]);
}

function validateGeneratedPost(
  post: GeneratedPost,
  brief: ResearchBrief,
  rules: GenerationRules
): GeneratedPost {
  if (!post?.title?.trim() || !post.content?.trim())
    throw new Error('Generated post is incomplete');
  if (!Array.isArray(post.tags) || post.tags.length < 3 || post.tags.length > 5) {
    throw new Error('Generated post must have three to five tags');
  }
  if (post.summary.length < 120 || post.summary.length > 160) {
    throw new Error('Generated summary must be 120–160 characters');
  }
  if (!Array.isArray(post.faq) || post.faq.length < 3 || post.faq.length > 5) {
    throw new Error('Generated post must have three to five FAQ items');
  }

  const count = wordCount(post.content);
  if (count < rules.wordsMin || count > rules.wordsMax) {
    throw new Error(
      `Generated post has ${count} words; expected ${rules.wordsMin}–${rules.wordsMax}`
    );
  }

  const allowedUrls = new Set(brief.sources.map(source => source.url));
  const citedUrls = markdownUrls(post.content);
  if (new Set(citedUrls).size < 2) throw new Error('Generated post must cite at least two sources');
  for (const url of citedUrls) {
    if (!allowedUrls.has(url)) throw new Error(`Generated post cites an unresearched URL: ${url}`);
  }

  return post;
}

async function generateWithRetry(
  client: OpenRouterClient,
  systemPrompt: string,
  userPrompt: string,
  brief: ResearchBrief,
  rules: GenerationRules
): Promise<GeneratedPost> {
  let validationError = '';

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const response = await client.completeJson<GeneratedPost>({
      systemPrompt,
      userPrompt: `${userPrompt}${
        validationError
          ? `\n\nYour previous response failed validation: ${validationError}. Correct every issue.`
          : ''
      }`,
      temperature: 0.6,
      maxTokens: 16000,
      reasoningEffort: 'low',
    });

    try {
      return validateGeneratedPost(response.data, brief, rules);
    } catch (error) {
      validationError = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ Generation attempt ${attempt} failed validation: ${validationError}`);
    }
  }

  throw new Error(`Could not generate a valid post after two attempts: ${validationError}`);
}

export async function generateEnglishPost(
  client: OpenRouterClient,
  brief: ResearchBrief,
  category: string,
  rules: GenerationRules
): Promise<GeneratedPost> {
  const sourceList = brief.sources.map(source => `- ${source.title}: ${source.url}`).join('\n');
  const systemPrompt = `You are ${rules.persona}. Write a technical blog post based strictly on the supplied research brief.
Your tone is: ${rules.tone}.

Grounding rules:
- Treat the research brief as the complete evidence set; do not add factual claims from memory
- Cite factual claims with descriptive inline Markdown links to the supplied source URLs
- Never invent a source, URL, quote, benchmark, date, or implementation detail
- Clearly label uncertainty, analysis, and open questions
- Do not reproduce long passages from sources; synthesize in your own words

Writing rules:
- Write between ${rules.wordsMin} and ${rules.wordsMax} words
- Use markdown with ## for main sections and ### for subsections
- Include practical technical examples only when supported by the research
- Do NOT include the title as an h1—it is rendered separately
- Avoid: ${rules.avoid.join(', ')}
- The summary must be 120–160 characters and include the primary keyword
- Include 2–3 question-based H2 headings
- Start major sections with a concise direct answer
- Include a ## Key Takeaways section near the top with 3–5 bullets
- End with a ## Frequently Asked Questions section containing 3–5 Q&A pairs
- Do not add a Sources section; the page renders the structured sources separately

Return JSON with title, content, tags (3–5 lowercase tags), summary, and faq (3–5 {question, answer} objects).`;

  const userPrompt = `Category: ${category}

Research brief:
${JSON.stringify(brief, null, 2)}

Allowed citation URLs:
${sourceList}`;

  return generateWithRetry(client, systemPrompt, userPrompt, brief, rules);
}

export async function generateSpanishPost(
  client: OpenRouterClient,
  englishPost: GeneratedPost,
  brief: ResearchBrief,
  rules: GenerationRules
): Promise<GeneratedPost> {
  const systemPrompt = `You are ${rules.persona}. Adapt the supplied English post into natural Spanish.
This is not a literal translation. Preserve its technical accuracy, nuance, code, and inline source links.
Do not introduce facts or URLs that are absent from the English post and research brief.
Keep the same SEO/AEO structure, question-based H2 headings, Key Takeaways section, and FAQ section.
Write between ${rules.wordsMin} and ${rules.wordsMax} words. The summary must be 120–160 Spanish characters.
Do not add a Sources section; the page renders the structured sources separately.

Return JSON with title, content, tags (3–5 lowercase Spanish tags), summary, and faq (3–5 {question, answer} objects).`;

  const userPrompt = `English post:
${JSON.stringify(englishPost, null, 2)}

Research brief:
${JSON.stringify(brief, null, 2)}`;

  return generateWithRetry(client, systemPrompt, userPrompt, brief, rules);
}
