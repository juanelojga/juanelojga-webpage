import type OpenAI from 'openai';
import { chat } from './github-models';

interface Category {
  id: string;
  themes: string[];
}

interface BlogConfig {
  categories: Category[];
  topicQueue: string[];
  generationRules: {
    wordsMin: number;
    wordsMax: number;
    tone: string;
    persona: string;
    avoid: string[];
  };
}

interface BlogHistory {
  generated: { topic: string; slug: string; date: string; category: string }[];
}

export interface SelectedTopic {
  topic: string;
  category: string;
}

export function selectTopic(
  config: BlogConfig,
  history: BlogHistory,
  manualTopic?: string
): { topic: string; category?: string; needsAI: boolean } {
  // 1. Manual topic override
  if (manualTopic) {
    return { topic: manualTopic, needsAI: false };
  }

  // 2. Topic queue
  if (config.topicQueue.length > 0) {
    const topic = config.topicQueue[0];
    return { topic, needsAI: false };
  }

  // 3. Need AI to pick
  return { topic: '', needsAI: true };
}

export async function selectTopicWithAI(
  client: OpenAI,
  config: BlogConfig,
  history: BlogHistory
): Promise<SelectedTopic> {
  const pastTopics = history.generated.map(g => g.topic).join('\n- ');

  // Pick a random category, weighted to avoid recently used ones
  const recentCategories = history.generated.slice(-6).map(g => g.category);
  const availableCategories = config.categories.filter(
    c => !recentCategories.includes(c.id) || config.categories.length <= recentCategories.length
  );
  const category =
    availableCategories.length > 0
      ? availableCategories[Math.floor(Math.random() * availableCategories.length)]
      : config.categories[Math.floor(Math.random() * config.categories.length)];

  const systemPrompt = `You are a technical blog topic selector. Pick a specific, actionable blog post topic.
Return ONLY a JSON object with "topic" (the blog post title) — nothing else.`;

  const userPrompt = `Category: ${category.id}
Themes to draw from: ${category.themes.join(', ')}
Persona: ${config.generationRules.persona}
Tone: ${config.generationRules.tone}

Previously written topics (avoid these):
- ${pastTopics || 'none yet'}

Pick a fresh, specific topic that a senior engineer would want to read. Make the title concise and opinionated.`;

  const response = await chat(client, systemPrompt, userPrompt);

  try {
    const parsed = JSON.parse(response);
    return { topic: parsed.topic, category: category.id };
  } catch {
    // If JSON parsing fails, use the raw response as the topic
    return { topic: response.trim().replace(/^["']|["']$/g, ''), category: category.id };
  }
}

export function popTopicQueue(config: BlogConfig): BlogConfig {
  return {
    ...config,
    topicQueue: config.topicQueue.slice(1),
  };
}
