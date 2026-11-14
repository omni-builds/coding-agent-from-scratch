import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { SYSTEM_PROMPT } from './constants.js';
import { runIsolatedAgent } from './agents/run-agent.js';
import type { Message } from './types.js';

const rl = readline.createInterface({ input: stdin, output: stdout });
const history: Message[] = [];

const confirm = async (message: string) =>
  (await rl.question(`${message} [y/N] `)).trim().toLowerCase() === 'y';

console.log('Chat with Claude. Type "exit" to quit.\n');

while (true) {
  const input = (await rl.question('you> ')).trim();
  if (input === 'exit') break;
  if (!input) continue;

  try {
    const answer = await runIsolatedAgent({
      name: 'coder',
      system: SYSTEM_PROMPT,
      task: input,
      history,
      confirm,
    });
    history.push(
      { role: 'user', content: input },
      { role: 'assistant', content: answer },
    );
    stdout.write(`claude> ${answer}\n`);
  } catch (err) {
    console.error(
      `\nRequest failed: ${err instanceof Error ? err.message : err}\n`,
    );
  }
}

rl.close();
