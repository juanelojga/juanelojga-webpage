import fs from 'node:fs';
import path from 'node:path';
import { createClient } from './lib/github-models';
import { selectTopic, selectTopicWithAI, popTopicQueue } from './lib/topic-selector';
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

async function main() {
  console.log('🔄 Starting blog post generation...');

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
  const manualTopic = process.env.MANUAL_TOPIC?.trim() || undefined;

  const client = createClient();

  // 1. Select topic
  const selection = selectTopic(config, history, manualTopic);
  let topic: string;
  let category: string;

  if (selection.needsAI) {
    console.log('🤖 Selecting topic with AI...');
    const aiSelection = await selectTopicWithAI(client, config, history);
    topic = aiSelection.topic;
    category = aiSelection.category;
  } else {
    topic = selection.topic;
    category = selection.category || config.categories[0].id;
  }

  console.log(`📝 Topic: ${topic}`);
  console.log(`📂 Category: ${category}`);

  // 2. Generate English post
  console.log('🇺🇸 Generating English post...');
  const enPost = await generateEnglishPost(client, topic, category, config.generationRules);

  // 3. Generate Spanish post
  console.log('🇪🇸 Generating Spanish post...');
  const esPost = await generateSpanishPost(client, enPost, config.generationRules);

  // 4. Build files
  const slug = generateSlug(enPost.title);
  const today = new Date().toISOString().split('T')[0];

  const enReadingTime = calculateReadingTime(enPost.content);
  const esReadingTime = calculateReadingTime(esPost.content);

  const enFrontmatter = buildFrontmatter({
    title: enPost.title,
    date: today,
    tags: enPost.tags,
    summary: enPost.summary,
    language: 'en',
    slug,
    category,
    readingTime: enReadingTime,
    faq: enPost.faq,
  });

  const esFrontmatter = buildFrontmatter({
    title: esPost.title,
    date: today,
    tags: esPost.tags,
    summary: esPost.summary,
    language: 'es',
    slug,
    category,
    readingTime: esReadingTime,
    faq: esPost.faq,
  });

  const enFile = buildMarkdownFile(enFrontmatter, enPost.content);
  const esFile = buildMarkdownFile(esFrontmatter, esPost.content);

  // 5. Write files
  const enPath = path.join(BLOG_DIR, 'en', `${slug}.md`);
  const esPath = path.join(BLOG_DIR, 'es', `${slug}.md`);

  fs.mkdirSync(path.dirname(enPath), { recursive: true });
  fs.mkdirSync(path.dirname(esPath), { recursive: true });

  fs.writeFileSync(enPath, enFile, 'utf-8');
  fs.writeFileSync(esPath, esFile, 'utf-8');

  console.log(`✅ Written: ${enPath}`);
  console.log(`✅ Written: ${esPath}`);

  // 6. Update history
  history.generated.push({
    topic: enPost.title,
    slug,
    date: today,
    category,
  });
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2) + '\n', 'utf-8');

  // 7. Pop topic queue if used
  if (!selection.needsAI && !manualTopic && config.topicQueue.length > 0) {
    const updatedConfig = popTopicQueue(config);
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(updatedConfig, null, 2) + '\n', 'utf-8');
  }

  // 8. Write slug for workflow
  fs.writeFileSync(SLUG_OUTPUT, slug, 'utf-8');

  console.log(`🎉 Done! Slug: ${slug}`);
}

main().catch(err => {
  console.error('❌ Generation failed:', err);
  process.exit(1);
});
