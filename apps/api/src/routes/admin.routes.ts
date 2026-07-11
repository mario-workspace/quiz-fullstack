import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireRole } from '../plugins/auth';
import * as userService from '../services/user.service';
import * as teacherGroupService from '../services/teacher-group.service';

export async function adminRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireRole('admin'));

  // Users CRUD
  app.get('/admin/users', async () => userService.listUsers());

  app.get('/admin/stats', async () => userService.getAdminStats());

  app.get('/admin/teachers', async () => userService.listTeachers());

  app.post('/admin/users', async (request) => {
    const body = z
      .object({
        email: z.string().email(),
        name: z.string().min(1),
        password: z.string().min(6),
        role: z.enum(['admin', 'teacher', 'student']),
      })
      .parse(request.body);
    return userService.createUser(body);
  });

  app.put('/admin/users/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z
      .object({
        email: z.string().email().optional(),
        name: z.string().min(1).optional(),
        password: z.string().min(6).optional(),
        role: z.enum(['admin', 'teacher', 'student']).optional(),
      })
      .parse(request.body);
    const user = await userService.updateUser(id, body);
    if (!user) return reply.status(404).send({ error: 'User not found' });
    return user;
  });

  app.delete('/admin/users/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const deleted = await userService.deleteUser(id);
    if (!deleted) return reply.status(404).send({ error: 'User not found' });
    return { success: true };
  });

  app.post('/admin/users/:id/suspend', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const user = await userService.setSuspended(id, true);
    if (!user) return reply.status(404).send({ error: 'User not found' });
    return user;
  });

  app.post('/admin/users/:id/unsuspend', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const user = await userService.setSuspended(id, false);
    if (!user) return reply.status(404).send({ error: 'User not found' });
    return user;
  });

  // Teacher groups CRUD
  app.get('/admin/teacher-groups', async () => teacherGroupService.listTeacherGroups());

  app.post('/admin/teacher-groups', async (request) => {
    const body = z
      .object({ name: z.string().min(1), description: z.string().optional() })
      .parse(request.body);
    return teacherGroupService.createTeacherGroup(body);
  });

  app.put('/admin/teacher-groups/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z
      .object({ name: z.string().min(1).optional(), description: z.string().optional() })
      .parse(request.body);
    const group = await teacherGroupService.updateTeacherGroup(id, body);
    if (!group) return reply.status(404).send({ error: 'Teacher group not found' });
    return group;
  });

  app.delete('/admin/teacher-groups/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const deleted = await teacherGroupService.deleteTeacherGroup(id);
    if (!deleted) return reply.status(404).send({ error: 'Teacher group not found' });
    return { success: true };
  });

  app.post('/admin/teacher-groups/:id/teachers', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z
      .object({
        email: z.string().email().optional(),
        emails: z.array(z.string().email()).min(1).optional(),
      })
      .refine((data) => data.email || (data.emails && data.emails.length > 0), {
        message: 'Provide email or emails',
      })
      .parse(request.body);

    const emails = body.emails ?? (body.email ? [body.email] : []);
    const added: string[] = [];
    const notFound: string[] = [];

    for (const email of emails) {
      const teacher = await userService.getUserByEmail(email);
      if (!teacher || teacher.role !== 'teacher' || teacher.suspended) {
        notFound.push(email);
        continue;
      }
      await teacherGroupService.addTeacherToGroup(id, teacher.id);
      added.push(email);
    }

    if (added.length === 0) {
      return reply.status(404).send({ error: 'No teachers found for the provided emails' });
    }

    return { success: true, added, notFound };
  });

  app.delete('/admin/teacher-groups/:groupId/teachers/:teacherId', async (request, reply) => {
    const params = z
      .object({ groupId: z.string().uuid(), teacherId: z.string().uuid() })
      .parse(request.params);
    const removed = await teacherGroupService.removeTeacherFromGroup(
      params.groupId,
      params.teacherId,
    );
    if (!removed) return reply.status(404).send({ error: 'Membership not found' });
    return { success: true };
  });

  app.get('/admin/teacher-groups/:id/teachers', async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    return teacherGroupService.listGroupTeachers(id);
  });
}
