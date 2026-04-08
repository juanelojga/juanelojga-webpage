import OpenAI from 'openai';

export function createClient(): OpenAI {
  const apiKey = process.env.GITHUB_TOKEN;
  if (!apiKey) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }

  return new OpenAI({
    baseURL: 'https://models.inference.ai.azure.com',
    apiKey,
  });
}

export async function chat(
  client: OpenAI,
  systemPrompt: string,
  userPrompt: string,
  model = 'gpt-4o'
): Promise<string> {
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content in API response');
  }

  return content;
}
