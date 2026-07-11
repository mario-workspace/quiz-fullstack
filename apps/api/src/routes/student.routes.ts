import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireRole } from '../plugins/auth';
import * as classService from '../services/class.service';
import * as assignmentService from '../services/assignment.service';
import * as submissionService from '../services/submission.service';

export async function studentRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireRole('student'));

  app.get('/student/stats', async (request) => {
    const studentId = request.user!.sub;
    const [stats, grades] = await Promise.all([
      classService.getStudentStats(studentId),
      submissionService.getStudentGradeStats(studentId),
    ]);
    return { ...stats, grades };
  });

  app.get('/student/classes', async (request) => {
    return classService.listStudentClasses(request.user!.sub);
  });

  app.get('/student/classes/:classId/assignments', async (request, reply) => {
    const { classId } = z.object({ classId: z.string().uuid() }).parse(request.params);
    const assignments = await assignmentService.listStudentAssignmentsForClass(
      request.user!.sub,
      classId,
    );
    if (assignments === null) {
      return reply.status(403).send({ error: 'Not enrolled in this class' });
    }
    return assignments;
  });

  app.get('/student/assignments', async (request) => {
    const query = z.object({ classId: z.string().uuid().optional() }).parse(request.query);
    return assignmentService.listStudentAssignments(request.user!.sub, query.classId);
  });

  app.post('/student/assignments/:id/submit', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({ content: z.string().min(1) }).parse(request.body);

    const assignment = await assignmentService.getAssignment(id);
    if (!assignment || !assignment.published) {
      return reply.status(404).send({ error: 'Assignment not found' });
    }

    if (assignment.due_date && new Date(assignment.due_date) < new Date()) {
      return reply.status(400).send({ error: 'Assignment is past due date' });
    }

    const enrolled = await classService.listStudentClasses(request.user!.sub);
    if (!enrolled.some((c) => c.id === assignment.class_id)) {
      return reply.status(403).send({ error: 'Not enrolled in this class' });
    }

    return submissionService.submitAssignment({
      assignmentId: id,
      studentId: request.user!.sub,
      content: body.content,
    });
  });

  app.get('/student/grades', async (request) => {
    return submissionService.listStudentGrades(request.user!.sub);
  });

  app.get('/student/assignments/:id/submission', async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const submission = await submissionService.getStudentSubmission(id, request.user!.sub);
    if (!submission) return { submission: null, grade: null };

    const grade = await submissionService.getStudentGrade(submission.id);
    return { submission, grade };
  });
}
