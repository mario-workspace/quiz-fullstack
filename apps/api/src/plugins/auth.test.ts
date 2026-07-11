import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { authenticate, requireRole } from './auth';
import * as authService from '../services/auth.service';
import * as userService from '../services/user.service';

vi.mock('../services/user.service', () => ({
  getUserById: vi.fn(),
}));

const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';

describe('auth plugin', () => {
  let reply: FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getUserById).mockResolvedValue({
      id: TEST_USER_ID,
      email: 'a@b.com',
      name: 'Admin',
      role: 'admin',
      suspended: false,
      created_at: new Date(),
    });
    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as FastifyReply;
  });

  it('allows public paths without authentication', async () => {
    for (const path of ['/auth/login', '/auth/logout', '/health', '/auth/github']) {
      const request = { url: path, cookies: {} } as FastifyRequest;
      const localReply = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      } as unknown as FastifyReply;
      await authenticate(request, localReply);
      expect(localReply.status).not.toHaveBeenCalled();
    }
  });

  it('allows public paths with query strings', async () => {
    const request = { url: '/auth/github/callback?code=abc', cookies: {} } as FastifyRequest;
    await authenticate(request, reply);
    expect(reply.status).not.toHaveBeenCalled();
  });

  it('rejects missing token on protected routes', async () => {
    const request = { url: '/admin/users', cookies: {} } as FastifyRequest;
    await authenticate(request, reply);
    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('rejects invalid token', async () => {
    const request = { url: '/admin/users', cookies: { token: 'bad-token' } } as FastifyRequest;
    await authenticate(request, reply);
    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('attaches user for valid token', async () => {
    const token = authService.signToken({
      sub: TEST_USER_ID,
      email: 'a@b.com',
      role: 'admin',
      name: 'Admin',
    });
    const request = { url: '/admin/users', cookies: { token } } as FastifyRequest;
    await authenticate(request, reply);
    expect(request.user?.role).toBe('admin');
    expect(reply.status).not.toHaveBeenCalled();
  });

  it('rejects suspended users and clears cookie', async () => {
    vi.mocked(userService.getUserById).mockResolvedValue({
      id: TEST_USER_ID,
      email: 'a@b.com',
      name: 'Admin',
      role: 'admin',
      suspended: true,
      created_at: new Date(),
    });
    const token = authService.signToken({
      sub: TEST_USER_ID,
      email: 'a@b.com',
      role: 'admin',
      name: 'Admin',
    });
    const request = { url: '/admin/users', cookies: { token } } as FastifyRequest;
    await authenticate(request, reply);
    expect(reply.clearCookie).toHaveBeenCalledWith('token', { path: '/' });
    expect(reply.status).toHaveBeenCalledWith(403);
    expect(reply.send).toHaveBeenCalledWith({ error: 'Account suspended' });
  });

  it('requireRole blocks wrong role', async () => {
    const request = { user: { role: 'student', sub: '1', email: 's@b.com', name: 'S' } } as FastifyRequest;
    const roleReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;
    await requireRole('admin')(request, roleReply);
    expect(roleReply.status).toHaveBeenCalledWith(403);
    expect(roleReply.send).toHaveBeenCalledWith({ error: 'Forbidden' });
  });

  it('requireRole allows matching role', async () => {
    const request = { user: { role: 'teacher', sub: '1', email: 't@b.com', name: 'T' } } as FastifyRequest;
    const roleReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;
    await requireRole('teacher', 'admin')(request, roleReply);
    expect(roleReply.status).not.toHaveBeenCalled();
  });

  it('requireRole blocks missing user', async () => {
    const request = {} as FastifyRequest;
    const roleReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;
    await requireRole('admin')(request, roleReply);
    expect(roleReply.status).toHaveBeenCalledWith(403);
  });
});
