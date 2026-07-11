import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { config } from './config';
import { authenticate } from './plugins/auth';
import { authRoutes } from './routes/auth.routes';
import { adminRoutes } from './routes/admin.routes';
import { teacherRoutes } from './routes/teacher.routes';
import { studentRoutes } from './routes/student.routes';
import { statsRoutes } from './routes/stats.routes';

export async function buildApp() {
  const app = Fastify({ logger: config.NODE_ENV !== 'test' });

  await app.register(cors, {
    origin: config.FRONTEND_URL,
    credentials: true,
  });

  await app.register(cookie);

  app.addHook('onRequest', authenticate);

  app.get('/health', async () => ({ status: 'ok' }));

  await app.register(authRoutes);
  await app.register(adminRoutes);
  await app.register(teacherRoutes);
  await app.register(studentRoutes);
  await app.register(statsRoutes);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({ error: 'Validation failed', details: error.message });
    }
    const statusCode = typeof (error as { statusCode?: number }).statusCode === 'number'
      ? (error as { statusCode: number }).statusCode
      : 500;
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (statusCode !== 500) {
      return reply.status(statusCode).send({ error: message });
    }
    app.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  });

  return app;
}
