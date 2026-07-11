import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { config } from '../config';
import {
  getCookieOptions,
  getGitHubAuthorizeUrl,
  resolveGitHubProfile,
  signToken,
  verifyPassword,
} from '../services/auth.service';
import { findOrCreateOAuthUser, getUserByEmail } from '../services/user.service';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const user = await getUserByEmail(body.email);

    if (!user || !user.password_hash || !verifyPassword(body.password, user.password_hash)) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    if (user.suspended) {
      return reply.status(403).send({ error: 'Account suspended' });
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    reply.setCookie('token', token, getCookieOptions());
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  });

  app.post('/auth/logout', async (_request, reply) => {
    reply.clearCookie('token', { path: '/' });
    return { success: true };
  });

  app.get('/auth/me', async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    return { user: request.user };
  });

  app.get('/auth/github', async (_request, reply) => {
    if (!config.GITHUB_CLIENT_ID) {
      return reply.status(503).send({ error: 'GitHub OAuth not configured' });
    }
    return reply.redirect(getGitHubAuthorizeUrl());
  });

  app.get('/auth/github/callback', async (request, reply) => {
    const query = z.object({ code: z.string() }).parse(request.query);

    if (!config.GITHUB_CLIENT_ID || !config.GITHUB_CLIENT_SECRET) {
      return reply.status(503).send({ error: 'GitHub OAuth not configured' });
    }

    try {
      const profile = await resolveGitHubProfile(query.code);
      const user = await findOrCreateOAuthUser('github', profile.oauthId, profile.email, profile.name);

      if (user.suspended) {
        return reply.redirect(`${config.FRONTEND_URL}/login?error=suspended`);
      }

      const token = signToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      reply.setCookie('token', token, getCookieOptions());
      return reply.redirect(`${config.FRONTEND_URL}/dashboard`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OAuth failed';
      return reply.status(401).send({ error: message });
    }
  });
}
