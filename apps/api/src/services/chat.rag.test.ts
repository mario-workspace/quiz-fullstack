import { describe, it, expect } from 'vitest';
import {
  retrieveRelevantKnowledge,
  answerFromRag,
  formatRagContext,
  getCorpusSize,
  RAG_DIRECT_ANSWER_THRESHOLD,
} from './chat.rag';

describe('chat.rag', () => {
  it('indexes platform knowledge', () => {
    expect(getCorpusSize()).toBeGreaterThan(20);
  });

  it('retrieves submit homework knowledge for students', () => {
    const matches = retrieveRelevantKnowledge('how do I submit homework', 'student');
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].document.content.toLowerCase()).toMatch(/assignments|submit/);
  });

  it('filters documents by role', () => {
    const teacherMatches = retrieveRelevantKnowledge('create a class', 'teacher');
    const studentMatches = retrieveRelevantKnowledge('create a class', 'student');
    expect(teacherMatches[0]?.score ?? 0).toBeGreaterThan(studentMatches[0]?.score ?? 0);
  });

  it('answers directly when confidence is high', () => {
    const matches = retrieveRelevantKnowledge('how do I log out of the portal', 'student');
    const answer = answerFromRag(matches);
    expect(answer).toBeTruthy();
    expect(answer!.toLowerCase()).toMatch(/logout/);
    expect(matches[0].score).toBeGreaterThanOrEqual(RAG_DIRECT_ANSWER_THRESHOLD * 0.5);
  });

  it('formats context for LLM injection', () => {
    const matches = retrieveRelevantKnowledge('dark mode theme', 'student', 2);
    const formatted = formatRagContext(matches);
    expect(formatted).toContain('[1]');
  });
});
