import type { OpenRouterClient } from './openrouter';
import { coerceString, coerceStringArray } from './repair';
import { GENERATED_POST_SCHEMA } from './schemas';
import { isHttpsUrl, normalizeUrl } from './urls';
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

// Prompt a ceiling below the hard validation cap: models routinely overshoot
// their target by a few percent, and Spanish adaptations run longer than the
// English source they are based on.
function promptWordCeiling(rules: GenerationRules): number {
  return Math.max(rules.wordsMin, Math.round(rules.wordsMax * 0.9));
}

function repairGeneratedPost(raw: unknown): GeneratedPost {
  const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const faq = (Array.isArray(record.faq) ? record.faq : [])
    .map(item => {
      const entry = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      return { question: coerceString(entry.question), answer: coerceString(entry.answer) };
    })
    .filter(item => item.question && item.answer);

  return {
    title: coerceString(record.title),
    content: typeof record.content === 'string' ? record.content : coerceString(record.content),
    tags: coerceStringArray(record.tags).map(tag => tag.toLowerCase()),
    summary: coerceString(record.summary),
    faq,
  };
}

function validateGeneratedPost(
  post: GeneratedPost,
  brief: ResearchBrief,
  rules: GenerationRules
): GeneratedPost {
  if (!post?.title?.trim() || !post.content?.trim())
    throw new Error('Generated post is incomplete');

  // Collect every problem so one retry can fix them all; reporting only the
  // first lets the model ping-pong between fixing one flaw and reintroducing another.
  const issues: string[] = [];
  if (!Array.isArray(post.tags) || post.tags.length < 3 || post.tags.length > 5) {
    issues.push('Generated post must have three to five tags');
  }
  if (post.summary.length < 120 || post.summary.length > 160) {
    issues.push('Generated summary must be 120–160 characters');
  }
  if (!Array.isArray(post.faq) || post.faq.length < 3 || post.faq.length > 5) {
    issues.push('Generated post must have three to five FAQ items');
  }

  const count = wordCount(post.content);
  if (count < rules.wordsMin || count > rules.wordsMax) {
    const adjustment =
      count > rules.wordsMax
        ? `remove at least ${count - rules.wordsMax} words`
        : `add at least ${rules.wordsMin - count} words`;
    issues.push(
      `Generated post has ${count} words; expected ${rules.wordsMin}–${rules.wordsMax} (${adjustment})`
    );
  }

  const allowedUrls = new Set(brief.sources.map(source => normalizeUrl(source.url)));
  const citedUrls = markdownUrls(post.content);
  for (const url of new Set(citedUrls)) {
    if (!isHttpsUrl(url) || !allowedUrls.has(normalizeUrl(url))) {
      issues.push(`Generated post cites an unresearched URL: ${url}`);
    }
  }
  if (new Set(citedUrls.map(url => (isHttpsUrl(url) ? normalizeUrl(url) : url))).size < 2) {
    issues.push('Generated post must cite at least two sources');
  }

  if (issues.length > 0) throw new Error(issues.join('; '));

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
  let lastPostJson = '';
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await client.completeJson<GeneratedPost>({
      systemPrompt,
      userPrompt: `${userPrompt}${
        validationError
          ? `\n\nYour previous attempt produced this post JSON (possibly truncated):\n${lastPostJson}\nIt failed validation: ${validationError}\nRepair it: keep everything that was correct and fix only the listed problems.`
          : ''
      }`,
      temperature: 0.6,
      maxTokens: 16000,
      reasoningEffort: 'low',
      schema: GENERATED_POST_SCHEMA,
    });

    try {
      return validateGeneratedPost(repairGeneratedPost(response.data), brief, rules);
    } catch (error) {
      validationError = error instanceof Error ? error.message : String(error);
      lastPostJson = JSON.stringify(response.data).slice(0, 6000);
      console.warn(`⚠️ Generation attempt ${attempt} failed validation: ${validationError}`);
    }
  }

  throw new Error(
    `Could not generate a valid post after ${maxAttempts} attempts: ${validationError}`
  );
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
- Write between ${rules.wordsMin} and ${promptWordCeiling(rules)} words; never exceed ${promptWordCeiling(rules)} words
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
  const englishWords = wordCount(englishPost.content);
  const spanishCeiling = Math.max(rules.wordsMin, Math.min(promptWordCeiling(rules), englishWords));
  const systemPrompt = `You are ${rules.persona}. Adapt the supplied English post into natural Spanish.
This is not a literal translation. Preserve its technical accuracy, nuance, code, and inline source links.
Do not introduce facts or URLs that are absent from the English post and research brief.
Keep the same SEO/AEO structure, question-based H2 headings, Key Takeaways section, and FAQ section.
Write between ${rules.wordsMin} and ${spanishCeiling} words; never exceed ${spanishCeiling} words.
The English post is ${englishWords} words. Spanish prose runs longer than English, so condense while adapting rather than translating sentence by sentence — your Spanish version must not be longer than the English post.
The summary must be 120–160 Spanish characters.
Do not add a Sources section; the page renders the structured sources separately.

Return JSON with title, content, tags (3–5 lowercase Spanish tags), summary, and faq (3–5 {question, answer} objects).`;

  const userPrompt = `English post:
${JSON.stringify(englishPost, null, 2)}

Research brief:
${JSON.stringify(brief, null, 2)}`;

  return generateWithRetry(client, systemPrompt, userPrompt, brief, rules);
}
