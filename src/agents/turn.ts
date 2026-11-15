import { SYSTEM_PROMPT } from '../constants.js';
import { plannerPrompt } from './prompts.js';
import { planHasCoderWork } from './decision.js';
import { runIsolatedAgent } from './run-agent.js';
import type { Message } from '../types.js';
import type { Confirm } from '../tools/utils.js';

export type TurnOptions = {
  confirm: Confirm;
  log?: (line: string) => void;
};

export async function runTurn(
  input: string,
  history: Message[],
  { confirm, log = console.log }: TurnOptions,
): Promise<string> {
  const plan = await runIsolatedAgent({
    name: 'planner',
    system: plannerPrompt(),
    task: input,
    tools: [],
    confirm,
    log,
  });

  if (planHasCoderWork(plan)) {
    const approved = await confirm('Plan includes file work. Continue?');
    if (!approved) return 'Stopped before making changes.';
  }

  return runIsolatedAgent({
    name: 'coder',
    system: SYSTEM_PROMPT,
    task: `${input}\n\nPlan:\n${plan}`,
    history,
    confirm,
    log,
  });
}
