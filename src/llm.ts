import Anthropic from '@anthropic-ai/sdk';
import { MAX_TOKENS, MODEL } from './constants.js';
import type { ChatOptions, ChatResult } from './types.js';
import { tools as defaultTools } from './tools/constants.js';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

export async function chat({
  system,
  messages,
  onText,
  tools = defaultTools,
  model = MODEL,
  maxTokens = MAX_TOKENS,
}: ChatOptions): Promise<ChatResult> {
  const stream = client.messages.stream({
    model,
    max_tokens: maxTokens,
    system,
    messages,
    ...(tools.length > 0 ? { tools } : {}),
  });

  stream.on('text', (delta) => onText?.(delta));

  const response = await stream.finalMessage();
  const text = response.content
    .flatMap((block) => (block.type === 'text' ? [block.text] : []))
    .join('');

  return {
    text,
    stopReason: response.stop_reason,
    content: response.content,
  };
}
