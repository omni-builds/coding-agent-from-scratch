import Anthropic from '@anthropic-ai/sdk';

export const tools: Anthropic.Tool[] = [
  {
    name: 'log_text',
    description: 'Logs the given text to the console.',
    input_schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'The text to log' },
      },
      required: ['text'],
    },
  },
  {
    name: 'get_current_time',
    description: 'Returns the current date and time as an ISO 8601 string.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'read_file',
    description:
      'Reads a UTF-8 text file and returns its contents. The path is relative to the project root.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Relative path of the file' },
      },
      required: ['path'],
    },
  },
  {
    name: 'save_finding',
    description:
      'Appends a detailed finding to .agent/findings.md and returns a short pointer. Put long results here instead of in your reply.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short title for the finding' },
        body: { type: 'string', description: 'The detailed finding' },
      },
      required: ['title', 'body'],
    },
  },
  {
    name: 'write_file',
    description:
      'Writes the given content to a file, creating it (and any missing folders) or overwriting it. The path is relative to the project root.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Relative path of the file' },
        content: { type: 'string', description: 'The full new file content' },
      },
      required: ['path', 'content'],
    },
  },
];
