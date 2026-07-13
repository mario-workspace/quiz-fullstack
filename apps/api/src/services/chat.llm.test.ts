import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateLlmReply, isLlmConfigured } from './chat.llm';
import type { ChatAppContext } from './chat.context';
import type { JwtPayload } from './auth.service';

vi.mock('../config', () => ({
  config: {
    OPENAI_API_KEY: 'test-key',
    OPENAI_MODEL: 'gpt-4o-mini',
    OPENAI_BASE_URL: 'https://api.openai.com/v1',
    OPENAI_MAX_TOKENS: 400,
  },
}));

const user: JwtPayload = {
  sub: '1',
  email: 's@test.com',
  name: 'Sam',
  role: 'student',
};

const context: ChatAppContext = {
  platform: {
    name: 'School Portal',
    description: 'Test platform',
    roles: ['student'],
    grading: 'Marks 0-100',
    ui: { theme: 'toggle', chat: 'navbar' },
    navigation: { student: ['Assignments'] },
  },
  user: { name: 'Sam', email: 's@test.com', role: 'student' },
  liveData: { classes: [{ name: 'Math', teacher: 'Mr. A' }] },
};

describe('chat.llm', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: 'You are enrolled in Math with Mr. A.' } }],
          }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('isLlmConfigured when API key is set', () => {
    expect(isLlmConfigured()).toBe(true);
  });

  it('calls OpenAI-compatible chat completions', async () => {
    const reply = await generateLlmReply('How many classes?', user, context, [], []);

    expect(reply).toContain('Math');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
        }),
      }),
    );

    const body = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string);
    expect(body.model).toBe('gpt-4o-mini');
    expect(body.messages.at(-1)).toEqual({ role: 'user', content: 'How many classes?' });
  });

  it('throws when API returns error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: () => Promise.resolve('invalid key'),
    } as Response);

    await expect(generateLlmReply('hello', user, context)).rejects.toThrow(/401/);
  });
});
