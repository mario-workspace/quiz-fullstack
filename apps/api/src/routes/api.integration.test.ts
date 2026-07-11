import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestApp,
  closeTestApp,
  loginAndGetCookie,
  loginAs,
  getAgent,
  mockUser,
  TEST_IDS,
} from '../__tests__/helpers/test-app';
import * as userService from '../services/user.service';
import * as teacherGroupService from '../services/teacher-group.service';
import * as classService from '../services/class.service';
import * as assignmentService from '../services/assignment.service';
import * as submissionService from '../services/submission.service';
import * as statsService from '../services/stats.service';

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
  getClass: vi.fn(),
  createClass: vi.fn(),
  updateClass: vi.fn(),
  deleteClass: vi.fn(),
  addStudentToClass: vi.fn(),
  removeStudentFromClass: vi.fn(),
  listClassStudents: vi.fn(),
  listStudentClasses: vi.fn(),
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
  listStudentAssignmentsForClass: vi.fn(),
}));

vi.mock('../services/submission.service', () => ({
  submitAssignment: vi.fn(),
  getSubmission: vi.fn(),
  listSubmissionsForAssignment: vi.fn(),
  gradeSubmission: vi.fn(),
  listStudentGrades: vi.fn(),
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

describe('API integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('health & auth', () => {
    it('GET /health returns ok', async () => {
      const app = await createTestApp();
      const res = await getAgent(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
      await closeTestApp(app);
    });

    it('POST /auth/login with valid credentials sets cookie', async () => {
      const app = await createTestApp();
      const { body, cookie } = await loginAndGetCookie(app);
      expect(body.user.role).toBe('admin');
      expect(cookie).toMatch(/^token=/);
      await closeTestApp(app);
    });

    it('POST /auth/login rejects invalid credentials', async () => {
      const app = await createTestApp();
      const res = await getAgent(app)
        .post('/auth/login')
        .send({ email: 'admin@school.edu', password: 'wrong' });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
      await closeTestApp(app);
    });

    it('POST /auth/login rejects suspended users', async () => {
      vi.mocked(userService.getUserByEmail).mockResolvedValue(mockUser('admin', { suspended: true }));
      const app = await createTestApp();
      const res = await getAgent(app)
        .post('/auth/login')
        .send({ email: 'admin@school.edu', password: 'admin123' });
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Account suspended');
      await closeTestApp(app);
    });

    it('POST /auth/logout clears session', async () => {
      const app = await createTestApp();
      const res = await getAgent(app).post('/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      await closeTestApp(app);
    });

    it('GET /auth/me returns current user', async () => {
      const app = await createTestApp();
      const { agent } = await loginAndGetCookie(app);
      const res = await agent.get('/auth/me');
      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('admin');
      await closeTestApp(app);
    });

    it('GET /auth/me requires authentication', async () => {
      const app = await createTestApp();
      const res = await getAgent(app).get('/auth/me');
      expect(res.status).toBe(401);
      await closeTestApp(app);
    });
  });

  describe('admin routes', () => {
    it('GET /admin/users lists users for admin', async () => {
      vi.mocked(userService.listUsers).mockResolvedValue([
        { id: TEST_IDS.admin, email: 'admin@school.edu', name: 'Admin', role: 'admin', suspended: false, created_at: new Date() },
      ]);
      const app = await createTestApp();
      const { agent } = await loginAs(app, 'admin');
      const res = await agent.get('/admin/users');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      await closeTestApp(app);
    });

    it('GET /admin/users rejects non-admin', async () => {
      const app = await createTestApp();
      const { agent } = await loginAs(app, 'student');
      const res = await agent.get('/admin/users');
      expect(res.status).toBe(403);
      await closeTestApp(app);
    });

    it('POST /admin/users creates a user', async () => {
      vi.mocked(userService.createUser).mockResolvedValue({
        id: TEST_IDS.teacher,
        email: 'new@school.edu',
        name: 'New Teacher',
        role: 'teacher',
        suspended: false,
        created_at: new Date(),
      });
      const app = await createTestApp();
      const { agent } = await loginAs(app, 'admin');
      const res = await agent
        .post('/admin/users')
        .send({ email: 'new@school.edu', name: 'New Teacher', password: 'secret12', role: 'teacher' });
      expect(res.status).toBe(200);
      expect(res.body.email).toBe('new@school.edu');
      await closeTestApp(app);
    });

    it('GET /admin/teacher-groups lists groups', async () => {
      vi.mocked(teacherGroupService.listTeacherGroups).mockResolvedValue([
        {
          id: TEST_IDS.group,
          name: 'Math',
          description: 'Mathematics department',
          created_at: new Date(),
          teacher_count: 2,
        },
      ]);
      const app = await createTestApp();
      const { agent } = await loginAs(app, 'admin');
      const res = await agent.get('/admin/teacher-groups');
      expect(res.status).toBe(200);
      expect(res.body[0].name).toBe('Math');
      await closeTestApp(app);
    });
  });

  describe('teacher routes', () => {
    it('GET /teacher/classes returns teacher classes', async () => {
      vi.mocked(classService.listClasses).mockResolvedValue([
        { id: TEST_IDS.class, name: 'Algebra', description: null, teacher_id: TEST_IDS.teacher, created_at: new Date() },
      ]);
      const app = await createTestApp();
      const { agent } = await loginAs(app, 'teacher');
      const res = await agent.get('/teacher/classes');
      expect(res.status).toBe(200);
      expect(res.body[0].name).toBe('Algebra');
      await closeTestApp(app);
    });

    it('GET /teacher/classes rejects students', async () => {
      const app = await createTestApp();
      const { agent } = await loginAs(app, 'student');
      const res = await agent.get('/teacher/classes');
      expect(res.status).toBe(403);
      await closeTestApp(app);
    });

    it('POST /teacher/classes creates a class', async () => {
      vi.mocked(classService.createClass).mockResolvedValue({
        id: TEST_IDS.class,
        name: 'Biology',
        description: 'Intro',
        teacher_id: TEST_IDS.teacher,
        created_at: new Date(),
      });
      const app = await createTestApp();
      const { agent } = await loginAs(app, 'teacher');
      const res = await agent.post('/teacher/classes').send({ name: 'Biology', description: 'Intro' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Biology');
      await closeTestApp(app);
    });

    it('POST /teacher/assignments creates assignment for owned class', async () => {
      vi.mocked(classService.getClass).mockResolvedValue({
        id: TEST_IDS.class,
        name: 'Biology',
        description: null,
        teacher_id: TEST_IDS.teacher,
        created_at: new Date(),
      });
      vi.mocked(assignmentService.createAssignment).mockResolvedValue({
        id: TEST_IDS.assignment,
        class_id: TEST_IDS.class,
        title: 'Lab 1',
        description: null,
        due_date: null,
        published: false,
        created_at: new Date(),
      });
      const app = await createTestApp();
      const { agent } = await loginAs(app, 'teacher');
      const res = await agent
        .post('/teacher/assignments')
        .send({ classId: TEST_IDS.class, title: 'Lab 1' });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Lab 1');
      await closeTestApp(app);
    });
  });

  describe('student routes', () => {
    it('GET /student/classes returns enrolled classes', async () => {
      vi.mocked(classService.listStudentClasses).mockResolvedValue([
        { id: TEST_IDS.class, name: 'Algebra', description: null, teacher_id: TEST_IDS.teacher, created_at: new Date() },
      ]);
      const app = await createTestApp();
      const { agent } = await loginAs(app, 'student');
      const res = await agent.get('/student/classes');
      expect(res.status).toBe(200);
      expect(res.body[0].name).toBe('Algebra');
      await closeTestApp(app);
    });

    it('GET /student/assignments lists assignments', async () => {
      vi.mocked(assignmentService.listStudentAssignments).mockResolvedValue([
        {
          id: TEST_IDS.assignment,
          class_id: TEST_IDS.class,
          title: 'Homework',
          description: null,
          due_date: null,
          published: true,
          created_at: new Date(),
        },
      ]);
      const app = await createTestApp();
      const { agent } = await loginAs(app, 'student');
      const res = await agent.get('/student/assignments');
      expect(res.status).toBe(200);
      expect(res.body[0].title).toBe('Homework');
      await closeTestApp(app);
    });

    it('GET /student/grades returns grades', async () => {
      vi.mocked(submissionService.listStudentGrades).mockResolvedValue([
        { assignmentTitle: 'Homework', score: 95, feedback: 'Great job' },
      ]);
      const app = await createTestApp();
      const { agent } = await loginAs(app, 'student');
      const res = await agent.get('/student/grades');
      expect(res.status).toBe(200);
      expect(res.body[0].score).toBe(95);
      await closeTestApp(app);
    });

    it('GET /student/classes rejects teachers', async () => {
      const app = await createTestApp();
      const { agent } = await loginAs(app, 'teacher');
      const res = await agent.get('/student/classes');
      expect(res.status).toBe(403);
      await closeTestApp(app);
    });
  });

  describe('stats routes', () => {
    it('GET /api/v0/stats/teacher-names requires auth', async () => {
      const app = await createTestApp();
      const res = await getAgent(app).get('/api/v0/stats/teacher-names');
      expect(res.status).toBe(401);
      await closeTestApp(app);
    });

    it('GET /api/v0/stats/teacher-names returns data when authenticated', async () => {
      vi.mocked(statsService.getTeacherNames).mockResolvedValue({ teachers: ['Alice', 'Bob'] });
      const app = await createTestApp();
      const { agent } = await loginAs(app, 'student');
      const res = await agent.get('/api/v0/stats/teacher-names');
      expect(res.status).toBe(200);
      expect(res.body.teachers).toEqual(['Alice', 'Bob']);
      await closeTestApp(app);
    });

    it('GET /api/v0/stats/average-grades returns average', async () => {
      vi.mocked(statsService.getAverageGrades).mockResolvedValue({ averageGrade: 87.5 });
      const app = await createTestApp();
      const { agent } = await loginAs(app, 'admin');
      const res = await agent.get('/api/v0/stats/average-grades');
      expect(res.status).toBe(200);
      expect(res.body.averageGrade).toBe(87.5);
      await closeTestApp(app);
    });

    it('GET /api/v0/stats/classes returns class list', async () => {
      vi.mocked(statsService.getAllClasses).mockResolvedValue({
        classes: [{ id: TEST_IDS.class, name: 'Algebra' }],
      });
      const app = await createTestApp();
      const { agent } = await loginAs(app, 'admin');
      const res = await agent.get('/api/v0/stats/classes');
      expect(res.status).toBe(200);
      expect(res.body.classes[0].name).toBe('Algebra');
      await closeTestApp(app);
    });
  });
});
