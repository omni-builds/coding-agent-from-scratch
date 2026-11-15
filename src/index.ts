import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { runSupervisor } from './agents/supervisor.js';
import { createSharedState } from './context/shared-state.js';

const rl = readline.createInterface({ input: stdin, output: stdout });
const state = createSharedState();

const confirm = async (message: string) =>
  (await rl.question(`${message} [y/N] `)).trim().toLowerCase() === 'y';

console.log('Chat with Claude. Type "exit" to quit.\n');

while (true) {
  const input = (await rl.question('you> ')).trim();
  if (input === 'exit') break;
  if (!input) continue;

  try {
    const answer = await runSupervisor(input, state, { confirm });
    stdout.write(`claude> ${answer}\n`);
  } catch (err) {
    console.error(
      `\nRequest failed: ${err instanceof Error ? err.message : err}\n`,
    );
  }
}

rl.close();
