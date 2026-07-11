import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireRole } from '../plugins/auth';
import * as classService from '../services/class.service';
import * as assignmentService from '../services/assignment.service';
import * as submissionService from '../services/submission.service';
import * as userService from '../services/user.service';

export async function teacherRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireRole('teacher'));

  app.get('/teacher/stats', async (request) => {
    return classService.getTeacherStats(request.user!.sub);
  });

  app.get('/teacher/classes', async (request) => {
    return classService.listTeacherClasses(request.user!.sub);
  });

  app.get('/teacher/classes/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const cls = await classService.getClass(id);
    if (!cls || cls.teacher_id !== request.user!.sub) {
      return reply.status(403).send({ error: 'Not your class' });
    }
    const students = await classService.listClassStudents(id);
    return { ...cls, student_count: students.length };
  });

  app.post('/teacher/classes', async (request) => {
    const body = z
      .object({ name: z.string().min(1), description: z.string().optional() })
      .parse(request.body);
    return classService.createClass({ ...body, teacherId: request.user!.sub });
  });

  app.put('/teacher/classes/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z
      .object({ name: z.string().min(1).optional(), description: z.string().optional() })
      .parse(request.body);
    const cls = await classService.getClass(id);
    if (!cls || cls.teacher_id !== request.user!.sub) {
      return reply.status(403).send({ error: 'Not your class' });
    }
    const updated = await classService.updateClass(id, body);
    if (!updated) return reply.status(404).send({ error: 'Class not found' });
    return updated;
  });

  app.delete('/teacher/classes/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const cls = await classService.getClass(id);
    if (!cls || cls.teacher_id !== request.user!.sub) {
      return reply.status(403).send({ error: 'Not your class' });
    }
    const deleted = await classService.deleteClass(id);
    if (!deleted) return reply.status(404).send({ error: 'Class not found' });
    return { success: true };
  });

  app.post('/teacher/classes/:id/students', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({ email: z.string().email() }).parse(request.body);
    const cls = await classService.getClass(id);
    if (!cls || cls.teacher_id !== request.user!.sub) {
      return reply.status(403).send({ error: 'Not your class' });
    }
    const student = await userService.getUserByEmail(body.email);
    if (!student || student.role !== 'student') {
      return reply.status(404).send({ error: 'Student not found' });
    }
    if (student.suspended) {
      return reply.status(400).send({ error: 'Cannot enroll suspended student' });
    }
    await classService.addStudentToClass(id, student.id);
    return { success: true };
  });

  app.delete('/teacher/classes/:classId/students/:studentId', async (request, reply) => {
    const params = z
      .object({ classId: z.string().uuid(), studentId: z.string().uuid() })
      .parse(request.params);
    const cls = await classService.getClass(params.classId);
    if (!cls || cls.teacher_id !== request.user!.sub) {
      return reply.status(403).send({ error: 'Not your class' });
    }
    const removed = await classService.removeStudentFromClass(params.classId, params.studentId);
    if (!removed) return reply.status(404).send({ error: 'Student not in class' });
    return { success: true };
  });

  app.get('/teacher/classes/:id/students', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const cls = await classService.getClass(id);
    if (!cls || cls.teacher_id !== request.user!.sub) {
      return reply.status(403).send({ error: 'Not your class' });
    }
    return classService.listClassStudents(id);
  });

  app.get('/teacher/assignments', async (request) => {
    const query = z.object({ classId: z.string().uuid().optional() }).parse(request.query);
    return assignmentService.listTeacherAssignments(request.user!.sub, query.classId);
  });

  app.post('/teacher/assignments', async (request, reply) => {
    const body = z
      .object({
        classId: z.string().uuid(),
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.string().optional(),
      })
      .parse(request.body);
    const cls = await classService.getClass(body.classId);
    if (!cls || cls.teacher_id !== request.user!.sub) {
      return reply.status(403).send({ error: 'Not your class' });
    }
    return assignmentService.createAssignment(body);
  });

  app.post('/teacher/assignments/:id/publish', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const assignment = await assignmentService.getAssignment(id);
    if (!assignment) return reply.status(404).send({ error: 'Assignment not found' });
    const cls = await classService.getClass(assignment.class_id);
    if (!cls || cls.teacher_id !== request.user!.sub) {
      return reply.status(403).send({ error: 'Not your assignment' });
    }
    return assignmentService.publishAssignment(id);
  });

  app.post('/teacher/assignments/:id/unpublish', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const assignment = await assignmentService.getAssignment(id);
    if (!assignment) return reply.status(404).send({ error: 'Assignment not found' });
    const cls = await classService.getClass(assignment.class_id);
    if (!cls || cls.teacher_id !== request.user!.sub) {
      return reply.status(403).send({ error: 'Not your assignment' });
    }
    return assignmentService.unpublishAssignment(id);
  });

  app.put('/teacher/assignments/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z
      .object({
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        dueDate: z.string().nullable().optional(),
      })
      .parse(request.body);
    const assignment = await assignmentService.getAssignment(id);
    if (!assignment) return reply.status(404).send({ error: 'Assignment not found' });
    const cls = await classService.getClass(assignment.class_id);
    if (!cls || cls.teacher_id !== request.user!.sub) {
      return reply.status(403).send({ error: 'Not your assignment' });
    }
    const updated = await assignmentService.updateAssignment(id, body);
    if (!updated) return reply.status(404).send({ error: 'Assignment not found' });
    return updated;
  });

  app.delete('/teacher/assignments/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const assignment = await assignmentService.getAssignment(id);
    if (!assignment) return reply.status(404).send({ error: 'Assignment not found' });
    const cls = await classService.getClass(assignment.class_id);
    if (!cls || cls.teacher_id !== request.user!.sub) {
      return reply.status(403).send({ error: 'Not your assignment' });
    }
    const deleted = await assignmentService.deleteAssignment(id);
    if (!deleted) return reply.status(404).send({ error: 'Assignment not found' });
    return { success: true };
  });

  app.get('/teacher/assignments/:id/submissions', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const assignment = await assignmentService.getAssignment(id);
    if (!assignment) return reply.status(404).send({ error: 'Assignment not found' });
    const cls = await classService.getClass(assignment.class_id);
    if (!cls || cls.teacher_id !== request.user!.sub) {
      return reply.status(403).send({ error: 'Not your assignment' });
    }
    return submissionService.listSubmissionsForAssignment(id);
  });

  app.post('/teacher/submissions/:id/grade', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z
      .object({ score: z.number().min(0).max(100), feedback: z.string().optional() })
      .parse(request.body);

    const submission = await submissionService.getSubmission(id);
    if (!submission) return reply.status(404).send({ error: 'Submission not found' });

    const assignment = await assignmentService.getAssignment(submission.assignment_id);
    if (!assignment) return reply.status(404).send({ error: 'Assignment not found' });

    const cls = await classService.getClass(assignment.class_id);
    if (!cls || cls.teacher_id !== request.user!.sub) {
      return reply.status(403).send({ error: 'Not your submission' });
    }

    return submissionService.gradeSubmission({
      submissionId: id,
      score: body.score,
      feedback: body.feedback,
    });
  });
}
