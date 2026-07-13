import { config } from '../config';
import type { JwtPayload } from './auth.service';
import type { ChatAppContext } from './chat.context';
import { compactLiveContext } from './chat.context';
import { formatRagContext, type RagMatch } from './chat.rag';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are the School Portal AI assistant on a Canvas-style school platform.

Use ONLY the retrieved knowledge and live user data below. Be concise (2–3 short paragraphs max).
Marks are 0–100 numbers, never percentages. You cannot perform actions — explain UI steps instead.
If retrieved knowledge answers the question, prefer it. Never invent counts or user details.`;

export function isLlmConfigured(): boolean {
  return Boolean(config.OPENAI_API_KEY?.trim());
}

export async function generateLlmReply(
  message: string,
  user: JwtPayload,
  context: ChatAppContext,
  history: ChatTurn[] = [],
  ragMatches: RagMatch[] = [],
): Promise<string> {
  const apiKey = config.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('LLM not configured');
  }

  const ragBlock = formatRagContext(ragMatches);
  const liveBlock = JSON.stringify(
    {
      platform: {
        name: context.platform.name,
        grading: context.platform.grading,
        ui: context.platform.ui,
      },
      live: compactLiveContext(context),
    },
    null,
    0,
  );

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: `${SYSTEM_PROMPT}\n\n--- RETRIEVED KNOWLEDGE ---\n${ragBlock}\n\n--- LIVE DATA ---\n${liveBlock}`,
    },
  ];

  for (const turn of history.slice(-6)) {
    messages.push({ role: turn.role, content: turn.content.slice(0, 800) });
  }

  messages.push({ role: 'user', content: message.slice(0, 1200) });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(`${config.OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.OPENAI_MODEL,
        messages,
        temperature: 0.55,
        max_tokens: config.OPENAI_MAX_TOKENS,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`LLM request failed (${res.status}): ${errBody.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('LLM returned an empty response');
    }

    return content;
  } finally {
    clearTimeout(timeout);
  }
}
