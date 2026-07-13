'use client';

import { Button } from '@/components/ui/button';
import { ChatIcon } from '@/components/chat/chat-icon';
import { useChatContext } from '@/components/chat/chat-provider';

export function ChatTrigger() {
  const { open, toggle } = useChatContext();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="relative h-9 w-9 p-0"
      onClick={toggle}
      aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
    >
      <ChatIcon className="h-5 w-5" />
      {!open && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
      )}
    </Button>
  );
}
