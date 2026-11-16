import { coderPrompt, plannerPrompt, supervisorPrompt } from './prompts.js';
import { parseDecision, planHasCoderWork } from './decision.js';
import { runIsolatedAgent } from './run-agent.js';
import { addAgentResult, renderSharedState, type SharedState } from '../context/shared-state.js';
import type { Confirm } from '../tools/utils.js';

const MAX_SUPERVISOR_STEPS = 8;
// The coder's summary is cut to this before it reaches the shared state. About 1,500 tokens.
const MAX_SUMMARY_CHARS = 6_000;

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
  for (let step = 1; step <= MAX_SUPERVISOR_STEPS; step += 1) {
    // Only the supervisor reads the shared state. The planner and coder get the instruction it writes.
    const decisionText = await runIsolatedAgent({
      name: 'supervisor',
      system: supervisorPrompt,
      task: renderSharedState(state, input),
      tools: [],
      confirm,
      log,
    });
    const decision = parseDecision(decisionText);
    log(`[supervisor] ${decision.action}`);

    if (decision.action === 'respond') {
      addAgentResult(state, 'supervisor', decision.instruction);
      return decision.instruction;
    }

    if (decision.action === 'planner') {
      const plan = await runIsolatedAgent({
        name: 'planner',
        system: plannerPrompt,
        task: `${decision.instruction}\n\nOriginal request:\n${input}`,
        tools: [],
        confirm,
        log,
      });
      state.fullPlan = plan;
      if (planHasCoderWork(plan)) {
        const approved = await confirm('Plan includes file work. Continue?');
        if (!approved) {
          const stopped = 'Stopped before making changes. The plan is on the shared state.';
          addAgentResult(state, 'supervisor', stopped);
          return stopped;
        }
      }
      continue;
    }

    const answer = await runIsolatedAgent({
      name: 'coder',
      system: coderPrompt,
      task: decision.instruction,
      confirm,
      log,
    });
    addAgentResult(state, 'coder', answer.slice(0, MAX_SUMMARY_CHARS));
  }

  const stopped = 'Stopped after the step limit. The shared state has what was finished.';
  addAgentResult(state, 'supervisor', stopped);
  return stopped;
}
