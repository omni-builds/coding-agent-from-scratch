import { renderFindingsIndex } from './store.js';

export type AgentNote = { agent: string; text: string };

export type SharedState = {
  /** The user's requests and each agent's final summary, never a transcript. */
  agentNotes: AgentNote[];
  /** Older agent notes, merged into one summary by compactNotes. */
  notesSummary: string;
  /** Checklist written by the planner. */
  fullPlan: string;
};

export const AGENT_NOTES_FORMAT = (agent: string, text: string) =>
  `Agent notes from ${agent}:\n\n<agentNotes>\n${text.trim()}\n</agentNotes>\n\n`;

export const createSharedState = (): SharedState => ({
  agentNotes: [],
  notesSummary: '',
  fullPlan: '',
});

export const addAgentResult = (
  state: SharedState,
  agent: string,
  text: string,
) => {
  state.agentNotes.push({ agent, text: text.trim() });
};

export const renderAgentNotes = (notes: AgentNote[]) =>
  notes.map(({ agent, text }) => AGENT_NOTES_FORMAT(agent, text)).join('');

export const renderSharedState = (state: SharedState, userRequest: string) =>
  [
    `User request:\n${userRequest}`,
    `Full plan:\n${state.fullPlan || '(none yet)'}`,
    `Summary of earlier agent notes:\n${state.notesSummary || '(none yet)'}`,
    `agent notes:\n${renderAgentNotes(state.agentNotes) || '(none yet)'}`,
    `Findings (path: what is in it):\n${renderFindingsIndex() || '(none yet)'}`,
  ].join('\n\n');
