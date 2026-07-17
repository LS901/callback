import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from './client';

const MODEL = 'claude-sonnet-5';
const MAX_TOKENS = 4096;

/**
 * Runs one generation call with web search enabled, grounding the model in
 * current docs rather than training-data recall (spec's version-aware
 * generation principle). Handles the pause_turn continuation the server-tool
 * loop can hit if it needs more search iterations than fit in one response.
 */
export async function generateWithSearch(system: string, userContent: string): Promise<string> {
  const client = createClient();
  const tools: Anthropic.Messages.ToolUnion[] = [
    { type: 'web_search_20260209', name: 'web_search', max_uses: 3 },
  ];
  const messages: Anthropic.Messages.MessageParam[] = [{ role: 'user', content: userContent }];

  let response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system,
    tools,
    messages,
  });

  let continuations = 0;
  while (response.stop_reason === 'pause_turn' && continuations < 3) {
    messages.push({ role: 'assistant', content: response.content });
    response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system,
      tools,
      messages,
    });
    continuations += 1;
  }

  return response.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
}
