import { MAX_TOOL_ROUNDS } from '../constants.js';
import { chat } from '../llm.js';
import type { Message } from '../types.js';
import { runTools, type Confirm } from '../tools/utils.js';
import type Anthropic from '@anthropic-ai/sdk';

export type AgentRunOptions = {
  name: string;
  system: string;
  task: string;
  /** Earlier user requests and final answers. Tool transcripts are never part of it. */
  history?: Message[];
  /** Pass [] for an agent that must not call tools. */
  tools?: Anthropic.Tool[];
  confirm: Confirm;
  log?: (line: string) => void;
};

/**
 * One specialist. Its message list starts from the earlier turns (if any)
 * and is thrown away when this function returns. Only the final text leaves the function.
 */
export async function runIsolatedAgent({
  name,
  system,
  task,
  history = [],
  tools,
  confirm,
  log = console.log,
}: AgentRunOptions): Promise<string> {
  const messages: Message[] = [...history, { role: 'user', content: task }];
  const estimatedTokens = Math.ceil(JSON.stringify(messages).length / 4);
  log(`[agent] ${name}: about ${estimatedTokens} tokens sent to the model`);
  let lastText = '';
  let toolRounds = 0;

  while (true) {
    const { content, stopReason, text } = await chat({ system, messages, tools });
    lastText = text;
    messages.push({ role: 'assistant', content });

    if (stopReason !== 'tool_use' || (tools && tools.length === 0)) break;
    if (toolRounds >= MAX_TOOL_ROUNDS) {
      throw new Error(`Stopped after ${toolRounds} tool rounds`);
    }
    messages.push({ role: 'user', content: await runTools(content, confirm) });
    toolRounds += 1;
  }

  return lastText.trim();
}
