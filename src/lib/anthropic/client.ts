import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { anthropicApiKey } from './env';

export function createClient() {
  if (!anthropicApiKey) {
    throw new Error('Anthropic is not configured — set ANTHROPIC_API_KEY.');
  }

  return new Anthropic({ apiKey: anthropicApiKey });
}
