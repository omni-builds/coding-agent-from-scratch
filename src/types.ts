export type Message = { role: 'user' | 'assistant'; content: string };

export type ChatOptions = {
  system: string;
  messages: Message[];
  onText?: (delta: string) => void;
};

export type ChatResult = { text: string };
