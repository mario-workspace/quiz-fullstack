import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { authenticate, requireRole } from './auth';
import * as authService from '../services/auth.service';

describe('auth plugin', () => {
  let reply: FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
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
      sub: '1',
      email: 'a@b.com',
      role: 'admin',
      name: 'Admin',
    });
    const request = { url: '/admin/users', cookies: { token } } as FastifyRequest;
    await authenticate(request, reply);
    expect(request.user?.role).toBe('admin');
    expect(reply.status).not.toHaveBeenCalled();
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
