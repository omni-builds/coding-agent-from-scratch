import { appendFile, mkdir } from 'node:fs/promises';

const FINDINGS_DIR = '.agent';
export const FINDINGS_PATH = `${FINDINGS_DIR}/findings.md`;

export const saveFinding = async (title: string, body: string) => {
  await mkdir(FINDINGS_DIR, { recursive: true });
  await appendFile(FINDINGS_PATH, `\n## ${title}\n${body.trim()}\n`, 'utf8');
  return `Saved "${title}" to ${FINDINGS_PATH} (${body.trim().length} chars). The detail stays in that file.`;
};
