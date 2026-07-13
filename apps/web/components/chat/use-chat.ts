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

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return false;

      setInput('');
      setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
      setLoading(true);

      try {
        const reply = await sendChatMessage(trimmed, messages.slice(1));
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
        return true;
      } catch (err) {
        const description = err instanceof Error ? err.message : 'Unknown error';
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Sorry, I could not answer that: ${description}` },
        ]);
        toast({ title: 'Chat error', description, variant: 'destructive' });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loading],
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
  };
}

export type UseChatReturn = ReturnType<typeof useChat>;
