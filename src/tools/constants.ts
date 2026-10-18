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
];
