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
];
