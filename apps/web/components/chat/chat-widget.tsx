'use client';

import { useEffect, useRef } from 'react';
import { RotateCcw, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatIcon } from '@/components/chat/chat-icon';
import { useChatContext } from '@/components/chat/chat-provider';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const {
    open,
    setOpen,
    toggle,
    input,
    setInput,
    loading,
    messages,
    sendMessage,
    clearConversation,
  } = useChatContext();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    await sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[min(70vh,480px)] w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2 font-medium">
              <ChatIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="leading-tight">School Portal AI</p>
                <p className="text-xs font-normal text-muted-foreground">RAG + OpenAI</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={clearConversation}
                aria-label="Clear conversation"
                title="Clear conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setOpen(false)}
                aria-label="Minimize chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={`${msg.role}-${i}-${msg.content.slice(0, 24)}`}
                className={cn(
                  'max-w-[92%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground',
                )}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                </span>
                AI is thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={handleSubmit} className="space-y-2 border-t border-border p-3">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about classes, assignments, or grades..."
              className="min-h-[72px] resize-none"
              disabled={loading}
              rows={2}
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Enter to send · Shift+Enter for new line</p>
              <Button type="submit" size="sm" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        className={cn(
          'relative flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        )}
        onClick={toggle}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
      >
        {open ? <X className="h-6 w-6" /> : <ChatIcon className="h-8 w-8" />}
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
          </span>
        )}
      </button>
    </div>
  );
}
