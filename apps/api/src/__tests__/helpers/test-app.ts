import supertest from 'supertest';
import type { SuperTest, Test } from 'supertest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../app';
import { signToken } from '../../services/auth.service';
import { hashPassword } from '../../services/user.service';
import type { JwtPayload } from '../../services/auth.service';
import type { UserRole } from '../../types';

export async function createTestApp(): Promise<FastifyInstance> {
  const app = await buildApp();
  await app.ready();
  return app;
}

export async function closeTestApp(app: FastifyInstance): Promise<void> {
  await app.close();
}

export function getSupertest(app: FastifyInstance): SuperTest<Test> {
  return supertest(app.server);
}

export function getAgent(app: FastifyInstance) {
  return supertest.agent(app.server);
}

export function signTestToken(payload: JwtPayload): string {
  return signToken(payload);
}

export function cookieFromToken(token: string): string {
  return `token=${token}`;
}

function attachSessionCookie(agent: ReturnType<typeof getAgent>, res: { headers: Record<string, unknown> }) {
  const setCookie = res.headers['set-cookie'];
  const cookieHeader = Array.isArray(setCookie) ? setCookie[0] : (setCookie as string | undefined);
  const tokenMatch = cookieHeader?.match(/token=([^;]+)/);
  if (tokenMatch?.[1]) {
    agent.set('Cookie', cookieFromToken(tokenMatch[1]));
  }
}

export async function loginAndGetCookie(
  app: FastifyInstance,
  email = 'admin@school.edu',
  password = 'admin123',
): Promise<{ cookie: string; token: string; agent: ReturnType<typeof getAgent>; body: { user: { id: string; email: string; name: string; role: UserRole } } }> {
  const agent = getAgent(app);
  const res = await agent.post('/auth/login').send({ email, password });
  attachSessionCookie(agent, res);

  const setCookie = res.headers['set-cookie'];
  const cookieHeader = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  const tokenMatch = cookieHeader?.match(/token=([^;]+)/);
  const token = tokenMatch?.[1] ?? '';

  return { cookie: cookieFromToken(token), token, agent, body: res.body };
}

export async function loginAs(
  app: FastifyInstance,
  role: UserRole,
): Promise<{ agent: ReturnType<typeof getAgent>; user: ReturnType<typeof mockUser>; loginStatus: number }> {
  const user = mockUser(role);
  const agent = getAgent(app);
  const res = await agent.post('/auth/login').send({ email: user.email, password: `${role}123` });
  attachSessionCookie(agent, res);
  return { agent, user, loginStatus: res.status };
}

export const TEST_IDS = {
  admin: '11111111-1111-1111-1111-111111111111',
  teacher: '22222222-2222-2222-2222-222222222222',
  student: '33333333-3333-3333-3333-333333333333',
  class: '44444444-4444-4444-4444-444444444444',
  assignment: '55555555-5555-5555-5555-555555555555',
  submission: '66666666-6666-6666-6666-666666666666',
  group: '77777777-7777-7777-7777-777777777777',
} as const;

export function mockUser(
  role: UserRole,
  overrides: Partial<{ id: string; email: string; name: string; password: string; suspended: boolean }> = {},
) {
  const id = overrides.id ?? (role === 'admin' ? TEST_IDS.admin : role === 'teacher' ? TEST_IDS.teacher : TEST_IDS.student);
  const password = overrides.password ?? `${role}123`;
  return {
    id,
    email: overrides.email ?? `${role}@school.edu`,
    name: overrides.name ?? role.charAt(0).toUpperCase() + role.slice(1),
    password_hash: hashPassword(password),
    role,
    suspended: overrides.suspended ?? false,
    oauth_provider: null,
    oauth_id: null,
    created_at: new Date(),
  };
}

export function tokenForRole(role: UserRole, sub?: string): string {
  const user = mockUser(role, sub ? { id: sub } : {});
  return signTestToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
}
