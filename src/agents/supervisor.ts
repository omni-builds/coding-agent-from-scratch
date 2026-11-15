import { SYSTEM_PROMPT } from '../constants.js';
import { plannerPrompt } from './prompts.js';
import { planHasCoderWork } from './decision.js';
import { runIsolatedAgent } from './run-agent.js';
import type { Message } from '../types.js';
import type { Confirm } from '../tools/utils.js';

export type SupervisorOptions = {
  confirm: Confirm;
  log?: (line: string) => void;
};

export async function runSupervisor(
  input: string,
  history: Message[],
  { confirm, log = console.log }: SupervisorOptions,
): Promise<string> {
  const plan = await runIsolatedAgent({
    name: 'planner',
    system: plannerPrompt,
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
