import { mkdir, rm, writeFile } from 'node:fs/promises';

export const FINDINGS_DIR = '.agent/findings';

export type Finding = { path: string; description: string };

/**
 * One line per saved finding: where it is and what is in it.
 * Tools do not get the shared state, so the index lives here, next to the files it describes.
 */
const findingsIndex: Finding[] = [];

/** Findings belong to one run, like the shared state. Called once at startup. */
export const resetFindings = async () => {
  findingsIndex.length = 0;
  await rm(FINDINGS_DIR, { recursive: true, force: true });
};

/** One file per finding, so a later coder opens only the one it needs. */
export const saveFinding = async (title: string, description: string, body: string) => {
  await mkdir(FINDINGS_DIR, { recursive: true });
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'finding';
  const path = `${FINDINGS_DIR}/${Date.now()}-${slug}.md`;
  await writeFile(path, `# ${title}\n\n${description.trim()}\n\n${body.trim()}\n`, 'utf8');
  findingsIndex.push({ path, description: description.trim() });
  return `Saved "${title}" to ${path} (${body.trim().length} chars). The supervisor sees it in the findings index.`;
};

/** The supervisor reads this to pick a finding by what it contains, without opening any file. */
export const renderFindingsIndex = () =>
  findingsIndex.map(({ path, description }) => `- ${path}: ${description}`).join('\n');
