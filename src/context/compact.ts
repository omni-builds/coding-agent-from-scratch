import { SUMMARY_MODEL } from '../constants.js';
import { chat } from '../llm.js';
import { summarizerPrompt } from '../agents/prompts.js';
import { renderAgentNotes, type AgentNote, type SharedState } from './shared-state.js';

// Past this, older notes are summarized. About 2,000 tokens.
const MAX_AGENT_NOTES_CHARS = 8_000;
// The newest notes stay word for word, up to about this much.
const KEEP_RECENT_CHARS = 3_000;
// A hard cap on the summary, about 3,000 characters, so after a compaction we are well under the limit.
const MAX_SUMMARY_TOKENS = 800;

const notesLength = (state: SharedState) =>
  state.notesSummary.length +
  state.agentNotes.reduce((sum, note) => sum + note.text.length, 0);

/** How many notes, counted from the end, stay word for word. Always at least the newest one. */
const countRecent = (notes: AgentNote[]) => {
  let chars = 0;
  let count = 0;
  for (const note of [...notes].reverse()) {
    chars += note.text.length;
    if (count > 0 && chars > KEEP_RECENT_CHARS) break;
    count += 1;
  }
  return count;
};

/**
 * Once the agent notes pass the limit, the older ones are merged into notesSummary.
 * The user's requests are never summarized: they hold the constraints the supervisor must not forget.
 */
export async function compactNotes(
  state: SharedState,
  log: (line: string) => void = console.log,
): Promise<void> {
  if (notesLength(state) <= MAX_AGENT_NOTES_CHARS) return;

  const recent = state.agentNotes.slice(-countRecent(state.agentNotes));
  const older = state.agentNotes.slice(0, state.agentNotes.length - recent.length);
  const userNotes = older.filter((note) => note.agent === 'user');
  const toSummarize = older.filter((note) => note.agent !== 'user');
  if (toSummarize.length === 0) return;

  try {
    const { text } = await chat({
      model: SUMMARY_MODEL,
      maxTokens: MAX_SUMMARY_TOKENS,
      system: summarizerPrompt,
      messages: [
        {
          role: 'user',
          content: `Existing summary:\n${state.notesSummary || '(none)'}\n\nNotes to merge in:\n${renderAgentNotes(toSummarize)}`,
        },
      ],
      tools: [], // The summarizer only writes text.
    });
    state.notesSummary = text.trim();
    log(`[compact] summarized ${toSummarize.length} older agent notes`);
  } catch (err) {
    // A failed summary must not stop the agent. Drop the oldest notes instead, whole.
    log(`[compact] summary failed, dropped ${toSummarize.length} older agent notes: ${err instanceof Error ? err.message : err}`);
  }

  state.agentNotes = [...userNotes, ...recent];
}
