/**
 * Requirement coverage mapped to SPECS.md and README.md.
 * Each describe block mirrors a spec section.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  createTestApp,
  closeTestApp,
  loginAndGetCookie,
  loginAs,
  getAgent,
  mockUser,
  TEST_IDS,
} from './helpers/test-app';
import * as userService from '../services/user.service';
import * as teacherGroupService from '../services/teacher-group.service';
import * as classService from '../services/class.service';
import * as assignmentService from '../services/assignment.service';
import * as submissionService from '../services/submission.service';
import * as statsService from '../services/stats.service';
import { validateDueDateNotPast } from '../services/assignment.validation';

vi.mock('../services/user.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/user.service')>();
  return {
    ...actual,
    listUsers: vi.fn(),
    getUserById: vi.fn(),
    getUserByEmail: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    setSuspended: vi.fn(),
    findOrCreateOAuthUser: vi.fn(),
    listStudents: vi.fn(),
    listTeachers: vi.fn(),
    getAdminStats: vi.fn(),
  };
});

vi.mock('../services/teacher-group.service', () => ({
  listTeacherGroups: vi.fn(),
  createTeacherGroup: vi.fn(),
  updateTeacherGroup: vi.fn(),
  deleteTeacherGroup: vi.fn(),
  addTeacherToGroup: vi.fn(),
  removeTeacherFromGroup: vi.fn(),
  listGroupTeachers: vi.fn(),
}));

vi.mock('../services/class.service', () => ({
  listClasses: vi.fn(),
  listTeacherClasses: vi.fn(),
  getTeacherStats: vi.fn(),
  getClass: vi.fn(),
  createClass: vi.fn(),
  updateClass: vi.fn(),
  deleteClass: vi.fn(),
  addStudentToClass: vi.fn(),
  removeStudentFromClass: vi.fn(),
  listClassStudents: vi.fn(),
  listStudentClasses: vi.fn(),
  getStudentStats: vi.fn(),
}));

vi.mock('../services/assignment.service', () => ({
  listAssignments: vi.fn(),
  getAssignment: vi.fn(),
  createAssignment: vi.fn(),
  updateAssignment: vi.fn(),
  publishAssignment: vi.fn(),
  deleteAssignment: vi.fn(),
  listStudentAssignments: vi.fn(),
  listTeacherAssignments: vi.fn(),
  getTeacherAssignment: vi.fn(),
  listStudentAssignmentsForClass: vi.fn(),
  unpublishAssignment: vi.fn(),
}));

vi.mock('../services/submission.service', () => ({
  submitAssignment: vi.fn(),
  getSubmission: vi.fn(),
  listSubmissionsForAssignment: vi.fn(),
  gradeSubmission: vi.fn(),
  listStudentGrades: vi.fn(),
  getStudentGradeStats: vi.fn(),
  getStudentSubmission: vi.fn(),
  getStudentGrade: vi.fn(),
}));

vi.mock('../services/stats.service', () => ({
  getAverageGrades: vi.fn(),
  getAverageGradesByClass: vi.fn(),
  getTeacherNames: vi.fn(),
  getStudentNames: vi.fn(),
  getAllClasses: vi.fn(),
  getClassStudents: vi.fn(),
}));

vi.mock('../services/cache.service', () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(undefined),
  getRedis: vi.fn(),
}));

const repoRoot = path.resolve(__dirname, '../../../..');

function setupAuthMocks() {
  vi.mocked(userService.getUserByEmail).mockImplementation(async (email: string) => {
    if (email === 'admin@school.edu') return mockUser('admin');
    if (email === 'teacher@school.edu') return mockUser('teacher');
    if (email === 'student@school.edu') return mockUser('student');
    return undefined;
  });
  vi.mocked(userService.getUserById).mockImplementation(async (id: string) => {
    if (id === TEST_IDS.admin) return mockUser('admin');
    if (id === TEST_IDS.teacher) return mockUser('teacher');
    if (id === TEST_IDS.student) return mockUser('student');
    return undefined;
  });
}

describe('README.md — project setup', () => {
  it('includes SPECS.md referenced from README', () => {
    const readme = fs.readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
    expect(readme).toContain('SPECS.md');
    expect(fs.existsSync(path.join(repoRoot, 'SPECS.md'))).toBe(true);
  });

  it('declares Node and npm engine requirements', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
    expect(pkg.engines.node).toMatch(/>=20/);
    expect(pkg.engines.npm).toMatch(/>=10/);
  });

  it('provides test, coverage, and e2e scripts', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
    expect(pkg.scripts.test).toBeDefined();
    expect(pkg.scripts.coverage).toBeDefined();
    expect(pkg.scripts['test:e2e']).toBeDefined();
    expect(pkg.scripts.build).toBeDefined();
  });

  it('includes docker-compose with PostgreSQL 17 and Redis', () => {
    const compose = fs.readFileSync(path.join(repoRoot, 'docker-compose.yml'), 'utf8');
    expect(compose).toContain('postgres:17');
    expect(compose).toContain('redis');
  });

  it('includes root Dockerfile for containerization', () => {
    expect(fs.existsSync(path.join(repoRoot, 'Dockerfile'))).toBe(true);
    expect(fs.existsSync(path.join(repoRoot, 'Dockerfile.web'))).toBe(true);
  });

  it('includes GitHub Actions CI workflow', () => {
    expect(fs.existsSync(path.join(repoRoot, '.github/workflows/ci.yml'))).toBe(true);
  });
});

describe('SPECS.md — authentication', () => {
  beforeEach(setupAuthMocks);
  afterEach(() => vi.restoreAllMocks());

  it('uses JWT in HTTP-only cookie on login', async () => {
    const app = await createTestApp();
    const res = await getAgent(app)
      .post('/auth/login')
      .send({ email: 'admin@school.edu', password: 'admin123' });
    expect(res.status).toBe(200);
    const setCookie = res.headers['set-cookie'];
    const cookieHeader = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    expect(cookieHeader).toMatch(/token=/);
    expect(cookieHeader?.toLowerCase()).toMatch(/httponly/);
    await closeTestApp(app);
  });

  it('exposes GitHub OAuth entry point', async () => {
    const app = await createTestApp();
    const res = await getAgent(app).get('/auth/github');
    expect([302, 503]).toContain(res.status);
    await closeTestApp(app);
  });

  it('protects all non-public routes', async () => {
    const app = await createTestApp();
    const protectedRoutes = [
      '/admin/users',
      '/teacher/classes',
      '/student/classes',
      '/api/v0/stats/classes',
      '/chat',
    ];
    for (const route of protectedRoutes) {
      const res = await getAgent(app).get(route);
      expect(res.status).toBe(401);
    }
    await closeTestApp(app);
  });
});

describe('SPECS.md — Admin', () => {
  beforeEach(setupAuthMocks);
  afterEach(() => vi.restoreAllMocks());

  it('CRUD: updates a user', async () => {
    vi.mocked(userService.updateUser).mockResolvedValue(mockUser('teacher', { name: 'Updated' }));
    const app = await createTestApp();
    const { agent } = await loginAs(app, 'admin');
    const res = await agent
      .put(`/admin/users/${TEST_IDS.teacher}`)
      .send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
    await closeTestApp(app);
  });

  it('CRUD: deletes a user', async () => {
    vi.mocked(userService.deleteUser).mockResolvedValue(true);
    const app = await createTestApp();
    const { agent } = await loginAs(app, 'admin');
    const res = await agent.delete(`/admin/users/${TEST_IDS.student}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    await closeTestApp(app);
  });

  it('suspends and unsuspends users', async () => {
    vi.mocked(userService.setSuspended).mockResolvedValue(mockUser('student', { suspended: true }));
    const app = await createTestApp();
    const { agent } = await loginAs(app, 'admin');
    const suspend = await agent.post(`/admin/users/${TEST_IDS.student}/suspend`);
    expect(suspend.status).toBe(200);
    vi.mocked(userService.setSuspended).mockResolvedValue(mockUser('student', { suspended: false }));
    const unsuspend = await agent.post(`/admin/users/${TEST_IDS.student}/unsuspend`);
    expect(unsuspend.status).toBe(200);
    await closeTestApp(app);
  });

  it('CRUD: creates, updates, and deletes teacher groups', async () => {
    vi.mocked(teacherGroupService.createTeacherGroup).mockResolvedValue({
      id: TEST_IDS.group,
      name: 'Science',
      description: null,
      created_at: new Date(),
    });
    vi.mocked(teacherGroupService.updateTeacherGroup).mockResolvedValue({
      id: TEST_IDS.group,
      name: 'Science Dept',
      description: 'Updated',
      created_at: new Date(),
    });
    vi.mocked(teacherGroupService.deleteTeacherGroup).mockResolvedValue(true);

    const app = await createTestApp();
    const { agent } = await loginAs(app, 'admin');

    const create = await agent.post('/admin/teacher-groups').send({ name: 'Science' });
    expect(create.status).toBe(200);

    const update = await agent
      .put(`/admin/teacher-groups/${TEST_IDS.group}`)
      .send({ name: 'Science Dept' });
    expect(update.status).toBe(200);

    const del = await agent.delete(`/admin/teacher-groups/${TEST_IDS.group}`);
    expect(del.status).toBe(200);
    await closeTestApp(app);
  });

  it('adds and removes teachers from groups', async () => {
    vi.mocked(userService.getUserByEmail).mockImplementation(async (email: string) => {
      if (email === 'admin@school.edu') return mockUser('admin');
      if (email === 'teacher@school.edu') return mockUser('teacher');
      return undefined;
    });
    vi.mocked(teacherGroupService.addTeacherToGroup).mockResolvedValue(undefined);
    vi.mocked(teacherGroupService.removeTeacherFromGroup).mockResolvedValue(true);
    vi.mocked(teacherGroupService.listGroupTeachers).mockResolvedValue([
      { id: TEST_IDS.teacher, name: 'Teacher', email: 'teacher@school.edu' },
    ]);

    const app = await createTestApp();
    const { agent } = await loginAs(app, 'admin');

    const add = await agent
      .post(`/admin/teacher-groups/${TEST_IDS.group}/teachers`)
      .send({ email: 'teacher@school.edu' });
    expect(add.status).toBe(200);
    expect(add.body.added).toContain('teacher@school.edu');

    const list = await agent.get(`/admin/teacher-groups/${TEST_IDS.group}/teachers`);
    expect(list.status).toBe(200);

    const remove = await agent.delete(
      `/admin/teacher-groups/${TEST_IDS.group}/teachers/${TEST_IDS.teacher}`,
    );
    expect(remove.status).toBe(200);
    await closeTestApp(app);
  });
});

describe('SPECS.md — Teacher', () => {
  beforeEach(setupAuthMocks);
  afterEach(() => vi.restoreAllMocks());

  const ownedClass = {
    id: TEST_IDS.class,
    name: 'Algebra',
    description: null,
    teacher_id: TEST_IDS.teacher,
    created_at: new Date(),
  };

  it('CRUD: updates and deletes classes', async () => {
    vi.mocked(classService.getClass).mockResolvedValue(ownedClass);
    vi.mocked(classService.updateClass).mockResolvedValue({ ...ownedClass, name: 'Algebra II' });
    vi.mocked(classService.deleteClass).mockResolvedValue(true);

    const app = await createTestApp();
    const { agent } = await loginAs(app, 'teacher');

    const update = await agent
      .put(`/teacher/classes/${TEST_IDS.class}`)
      .send({ name: 'Algebra II' });
    expect(update.status).toBe(200);

    const del = await agent.delete(`/teacher/classes/${TEST_IDS.class}`);
    expect(del.status).toBe(200);
    await closeTestApp(app);
  });

  it('adds and removes students from a class', async () => {
    vi.mocked(classService.getClass).mockResolvedValue(ownedClass);
    vi.mocked(userService.getUserByEmail).mockImplementation(async (email: string) => {
      if (email === 'teacher@school.edu') return mockUser('teacher');
      if (email === 'student@school.edu') return mockUser('student');
      return undefined;
    });
    vi.mocked(classService.addStudentToClass).mockResolvedValue(undefined);
    vi.mocked(classService.removeStudentFromClass).mockResolvedValue(true);
    vi.mocked(classService.listClassStudents).mockResolvedValue([
      { id: TEST_IDS.student, name: 'Student', email: 'student@school.edu' },
    ]);

    const app = await createTestApp();
    const { agent } = await loginAs(app, 'teacher');

    const add = await agent
      .post(`/teacher/classes/${TEST_IDS.class}/students`)
      .send({ email: 'student@school.edu' });
    expect(add.status).toBe(200);

    const list = await agent.get(`/teacher/classes/${TEST_IDS.class}/students`);
    expect(list.status).toBe(200);

    const remove = await agent.delete(
      `/teacher/classes/${TEST_IDS.class}/students/${TEST_IDS.student}`,
    );
    expect(remove.status).toBe(200);
    await closeTestApp(app);
  });

  it('publishes assignments', async () => {
    const assignment = {
      id: TEST_IDS.assignment,
      class_id: TEST_IDS.class,
      title: 'Quiz',
      description: null,
      due_date: null,
      published: true,
      created_at: new Date(),
    };
    vi.mocked(classService.getClass).mockResolvedValue(ownedClass);
    vi.mocked(assignmentService.getAssignment).mockResolvedValue({
      ...assignment,
      published: false,
    });
    vi.mocked(assignmentService.publishAssignment).mockResolvedValue(assignment);

    const app = await createTestApp();
    const { agent } = await loginAs(app, 'teacher');
    const res = await agent.post(`/teacher/assignments/${TEST_IDS.assignment}/publish`);
    expect(res.status).toBe(200);
    expect(res.body.published).toBe(true);
    await closeTestApp(app);
  });

  it('grades submissions with marks and feedback', async () => {
    vi.mocked(submissionService.getSubmission).mockResolvedValue({
      id: TEST_IDS.submission,
      assignment_id: TEST_IDS.assignment,
      student_id: TEST_IDS.student,
      content: 'My answer',
      submitted_at: new Date(),
    });
    vi.mocked(assignmentService.getAssignment).mockResolvedValue({
      id: TEST_IDS.assignment,
      class_id: TEST_IDS.class,
      title: 'Quiz',
      description: null,
      due_date: null,
      published: true,
      created_at: new Date(),
    });
    vi.mocked(classService.getClass).mockResolvedValue(ownedClass);
    vi.mocked(submissionService.gradeSubmission).mockResolvedValue({
      id: 'grade-1',
      submission_id: TEST_IDS.submission,
      score: 88,
      feedback: 'Well done',
      graded_at: new Date(),
    });

    const app = await createTestApp();
    const { agent } = await loginAs(app, 'teacher');
    const res = await agent
      .post(`/teacher/submissions/${TEST_IDS.submission}/grade`)
      .send({ score: 88, feedback: 'Well done' });
    expect(res.status).toBe(200);
    expect(res.body.score).toBe(88);
    expect(res.body.feedback).toBe('Well done');
    await closeTestApp(app);
  });

  it('rejects past due dates on assignments', () => {
    expect(() => validateDueDateNotPast('2000-01-01')).toThrow('Due date cannot be in the past');
  });
});

describe('SPECS.md — Student', () => {
  beforeEach(setupAuthMocks);
  afterEach(() => vi.restoreAllMocks());

  const publishedAssignment = {
    id: TEST_IDS.assignment,
    class_id: TEST_IDS.class,
    title: 'Homework',
    description: null,
    due_date: new Date(Date.now() + 86400000).toISOString(),
    published: true,
    created_at: new Date(),
  };

  it('submits assignment work', async () => {
    vi.mocked(assignmentService.getAssignment).mockResolvedValue(publishedAssignment);
    vi.mocked(submissionService.getStudentSubmission).mockResolvedValue(null);
    vi.mocked(classService.listStudentClasses).mockResolvedValue([
      {
        id: TEST_IDS.class,
        name: 'Algebra',
        description: null,
        teacher_id: TEST_IDS.teacher,
        teacher_name: 'Teacher',
        enrolled_at: new Date().toISOString(),
      },
    ]);
    vi.mocked(submissionService.submitAssignment).mockResolvedValue({
      id: TEST_IDS.submission,
      assignment_id: TEST_IDS.assignment,
      student_id: TEST_IDS.student,
      content: 'Answer',
      submitted_at: new Date(),
    });

    const app = await createTestApp();
    const { agent } = await loginAs(app, 'student');
    const res = await agent
      .post(`/student/assignments/${TEST_IDS.assignment}/submit`)
      .send({ content: 'Answer' });
    expect(res.status).toBe(200);
    await closeTestApp(app);
  });

  it('views marks and feedback via submission endpoint', async () => {
    vi.mocked(submissionService.getStudentSubmission).mockResolvedValue({
      id: TEST_IDS.submission,
      assignment_id: TEST_IDS.assignment,
      student_id: TEST_IDS.student,
      content: 'Answer',
      submitted_at: new Date(),
    });
    vi.mocked(submissionService.getStudentGrade).mockResolvedValue({
      id: 'grade-1',
      submission_id: TEST_IDS.submission,
      score: 92,
      feedback: 'Excellent',
      graded_at: new Date(),
    });

    const app = await createTestApp();
    const { agent } = await loginAs(app, 'student');
    const res = await agent.get(`/student/assignments/${TEST_IDS.assignment}/submission`);
    expect(res.status).toBe(200);
    expect(res.body.grade.score).toBe(92);
    expect(res.body.grade.feedback).toBe('Excellent');
    await closeTestApp(app);
  });

  it('blocks editing after assignment is marked', async () => {
    vi.mocked(assignmentService.getAssignment).mockResolvedValue(publishedAssignment);
    vi.mocked(submissionService.getStudentSubmission).mockResolvedValue({
      id: TEST_IDS.submission,
      assignment_id: TEST_IDS.assignment,
      student_id: TEST_IDS.student,
      content: 'Answer',
      submitted_at: new Date(),
    });
    vi.mocked(submissionService.getStudentGrade).mockResolvedValue({
      id: 'grade-1',
      submission_id: TEST_IDS.submission,
      score: 90,
      feedback: null,
      graded_at: new Date(),
    });

    const app = await createTestApp();
    const { agent } = await loginAs(app, 'student');
    const res = await agent
      .post(`/student/assignments/${TEST_IDS.assignment}/submit`)
      .send({ content: 'Changed answer' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/marked/i);
    await closeTestApp(app);
  });

  it('returns student stats with marks summary', async () => {
    vi.mocked(classService.getStudentStats).mockResolvedValue({
      totalClasses: 2,
      totalAssignments: 5,
    });
    vi.mocked(submissionService.getStudentGradeStats).mockResolvedValue({
      average: 85,
      max: 95,
      min: 70,
      count: 3,
    });

    const app = await createTestApp();
    const { agent } = await loginAs(app, 'student');
    const res = await agent.get('/student/stats');
    expect(res.status).toBe(200);
    expect(res.body.grades.average).toBe(85);
    await closeTestApp(app);
  });
});

describe('SPECS.md — School Statistics API', () => {
  beforeEach(setupAuthMocks);
  afterEach(() => vi.restoreAllMocks());

  it('GET /api/v0/stats/average-grades/:id', async () => {
    vi.mocked(statsService.getAverageGradesByClass).mockResolvedValue({
      classId: TEST_IDS.class,
      averageGrade: 91,
    });
    const app = await createTestApp();
    const { agent } = await loginAndGetCookie(app);
    const res = await agent.get(`/api/v0/stats/average-grades/${TEST_IDS.class}`);
    expect(res.status).toBe(200);
    expect(res.body.averageGrade).toBe(91);
    await closeTestApp(app);
  });

  it('GET /api/v0/stats/student-names', async () => {
    vi.mocked(statsService.getStudentNames).mockResolvedValue({ students: ['Sam', 'Taylor'] });
    const app = await createTestApp();
    const { agent } = await loginAndGetCookie(app);
    const res = await agent.get('/api/v0/stats/student-names');
    expect(res.status).toBe(200);
    expect(res.body.students).toEqual(['Sam', 'Taylor']);
    await closeTestApp(app);
  });

  it('GET /api/v0/stats/classes/:id returns enrolled students', async () => {
    vi.mocked(statsService.getClassStudents).mockResolvedValue({
      classId: TEST_IDS.class,
      students: ['Sam'],
    });
    const app = await createTestApp();
    const { agent } = await loginAndGetCookie(app);
    const res = await agent.get(`/api/v0/stats/classes/${TEST_IDS.class}`);
    expect(res.status).toBe(200);
    expect(res.body.students).toEqual(['Sam']);
    await closeTestApp(app);
  });
});

describe('SPECS.md — Chatbot (extra credit)', () => {
  beforeEach(setupAuthMocks);
  afterEach(() => vi.restoreAllMocks());

  it('POST /chat answers basic platform questions', async () => {
    const app = await createTestApp();
    const { agent } = await loginAs(app, 'student');
    const res = await agent.post('/chat').send({ message: 'help' });
    expect(res.status).toBe(200);
    expect(typeof res.body.reply).toBe('string');
    expect(res.body.reply.length).toBeGreaterThan(10);
    await closeTestApp(app);
  });

  it('POST /chat requires authentication', async () => {
    const app = await createTestApp();
    const res = await getAgent(app).post('/chat').send({ message: 'hello' });
    expect(res.status).toBe(401);
    await closeTestApp(app);
  });
});

describe('Platform — marks not percent', () => {
  it('chat average replies use marks not percent signs', async () => {
    const { answerQuestion } = await import('../services/chat.service');
    vi.mocked(statsService.getAverageGrades).mockResolvedValue({ averageGrade: 87.5 });
    const reply = await answerQuestion('What is the average grade?', {
      sub: TEST_IDS.student,
      email: 'student@school.edu',
      name: 'Student',
      role: 'student',
    });
    expect(reply).toContain('87.5 marks');
    expect(reply).not.toContain('87.5%');
  });
});
