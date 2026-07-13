import { config } from '../config';
import type { JwtPayload } from './auth.service';
import type { ChatAppContext } from './chat.context';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are the School Portal AI assistant — a helpful, warm, human-like guide embedded in an educational SaaS platform (similar to Canvas).

Your job:
- Answer questions about this platform, school workflows, and the signed-in user's data.
- Use the JSON context below for accurate names, counts, and role-specific capabilities.
- Explain how to complete tasks in the UI (where to click, what pages to use).
- Keep replies concise and friendly (usually 2–4 short paragraphs or a short bullet list).
- Use plain language; avoid sounding like a FAQ robot.

Rules:
- Grades are MARKS (0–100 numbers), never percentages — say "85 marks" not "85%".
- Use liveData numbers exactly; never invent class counts, marks, or user details.
- You cannot perform actions (submit work, enroll students, change grades) — guide the user instead.
- Stay on topic: school portal, classes, assignments, marks, and school life on this platform.
- If asked something outside the portal, politely redirect to what you can help with here.`;

export function isLlmConfigured(): boolean {
  return Boolean(config.OPENAI_API_KEY?.trim());
}

export async function generateLlmReply(
  message: string,
  user: JwtPayload,
  context: ChatAppContext,
  history: ChatTurn[] = [],
): Promise<string> {
  const apiKey = config.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('LLM not configured');
  }

  const contextBlock = JSON.stringify(
    {
      signedInUser: context.user,
      platform: context.platform,
      liveData: context.liveData,
    },
    null,
    2,
  );

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: `${SYSTEM_PROMPT}\n\n--- APP CONTEXT (authoritative) ---\n${contextBlock}`,
    },
  ];

  for (const turn of history.slice(-10)) {
    messages.push({ role: turn.role, content: turn.content.slice(0, 2000) });
  }

  messages.push({ role: 'user', content: message.slice(0, 2000) });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

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
        temperature: 0.65,
        max_tokens: 600,
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
