import { getDb } from '../db';

export interface CreateClassInput {
  name: string;
  description?: string;
  teacherId: string;
}

export interface UpdateClassInput {
  name?: string;
  description?: string;
}

export async function listClasses(teacherId?: string) {
  let query = getDb().selectFrom('classes').selectAll().orderBy('created_at', 'desc');
  if (teacherId) {
    query = query.where('teacher_id', '=', teacherId);
  }
  return query.execute();
}

export async function getClass(id: string) {
  return getDb().selectFrom('classes').selectAll().where('id', '=', id).executeTakeFirst();
}

export async function createClass(input: CreateClassInput) {
  return getDb()
    .insertInto('classes')
    .values({
      name: input.name,
      description: input.description ?? null,
      teacher_id: input.teacherId,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function updateClass(id: string, input: UpdateClassInput) {
  const updates: Record<string, unknown> = {};
  if (input.name) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description;

  return getDb()
    .updateTable('classes')
    .set(updates)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();
}

export async function deleteClass(id: string) {
  const result = await getDb().deleteFrom('classes').where('id', '=', id).executeTakeFirst();
  return Number(result.numDeletedRows) > 0;
}

export async function addStudentToClass(classId: string, studentId: string) {
  await getDb()
    .insertInto('class_enrollments')
    .values({ class_id: classId, student_id: studentId })
    .onConflict((oc) => oc.columns(['class_id', 'student_id']).doNothing())
    .execute();
}

export async function removeStudentFromClass(classId: string, studentId: string) {
  const result = await getDb()
    .deleteFrom('class_enrollments')
    .where('class_id', '=', classId)
    .where('student_id', '=', studentId)
    .executeTakeFirst();
  return Number(result.numDeletedRows) > 0;
}

export async function listClassStudents(classId: string) {
  return getDb()
    .selectFrom('class_enrollments')
    .innerJoin('users', 'users.id', 'class_enrollments.student_id')
    .select(['users.id', 'users.email', 'users.name', 'users.suspended', 'class_enrollments.enrolled_at'])
    .where('class_enrollments.class_id', '=', classId)
    .execute();
}

export async function listStudentClasses(studentId: string) {
  return getDb()
    .selectFrom('class_enrollments')
    .innerJoin('classes', 'classes.id', 'class_enrollments.class_id')
    .select([
      'classes.id',
      'classes.name',
      'classes.description',
      'classes.teacher_id',
      'class_enrollments.enrolled_at',
    ])
    .where('class_enrollments.student_id', '=', studentId)
    .execute();
}
