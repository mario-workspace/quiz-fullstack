'use client';

import { useCallback, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import {
  CHAT_WELCOME_MESSAGE,
  sendChatMessage,
  type ChatMessage,
} from '@/lib/chat';

export function useChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([CHAT_WELCOME_MESSAGE]);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([CHAT_WELCOME_MESSAGE]);
    setInput('');
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return false;

      const history = messages.slice(1);

      setInput('');
      setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
      setLoading(true);

      try {
        const reply = await sendChatMessage(trimmed, history);
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
        return true;
      } catch (err) {
        const description = err instanceof Error ? err.message : 'Unknown error';
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Sorry, I couldn't reach the AI right now. ${description}\n\nTry a quick question like "How many classes am I in?" or say "help".`,
          },
        ]);
        toast({ title: 'Chat error', description, variant: 'destructive' });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loading, messages],
  );

  return {
    open,
    setOpen,
    toggle,
    input,
    setInput,
    loading,
    messages,
    sendMessage,
    clearConversation,
  };
}

export type UseChatReturn = ReturnType<typeof useChat>;
