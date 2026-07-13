import { describe, it, expect, vi, beforeEach } from 'vitest';
import { answerQuestion } from './chat.service';
import type { JwtPayload } from './auth.service';
import { matchConversationalIntent } from './chat.expressions';
import { matchesExpression, prepareChatText } from './chat.normalize';

vi.mock('./stats.service', () => ({
  getAverageGrades: vi.fn(),
  getTeacherNames: vi.fn(),
  getStudentNames: vi.fn(),
  getAllClasses: vi.fn(),
}));

vi.mock('./class.service', () => ({
  listClasses: vi.fn(),
  listStudentClasses: vi.fn(),
  getTeacherStats: vi.fn(),
  getStudentStats: vi.fn(),
}));

vi.mock('./assignment.service', () => ({
  listTeacherAssignments: vi.fn(),
  listStudentAssignments: vi.fn(),
}));

vi.mock('./user.service', () => ({
  getAdminStats: vi.fn(),
}));

vi.mock('./submission.service', () => ({
  getStudentGradeStats: vi.fn(),
}));

vi.mock('./teacher-group.service', () => ({
  listTeacherGroups: vi.fn(),
}));

vi.mock('./chat.llm', () => ({
  isLlmConfigured: vi.fn().mockReturnValue(false),
  generateLlmReply: vi.fn(),
}));

vi.mock('./chat.context', () => ({
  buildChatContext: vi.fn(),
}));

vi.mock('./cache.service', () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(undefined),
}));

import * as classService from './class.service';
import * as statsService from './stats.service';
import { isLlmConfigured, generateLlmReply } from './chat.llm';
import { buildChatContext } from './chat.context';

const studentUser: JwtPayload = {
  sub: 'student-1',
  email: 'student@test.com',
  name: 'Alex Student',
  role: 'student',
};

describe('chat.normalize', () => {
  it('normalizes casual input', () => {
    expect(prepareChatText('  Hey!!!  ')).toBe('hey');
    expect(prepareChatText('How many CLAS am I in?')).toBe('how many class am i in?');
  });

  it('matches short words on word boundaries only', () => {
    expect(matchesExpression('yes please', ['yes'])).toBe(true);
    expect(matchesExpression('yesterday', ['yes'])).toBe(false);
  });
});

describe('chat.expressions', () => {
  it('matches casual greetings', () => {
    expect(matchConversationalIntent("what's up", 'student')).toBeTruthy();
    expect(matchConversationalIntent('how are you', 'student')).toBeTruthy();
    expect(matchConversationalIntent('thanks a lot', 'student')).toBeTruthy();
  });
});

describe('answerQuestion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('responds to greetings without calling services', async () => {
    const reply = await answerQuestion('Hey there!', studentUser);
    expect(reply.length).toBeGreaterThan(10);
    expect(classService.listStudentClasses).not.toHaveBeenCalled();
  });

  it('responds to who am i with role functions', async () => {
    const reply = await answerQuestion('Who am I?', studentUser);
    expect(reply).toContain('Alex Student');
    expect(reply).toContain('student');
    expect(reply).toContain('My Classes');
    expect(reply).toContain('Assignments');
  });

  it('returns class count for students', async () => {
    vi.mocked(classService.listStudentClasses).mockResolvedValue([
      { id: '1', name: 'Math', description: null, teacher_id: 't1', teacher_name: 'Mr. Smith', enrolled_at: '' },
      { id: '2', name: 'Science', description: null, teacher_id: 't2', teacher_name: 'Ms. Lee', enrolled_at: '' },
    ]);

    const reply = await answerQuestion('How many classes am I in?', studentUser);
    expect(reply).toContain('2 classes');
  });

  it('returns school average grade', async () => {
    vi.mocked(statsService.getAverageGrades).mockResolvedValue({ averageGrade: 87.5 });

    const reply = await answerQuestion('What is the average grade?', studentUser);
    expect(reply).toContain('87.5 marks');
  });

  it('uses human fallback with suggestions', async () => {
    const reply = await answerQuestion('quantum physics syllabus', studentUser);
    expect(reply).toContain('How many classes am I in?');
    expect(reply.toLowerCase()).not.toContain('try asking');
  });

  it('uses RAG when LLM is not configured', async () => {
    vi.mocked(isLlmConfigured).mockReturnValue(false);
    const reply = await answerQuestion('how do I log out', studentUser);
    expect(reply.toLowerCase()).toMatch(/logout/);
  });

  it('uses the LLM when configured', async () => {
    vi.mocked(isLlmConfigured).mockReturnValue(true);
    vi.mocked(buildChatContext).mockResolvedValue({
      platform: {
        name: 'School Portal',
        description: 'Test',
        roles: ['student'],
        grading: 'marks',
        ui: { theme: 'toggle', chat: 'navbar' },
        navigation: {},
      },
      user: { name: 'Alex Student', email: 'student@test.com', role: 'student' },
      liveData: {},
    });
    vi.mocked(generateLlmReply).mockResolvedValue('AI reply about your classes.');

    const reply = await answerQuestion('Tell me about my day', studentUser, {
      history: [{ role: 'user', content: 'Hi' }],
    });

    expect(reply).toBe('AI reply about your classes.');
    expect(generateLlmReply).toHaveBeenCalled();
    expect(classService.listStudentClasses).not.toHaveBeenCalled();
  });
});
