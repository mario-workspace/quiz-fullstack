import { createHash } from 'node:crypto';
import type { UserRole } from '../types';
import { prepareChatText } from './chat.normalize';
import { STATIC_CHAT_RULES } from './chat.knowledge';
import { SCHOOL_LIFE_DIALOGUES } from './chat.school-life';
import { getWhoAmIReply } from './chat.role-profile';
import type { JwtPayload } from './auth.service';

export interface RagDocument {
  id: string;
  topics: string[];
  content: string;
  roles?: UserRole[];
}

export interface RagMatch {
  document: RagDocument;
  score: number;
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'about',
  'what', 'how', 'when', 'where', 'why', 'who', 'which', 'this', 'that', 'these', 'those',
  'i', 'me', 'my', 'you', 'your', 'we', 'our', 'they', 'their', 'it', 'its', 'and', 'or', 'but',
  'if', 'then', 'so', 'just', 'can', 'tell', 'please', 'thanks', 'hi', 'hello', 'hey',
]);

function tokenize(text: string): string[] {
  return prepareChatText(text)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function buildCorpus(): RagDocument[] {
  const docs: RagDocument[] = [];
  let id = 0;

  const add = (topics: string[], content: string, roles?: UserRole[]) => {
    docs.push({ id: `doc-${id++}`, topics, content, roles });
  };

  for (const rule of STATIC_CHAT_RULES) {
    for (const reply of rule.replies) {
      add(rule.phrases, reply, rule.roles);
    }
  }

  for (const dialogue of SCHOOL_LIFE_DIALOGUES) {
    for (const reply of dialogue.replies) {
      add(dialogue.expressions, reply, dialogue.roles);
    }
  }

  add(
    ['who am i', 'my role', 'what can i do', 'my account', 'my profile'],
    getWhoAmIReply({ sub: '0', email: 'student@school.edu', name: 'Student', role: 'student' }),
    ['student'],
  );
  add(
    ['who am i', 'my role', 'what can i do', 'my account', 'my profile'],
    getWhoAmIReply({ sub: '0', email: 'teacher@school.edu', name: 'Teacher', role: 'teacher' }),
    ['teacher'],
  );
  add(
    ['who am i', 'my role', 'what can i do', 'my account', 'my profile'],
    getWhoAmIReply({ sub: '0', email: 'admin@school.edu', name: 'Admin', role: 'admin' }),
    ['admin'],
  );

  add(
    ['school portal', 'platform', 'marks', 'grades', 'grading', 'dark mode', 'theme', 'chat', 'ai'],
    [
      'School Portal is a Canvas-style platform for admins, teachers, and students.',
      'Grades display as marks (0–100 numbers), not percentages.',
      'Theme: sun/moon toggle in navbar; right-click for Light/Dark/System.',
      'AI chat: open the chat icon in the navbar for help with classes and assignments.',
    ].join(' '),
  );

  return docs;
}

const CORPUS = buildCorpus();

/** Minimum score to answer without calling the LLM (free-tier fallback). */
export const RAG_DIRECT_ANSWER_THRESHOLD = 0.42;

export function retrieveRelevantKnowledge(
  query: string,
  role: UserRole,
  limit = 5,
): RagMatch[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const querySet = new Set(queryTokens);
  const scored: RagMatch[] = [];

  for (const doc of CORPUS) {
    if (doc.roles && !doc.roles.includes(role)) continue;

    const docTokens = tokenize(`${doc.topics.join(' ')} ${doc.content}`);
    if (docTokens.length === 0) continue;

    let overlap = 0;
    for (const token of querySet) {
      if (docTokens.includes(token)) overlap += 1;
    }

    const topicBoost = doc.topics.some((t) => prepareChatText(query).includes(prepareChatText(t)))
      ? 0.15
      : 0;

    const score = overlap / Math.sqrt(querySet.size + 2) + topicBoost;
    if (score > 0.05) {
      scored.push({ document: doc, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export function formatRagContext(matches: RagMatch[]): string {
  if (matches.length === 0) return '(No matching knowledge snippets.)';
  return matches
    .map((m, i) => `[${i + 1}] (relevance ${m.score.toFixed(2)})\n${m.document.content}`)
    .join('\n\n');
}

/** Answer directly from retrieved docs — no LLM tokens spent (ideal for free API limits). */
export function answerFromRag(matches: RagMatch[]): string | null {
  if (matches.length === 0 || matches[0].score < RAG_DIRECT_ANSWER_THRESHOLD) {
    return null;
  }

  const top = matches[0].document.content;
  if (matches.length === 1 || matches[1].score < RAG_DIRECT_ANSWER_THRESHOLD * 0.85) {
    return top;
  }

  const second = matches[1].document.content;
  if (top.length + second.length < 900) {
    return `${top}\n\n${second}`;
  }
  return top;
}

export function buildChatCacheKey(user: JwtPayload, message: string): string {
  const normalized = prepareChatText(message);
  const hash = createHash('sha256')
    .update(`${user.sub}:${user.role}:${normalized}`)
    .digest('hex')
    .slice(0, 20);
  return `chat:reply:${hash}`;
}

export function getCorpusSize(): number {
  return CORPUS.length;
}
