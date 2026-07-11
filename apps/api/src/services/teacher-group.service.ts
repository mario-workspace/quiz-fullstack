import { getDb } from '../db';

export interface CreateTeacherGroupInput {
  name: string;
  description?: string;
}

export interface UpdateTeacherGroupInput {
  name?: string;
  description?: string;
}

export async function listTeacherGroups() {
  return getDb()
    .selectFrom('teacher_groups')
    .selectAll()
    .orderBy('created_at', 'desc')
    .execute();
}

export async function getTeacherGroup(id: string) {
  return getDb().selectFrom('teacher_groups').selectAll().where('id', '=', id).executeTakeFirst();
}

export async function createTeacherGroup(input: CreateTeacherGroupInput) {
  return getDb()
    .insertInto('teacher_groups')
    .values({
      name: input.name,
      description: input.description ?? null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function updateTeacherGroup(id: string, input: UpdateTeacherGroupInput) {
  const updates: Record<string, unknown> = {};
  if (input.name) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description;

  return getDb()
    .updateTable('teacher_groups')
    .set(updates)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();
}

export async function deleteTeacherGroup(id: string) {
  const result = await getDb().deleteFrom('teacher_groups').where('id', '=', id).executeTakeFirst();
  return Number(result.numDeletedRows) > 0;
}

export async function addTeacherToGroup(groupId: string, teacherId: string) {
  await getDb()
    .insertInto('teacher_group_members')
    .values({ teacher_group_id: groupId, teacher_id: teacherId })
    .onConflict((oc) => oc.columns(['teacher_group_id', 'teacher_id']).doNothing())
    .execute();
}

export async function removeTeacherFromGroup(groupId: string, teacherId: string) {
  const result = await getDb()
    .deleteFrom('teacher_group_members')
    .where('teacher_group_id', '=', groupId)
    .where('teacher_id', '=', teacherId)
    .executeTakeFirst();
  return Number(result.numDeletedRows) > 0;
}

export async function listGroupTeachers(groupId: string) {
  return getDb()
    .selectFrom('teacher_group_members')
    .innerJoin('users', 'users.id', 'teacher_group_members.teacher_id')
    .select(['users.id', 'users.email', 'users.name', 'users.role', 'users.suspended'])
    .where('teacher_group_members.teacher_group_id', '=', groupId)
    .execute();
}
