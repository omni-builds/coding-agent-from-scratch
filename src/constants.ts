export const DEFAULT_MODEL = 'claude-sonnet-5-5';
export const MODEL = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
export const MAX_TOKENS = 4096;
export const SYSTEM_PROMPT =
  'You are a helpful assistant. Keep answers concise.';
