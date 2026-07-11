import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken, type JwtPayload } from '../services/auth.service';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

const PUBLIC_PATHS = new Set([
  '/auth/login',
  '/auth/logout',
  '/auth/github',
  '/auth/github/callback',
  '/health',
]);

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const path = request.url.split('?')[0];
  if (PUBLIC_PATHS.has(path)) {
    return;
  }

  const token = request.cookies.token;
  if (!token) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return reply.status(401).send({ error: 'Invalid token' });
  }

  request.user = payload;
}

export function requireRole(...roles: JwtPayload['role'][]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
  };
}
