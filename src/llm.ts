import Anthropic from '@anthropic-ai/sdk';
import { MAX_TOKENS, MODEL } from './constants.js';
import type { ChatOptions, ChatResult } from './types.js';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

export async function chat({
  system,
  messages,
  onText,
}: ChatOptions): Promise<ChatResult> {
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system,
    messages,
  });

  stream.on('text', (delta) => onText?.(delta));

  const response = await stream.finalMessage();
  const text = response.content
    .flatMap((block) => (block.type === 'text' ? [block.text] : []))
    .join('');

  return {
    text,
  };
}
