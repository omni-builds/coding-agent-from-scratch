import { coderPrompt, plannerPrompt } from './prompts.js';
import { planHasCoderWork } from './decision.js';
import { runIsolatedAgent } from './run-agent.js';
import { addAgentResult, renderSharedState, type SharedState } from '../context/shared-state.js';
import type { Confirm } from '../tools/utils.js';

export type SupervisorOptions = {
  confirm: Confirm;
  log?: (line: string) => void;
};

export async function runSupervisor(
  input: string,
  state: SharedState,
  { confirm, log = console.log }: SupervisorOptions,
): Promise<string> {
  addAgentResult(state, 'user', input);
  const plan = await runIsolatedAgent({
    name: 'planner',
    system: plannerPrompt,
    task: renderSharedState(state, input),
    tools: [],
    confirm,
    log,
  });
  state.fullPlan = plan;

  if (planHasCoderWork(plan)) {
    const approved = await confirm('Plan includes file work. Continue?');
    if (!approved) {
      const stopped = 'Stopped before making changes. The plan is on the shared state.';
      addAgentResult(state, 'planner', stopped);
      return stopped;
    }
  }

  const answer = await runIsolatedAgent({
    name: 'coder',
    system: coderPrompt,
    task: renderSharedState(state, input),
    confirm,
    log,
  });
  addAgentResult(state, 'coder', answer);
  return answer;
}
