import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import type { ContentBlock, ToolResultBlock } from '../types.js';

const REQUIRES_APPROVAL = new Set(['write_file']);

type ToolHandler = (input: any) => string | Promise<string>;
export type Confirm = (message: string) => Promise<boolean>;

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
  write_file: async ({ path, content }: { path: string; content: string }) => {
    const fullPath = resolve(process.cwd(), path);
    const rel = relative(process.cwd(), fullPath);
    if (rel.startsWith('..') || resolve(rel) === rel) {
      throw new Error('Path is outside the project directory');
    }
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, 'utf-8');
    return `Wrote ${content.length} characters to ${path}`;
  },
};

export const runTools = async (
  blocks: ContentBlock[],
  confirm: Confirm,
): Promise<ToolResultBlock[]> => {
  const results: ToolResultBlock[] = [];

  for (const block of blocks) {
    if (block.type !== 'tool_use') continue;

    try {
      const handler = toolsImplementation[block.name];
      if (!handler) throw new Error(`Unknown tool: ${block.name}`);

      console.log(
        `[tool] ${block.name} ${JSON.stringify(block.input).slice(0, 200)}`,
      );

      if (REQUIRES_APPROVAL.has(block.name)) {
        if (!(await confirm('Allow this tool call?'))) {
          results.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: 'The user denied permission to run this tool.',
            is_error: true,
          });
          continue;
        }
      }

      results.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: await handler(block.input),
      });
    } catch (err) {
      results.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: err instanceof Error ? err.message : String(err),
        is_error: true,
      });
    }
  }

  return results;
};
