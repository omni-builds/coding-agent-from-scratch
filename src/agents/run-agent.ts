import { MAX_TOOL_ROUNDS } from '../constants.js';
import { chat } from '../llm.js';
import type { Message } from '../types.js';
import { runTools, type Confirm } from '../tools/utils.js';

export type AgentRunOptions = {
  name: string;
  system: string;
  task: string;
  confirm: Confirm;
  log?: (line: string) => void;
};

/**
 * One specialist. Its message list starts empty and is thrown away
 * when this function returns. Only the final text leaves the function.
 */
export async function runIsolatedAgent({
  name,
  system,
  task,
  confirm,
  log = console.log,
}: AgentRunOptions): Promise<string> {
  const messages: Message[] = [{ role: 'user', content: task }];
  const estimatedTokens = Math.ceil(JSON.stringify(messages).length / 4);
  log(`[agent] ${name}: about ${estimatedTokens} tokens sent to the model`);
  let lastText = '';
  let toolRounds = 0;

  while (true) {
    const { content, stopReason, text } = await chat({ system, messages });
    lastText = text;
    messages.push({ role: 'assistant', content });

    if (stopReason !== 'tool_use') break;
    if (toolRounds >= MAX_TOOL_ROUNDS) {
      throw new Error(`Stopped after ${toolRounds} tool rounds`);
    }
    messages.push({ role: 'user', content: await runTools(content, confirm) });
    toolRounds += 1;
  }

  return lastText.trim();
}
