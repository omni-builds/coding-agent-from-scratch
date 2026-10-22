import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { SYSTEM_PROMPT } from './constants.js';
import { chat } from './llm.js';
import { runTools } from './tools/utils.js';
import type { Message } from './types.js';

const rl = readline.createInterface({ input: stdin, output: stdout });
const history: Message[] = [];

const confirm = async (message: string) =>
  (await rl.question(`Allow ${message}? [y/N] `)).trim().toLowerCase() === 'y';

console.log('Chat with Claude. Type "exit" to quit.\n');

while (true) {
  const input = (await rl.question('you> ')).trim();
  if (input === 'exit') break;
  if (!input) continue;

  const turnStart = history.length;
  history.push({ role: 'user', content: input });
  stdout.write('claude> ');

  try {
    // Keep calling the model until it stops asking for tools.
    while (true) {
      const { content, stopReason } = await chat({
        system: SYSTEM_PROMPT,
        messages: history,
        onText: (delta) => stdout.write(delta),
      });
      history.push({ role: 'assistant', content });
      stdout.write('\n');

      if (stopReason !== 'tool_use') break;
      history.push({ role: 'user', content: await runTools(content, confirm) });
    }
  } catch (err) {
    history.length = turnStart; // drop the whole turn so no tool_use lacks a tool_result
    console.error(
      `\nRequest failed: ${err instanceof Error ? err.message : err}\n`,
    );
  }
}

rl.close();
