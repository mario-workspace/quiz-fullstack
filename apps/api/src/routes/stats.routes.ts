import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as statsService from '../services/stats.service';

export async function statsRoutes(app: FastifyInstance) {
  app.get('/api/v0/stats/average-grades', async () => statsService.getAverageGrades());

  app.get('/api/v0/stats/average-grades/:id', async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    return statsService.getAverageGradesByClass(id);
  });

  app.get('/api/v0/stats/teacher-names', async () => statsService.getTeacherNames());

  app.get('/api/v0/stats/student-names', async () => statsService.getStudentNames());

  app.get('/api/v0/stats/classes', async () => statsService.getAllClasses());

  app.get('/api/v0/stats/classes/:id', async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    return statsService.getClassStudents(id);
  });
}
