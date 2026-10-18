import { readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import type { ContentBlock, ToolResultBlock } from '../types.js';

type ToolHandler = (input: any) => string | Promise<string>;

const toolsImplementation: Record<string, ToolHandler> = {
  log_text: ({ text }: { text: string }) => {
    console.log(text);
    return 'logged';
  },
  get_current_time: () => new Date().toISOString(),
  read_file: async ({ path }: { path: string }) => {
    const fullPath = resolve(process.cwd(), path);
    const rel = relative(process.cwd(), fullPath);
    // Keep the model inside the project directory.
    if (rel.startsWith('..') || resolve(rel) === rel) {
      throw new Error('Path is outside the project directory');
    }
    return readFile(fullPath, 'utf-8');
  },
};

export const runTools = async (
  blocks: ContentBlock[],
): Promise<ToolResultBlock[]> => {
  const results: ToolResultBlock[] = [];

  for (const block of blocks) {
    if (block.type !== 'tool_use') continue;

    results.push({
      type: 'tool_result',
      tool_use_id: block.id,
      content: await toolsImplementation[block.name](block.input),
    });
  }

  return results;
};
