/**
 * Live LLM smoke test — loads .env from project root without extra dependencies.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env');
try {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // .env optional for CI
}

const { isLlmConfigured, generateLlmReply } = await import('../apps/api/src/services/chat.llm.ts');
const { buildChatContext } = await import('../apps/api/src/services/chat.context.ts');

const user = {
  sub: '00000000-0000-0000-0000-000000000001',
  email: 'admin@school.edu',
  name: 'System Admin',
  role: 'admin',
};

if (!isLlmConfigured()) {
  console.log('LLM_STATUS=not_configured');
  process.exit(1);
}

console.log('LLM_STATUS=configured');

try {
  const context = await buildChatContext(user);
  const reply = await generateLlmReply('What is School Portal in one sentence?', user, context);
  console.log('LLM_REPLY_OK=' + (reply.length > 20));
  console.log('LLM_REPLY_PREVIEW=' + reply.slice(0, 120).replace(/\n/g, ' '));
} catch (err) {
  console.log('LLM_STATUS=error');
  console.log('LLM_ERROR=' + (err instanceof Error ? err.message : String(err)).slice(0, 200));
  process.exit(1);
}
