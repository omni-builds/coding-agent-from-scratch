import type Anthropic from '@anthropic-ai/sdk';

export type Message = Anthropic.MessageParam;
export type ContentBlock = Anthropic.ContentBlock;
export type StopReason = Anthropic.Message['stop_reason'];

export type ChatOptions = {
  system: string;
  messages: Message[];
  onText?: (delta: string) => void;
};

export type ChatResult = {
  text: string;
  content: ContentBlock[];
  stopReason: StopReason;
};
