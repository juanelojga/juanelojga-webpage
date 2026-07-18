import fs from 'node:fs';
import path from 'node:path';
import { createOpenRouterClient } from './lib/openrouter';
import {
  categoryForStory,
  discoverWeeklyNews,
  researchSelectedStory,
  selectRandomStory,
} from './lib/research';
import { generateEnglishPost, generateSpanishPost } from './lib/post-generator';
import {
  generateSlug,
  calculateReadingTime,
  buildFrontmatter,
  buildMarkdownFile,
} from './lib/frontmatter';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'blog-config.json');
const HISTORY_PATH = path.join(ROOT, 'blog-history.json');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const SLUG_OUTPUT = '/tmp/blog-generated-slug.txt';
const RESEARCH_OUTPUT = '/tmp/blog-generated-research.md';

async function main() {
  console.log('🔄 Starting research-first blog generation...');

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
  const client = createOpenRouterClient();
  console.log(`🧠 Model: ${client.model}`);

  console.log('📰 Researching the latest weekly news...');
  const candidates = await discoverWeeklyNews(client, history.generated, config.newsResearch);
  candidates.forEach((candidate, index) => {
    console.log(`  ${index + 1}. ${candidate.headline} (${candidate.publishedAt})`);
  });

  const selected = selectRandomStory(candidates);
  const category = categoryForStory(selected.category);
  console.log(`🎲 Selected: ${selected.headline}`);

  console.log('🔎 Investigating the selected story in depth...');
  const brief = await researchSelectedStory(client, selected, config.newsResearch.minimumSources);
  console.log(`📚 Validated ${brief.sources.length} independent research sources`);

  console.log('🇺🇸 Generating grounded English post...');
  const enPost = await generateEnglishPost(client, brief, category, config.generationRules);

  console.log('🇪🇸 Generating grounded Spanish adaptation...');
  const esPost = await generateSpanishPost(client, enPost, brief, config.generationRules);

  const slug = generateSlug(enPost.title);
  const today = new Date().toISOString().split('T')[0];
  const sharedFrontmatter = {
    date: today,
    slug,
    category,
    sources: brief.sources,
  };

  const enFrontmatter = buildFrontmatter({
    ...sharedFrontmatter,
    title: enPost.title,
    tags: enPost.tags,
    summary: enPost.summary,
    language: 'en',
    readingTime: calculateReadingTime(enPost.content),
    faq: enPost.faq,
  });

  const esFrontmatter = buildFrontmatter({
    ...sharedFrontmatter,
    title: esPost.title,
    tags: esPost.tags,
    summary: esPost.summary,
    language: 'es',
    readingTime: calculateReadingTime(esPost.content),
    faq: esPost.faq,
  });

  const enPath = path.join(BLOG_DIR, 'en', `${slug}.md`);
  const esPath = path.join(BLOG_DIR, 'es', `${slug}.md`);
  fs.mkdirSync(path.dirname(enPath), { recursive: true });
  fs.mkdirSync(path.dirname(esPath), { recursive: true });
  fs.writeFileSync(enPath, buildMarkdownFile(enFrontmatter, enPost.content), 'utf-8');
  fs.writeFileSync(esPath, buildMarkdownFile(esFrontmatter, esPost.content), 'utf-8');

  history.generated.push({
    topic: enPost.title,
    slug,
    date: today,
    category,
    newsHeadline: selected.headline,
    newsPublishedAt: selected.publishedAt,
    sourceUrls: brief.sources.map(source => source.url),
    candidateHeadlines: candidates.map(candidate => candidate.headline),
  });
  fs.writeFileSync(HISTORY_PATH, `${JSON.stringify(history, null, 2)}\n`, 'utf-8');

  const researchSummary = `## Selected weekly story

[${selected.headline}](${selected.sourceUrl}) — ${selected.publishedAt}

${selected.whyItMatters}

## Research sources

${brief.sources.map(source => `- [${source.title}](${source.url}) — ${source.publisher}`).join('\n')}

The generated English and Spanish posts use only this validated research brief. Review all claims and citations before merging.
`;

  fs.writeFileSync(SLUG_OUTPUT, slug, 'utf-8');
  fs.writeFileSync(RESEARCH_OUTPUT, researchSummary, 'utf-8');

  console.log(`✅ Written: ${enPath}`);
  console.log(`✅ Written: ${esPath}`);
  console.log(`🎉 Done! Slug: ${slug}`);
}

main().catch(error => {
  console.error('❌ Generation failed:', error);
  process.exit(1);
});
