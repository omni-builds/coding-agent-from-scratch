import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { SYSTEM_PROMPT } from './constants.js';
import { chat } from './llm.js';
import { runTools } from './tools/utils.js';
import type { Message } from './types.js';

const rl = readline.createInterface({ input: stdin, output: stdout });
const history: Message[] = [];

console.log('Chat with Claude. Type "exit" to quit.\n');

while (true) {
  const input = (await rl.question('you> ')).trim();
  if (input === 'exit') break;
  if (!input) continue;

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
      history.push({ role: 'user', content: await runTools(content) });
    }
  } catch (err) {
    history.pop(); // drop the unanswered user turn so the next request stays valid
    console.error(
      `\nRequest failed: ${err instanceof Error ? err.message : err}\n`,
    );
  }
}

rl.close();
