export type SharedState = {
  /** The user's requests and each agent's final summary, never a transcript. The oldest are cut first. */
  agentNotes: string;
  /** Checklist written by the planner. */
  fullPlan: string;
};

export const AGENT_NOTES_FORMAT = (agent: string, text: string) =>
  `Agent notes from ${agent}:\n\n<agentNotes>\n${text.trim()}\n</agentNotes>\n\n`;

const MAX_AGENT_NOTES_CHARS = 8_000;

export const createSharedState = (): SharedState => ({
  agentNotes: '',
  fullPlan: '',
});

export const resetSharedState = (state: SharedState) => {
  state.agentNotes = '';
  state.fullPlan = '';
};

export const addAgentResult = (
  state: SharedState,
  agent: string,
  text: string,
) => {
  state.agentNotes += AGENT_NOTES_FORMAT(agent, text);
  if (state.agentNotes.length > MAX_AGENT_NOTES_CHARS) {
    state.agentNotes = `[earlier agent notes truncated]\n${state.agentNotes.slice(-MAX_AGENT_NOTES_CHARS)}`;
  }
};

export const renderSharedState = (state: SharedState, userRequest: string) =>
  [
    `User request:\n${userRequest}`,
    `Full plan:\n${state.fullPlan || '(none yet)'}`,
    `agent notes:\n${state.agentNotes || '(none yet)'}`,
  ].join('\n\n');
