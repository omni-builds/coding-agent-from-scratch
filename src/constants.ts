export const DEFAULT_MODEL = 'claude-sonnet-5-5';
export const MODEL = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
export const MAX_TOKENS = 4096;
export const SYSTEM_PROMPT = `You are a coding agent working in the user's project directory (platform: ${process.platform}).
Read files before you change them, and make small, focused changes.
If a tool call is denied or fails, explain what happened instead of retrying blindly.
Keep answers concise.`;
