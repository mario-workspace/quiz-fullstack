'use client';

import { createContext, useContext } from 'react';
import { useChat, type UseChatReturn } from '@/components/chat/use-chat';
import { ChatWidget } from '@/components/chat/chat-widget';

const ChatContext = createContext<UseChatReturn | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const chat = useChat();

  return (
    <ChatContext.Provider value={chat}>
      {children}
      <ChatWidget />
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}
