export const DEFAULT_MODEL = 'claude-sonnet-5-5';
export const MODEL = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
export const MAX_TOKENS = 1024;
export const SYSTEM_PROMPT =
  'You are a helpful assistant. Keep answers concise.';

export const API_URL = 'https://api.anthropic.com/v1/messages';
export const API_VERSION = '2023-06-01';
