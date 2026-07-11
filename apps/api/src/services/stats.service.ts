import { getDb } from '../db';
import { cacheGet, cacheSet } from './cache.service';

export async function getAverageGrades() {
  const cached = await cacheGet<{ averageGrade: number | null }>('stats:average-grades');
  if (cached) return cached;

  const result = await getDb()
    .selectFrom('grades')
    .select((eb) => eb.fn.avg<number>('grades.score').as('average'))
    .executeTakeFirst();

  const data = { averageGrade: result?.average != null ? Number(result.average) : null };
  await cacheSet('stats:average-grades', data);
  return data;
}

export async function getAverageGradesByClass(classId: string) {
  const cacheKey = `stats:average-grades:${classId}`;
  const cached = await cacheGet<{ classId: string; averageGrade: number | null }>(cacheKey);
  if (cached) return cached;

  const result = await getDb()
    .selectFrom('grades')
    .innerJoin('submissions', 'submissions.id', 'grades.submission_id')
    .innerJoin('assignments', 'assignments.id', 'submissions.assignment_id')
    .select((eb) => eb.fn.avg<number>('grades.score').as('average'))
    .where('assignments.class_id', '=', classId)
    .executeTakeFirst();

  const data = {
    classId,
    averageGrade: result?.average != null ? Number(result.average) : null,
  };
  await cacheSet(cacheKey, data);
  return data;
}

export async function getTeacherNames() {
  const cached = await cacheGet<{ teachers: string[] }>('stats:teacher-names');
  if (cached) return cached;

  const rows = await getDb()
    .selectFrom('users')
    .select('name')
    .where('role', '=', 'teacher')
    .where('suspended', '=', false)
    .orderBy('name', 'asc')
    .execute();

  const data = { teachers: rows.map((r) => r.name) };
  await cacheSet('stats:teacher-names', data);
  return data;
}

export async function getStudentNames() {
  const cached = await cacheGet<{ students: string[] }>('stats:student-names');
  if (cached) return cached;

  const rows = await getDb()
    .selectFrom('users')
    .select('name')
    .where('role', '=', 'student')
    .where('suspended', '=', false)
    .orderBy('name', 'asc')
    .execute();

  const data = { students: rows.map((r) => r.name) };
  await cacheSet('stats:student-names', data);
  return data;
}

export async function getAllClasses() {
  const cached = await cacheGet<{ classes: { id: string; name: string }[] }>('stats:classes');
  if (cached) return cached;

  const rows = await getDb()
    .selectFrom('classes')
    .select(['id', 'name'])
    .orderBy('name', 'asc')
    .execute();

  const data = { classes: rows };
  await cacheSet('stats:classes', data);
  return data;
}

export async function getClassStudents(classId: string) {
  const cacheKey = `stats:classes:${classId}:students`;
  const cached = await cacheGet<{ classId: string; students: string[] }>(cacheKey);
  if (cached) return cached;

  const rows = await getDb()
    .selectFrom('class_enrollments')
    .innerJoin('users', 'users.id', 'class_enrollments.student_id')
    .select('users.name')
    .where('class_enrollments.class_id', '=', classId)
    .orderBy('users.name', 'asc')
    .execute();

  const data = { classId, students: rows.map((r) => r.name) };
  await cacheSet(cacheKey, data);
  return data;
}
