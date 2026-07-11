import { getDb } from '../db';

export interface CreateAssignmentInput {
  classId: string;
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateAssignmentInput {
  title?: string;
  description?: string;
  dueDate?: string | null;
  published?: boolean;
}

export async function listAssignments(classId?: string, publishedOnly = false) {
  let query = getDb().selectFrom('assignments').selectAll().orderBy('created_at', 'desc');
  if (classId) query = query.where('class_id', '=', classId);
  if (publishedOnly) query = query.where('published', '=', true);
  return query.execute();
}

export async function getAssignment(id: string) {
  return getDb().selectFrom('assignments').selectAll().where('id', '=', id).executeTakeFirst();
}

export async function createAssignment(input: CreateAssignmentInput) {
  return getDb()
    .insertInto('assignments')
    .values({
      class_id: input.classId,
      title: input.title,
      description: input.description ?? null,
      due_date: input.dueDate ? new Date(input.dueDate) : null,
      published: false,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function updateAssignment(id: string, input: UpdateAssignmentInput) {
  const updates: Record<string, unknown> = {};
  if (input.title) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.dueDate !== undefined) updates.due_date = input.dueDate ? new Date(input.dueDate) : null;
  if (input.published !== undefined) updates.published = input.published;

  return getDb()
    .updateTable('assignments')
    .set(updates)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();
}

export async function publishAssignment(id: string) {
  return updateAssignment(id, { published: true });
}

export async function unpublishAssignment(id: string) {
  return updateAssignment(id, { published: false });
}

export async function deleteAssignment(id: string) {
  const result = await getDb().deleteFrom('assignments').where('id', '=', id).executeTakeFirst();
  return Number(result.numDeletedRows) > 0;
}

export async function getTeacherAssignment(teacherId: string, assignmentId: string) {
  return getDb()
    .selectFrom('assignments')
    .innerJoin('classes', 'classes.id', 'assignments.class_id')
    .select([
      'assignments.id',
      'assignments.class_id',
      'assignments.title',
      'assignments.description',
      'assignments.due_date',
      'assignments.published',
      'assignments.created_at',
      'classes.name as class_name',
    ])
    .where('assignments.id', '=', assignmentId)
    .where('classes.teacher_id', '=', teacherId)
    .executeTakeFirst();
}

export async function listTeacherAssignments(teacherId: string, classId?: string) {
  let query = getDb()
    .selectFrom('assignments')
    .innerJoin('classes', 'classes.id', 'assignments.class_id')
    .select([
      'assignments.id',
      'assignments.class_id',
      'assignments.title',
      'assignments.description',
      'assignments.due_date',
      'assignments.published',
      'assignments.created_at',
      'classes.name as class_name',
    ])
    .where('classes.teacher_id', '=', teacherId)
    .orderBy('assignments.created_at', 'desc');
  if (classId) query = query.where('assignments.class_id', '=', classId);
  return query.execute();
}

export async function listStudentAssignmentsForClass(studentId: string, classId: string) {
  const enrollment = await getDb()
    .selectFrom('class_enrollments')
    .select('class_id')
    .where('class_id', '=', classId)
    .where('student_id', '=', studentId)
    .executeTakeFirst();
  if (!enrollment) return null;

  return getDb()
    .selectFrom('assignments')
    .select([
      'assignments.id',
      'assignments.class_id',
      'assignments.title',
      'assignments.description',
      'assignments.due_date',
      'assignments.published',
      'assignments.created_at',
    ])
    .where('class_id', '=', classId)
    .where('published', '=', true)
    .orderBy('assignments.due_date', 'asc')
    .execute();
}

export async function listStudentAssignments(studentId: string) {
  return getDb()
    .selectFrom('assignments')
    .innerJoin('class_enrollments', 'class_enrollments.class_id', 'assignments.class_id')
    .select([
      'assignments.id',
      'assignments.class_id',
      'assignments.title',
      'assignments.description',
      'assignments.due_date',
      'assignments.published',
      'assignments.created_at',
    ])
    .where('class_enrollments.student_id', '=', studentId)
    .where('assignments.published', '=', true)
    .orderBy('assignments.due_date', 'asc')
    .execute();
}
