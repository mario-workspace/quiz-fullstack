import { api } from '@/lib/api';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export const CHAT_WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm your AI assistant for School Portal — I know this platform and your school data.\nTry: \"Who am I?\" · \"How many classes do I have?\" · \"How do I submit homework?\"",
};

export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = [],
): Promise<string> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error('Message cannot be empty');
  }

  const priorTurns = history
    .filter((m) => m.content.trim())
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content }));

  const { reply } = await api<{ reply: string }>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message: trimmed, history: priorTurns }),
  });

  return reply;
}
