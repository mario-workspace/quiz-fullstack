import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendChatMessage } from './chat';

vi.mock('./api', () => ({
  api: vi.fn(),
}));

import { api } from './api';

describe('sendChatMessage', () => {
  beforeEach(() => {
    vi.mocked(api).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('posts trimmed message and returns reply', async () => {
    vi.mocked(api).mockResolvedValue({ reply: 'You have 2 classes.' });

    const reply = await sendChatMessage('  How many classes?  ');

    expect(reply).toBe('You have 2 classes.');
    expect(api).toHaveBeenCalledWith('/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'How many classes?', history: [] }),
    });
  });

  it('sends conversation history for multi-turn AI chat', async () => {
    vi.mocked(api).mockResolvedValue({ reply: 'Sure thing!' });

    await sendChatMessage('What next?', [
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello!' },
    ]);

    expect(api).toHaveBeenCalledWith('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'What next?',
        history: [
          { role: 'user', content: 'Hi' },
          { role: 'assistant', content: 'Hello!' },
        ],
      }),
    });
  });

  it('rejects empty messages', async () => {
    await expect(sendChatMessage('   ')).rejects.toThrow('Message cannot be empty');
    expect(api).not.toHaveBeenCalled();
  });
});
