import type { ContentBlock, ToolResultBlock } from '../types.js';

type ToolHandler = (input: any) => string | Promise<string>;

const toolsImplementation: Record<string, ToolHandler> = {
  log_text: ({ text }: { text: string }) => {
    console.log(text);
    return 'logged';
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
