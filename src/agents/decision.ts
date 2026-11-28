export type AgentAction = 'planner' | 'coder' | 'respond';

export type Decision = {
  action: AgentAction;
  instruction: string;
};

const ACTIONS = new Set<AgentAction>(['planner', 'coder', 'respond']);

export const parseDecision = (text: string): Decision => {
  const actionMatch = text.match(
    /##\s*Decision\s*\r?\n\s*(planner|coder|respond)\b/i,
  );
  const instructionMatch = text.match(/##\s*Instruction\s*\r?\n([\s\S]*)/i);
  const action = actionMatch?.[1]?.toLowerCase();
  if (!action || !ACTIONS.has(action as AgentAction)) {
    return { action: 'respond', instruction: text.trim() };
  }
  return {
    action: action as AgentAction,
    instruction: (instructionMatch?.[1] ?? text).trim(),
  };
};

export const planHasCoderWork = (plan: string) =>
  /##\s*Coder[\s\S]*?- \[[ ]\]/i.test(plan);
