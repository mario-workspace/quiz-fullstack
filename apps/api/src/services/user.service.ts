import { getDb } from '../db';
import type { UserRole } from '../types';
import { hashPassword } from './auth.service';

export { hashPassword, verifyPassword } from './auth.service';

export interface CreateUserInput {
  email: string;
  name: string;
  password?: string;
  role: UserRole;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
}

export async function listUsers() {
  return getDb()
    .selectFrom('users')
    .select(['id', 'email', 'name', 'role', 'suspended', 'created_at'])
    .orderBy('created_at', 'desc')
    .execute();
}

export async function listTeachers() {
  return getDb()
    .selectFrom('users')
    .select(['id', 'email', 'name', 'role', 'suspended', 'created_at'])
    .where('role', '=', 'teacher')
    .orderBy('email', 'asc')
    .execute();
}

export async function getUserById(id: string) {
  return getDb()
    .selectFrom('users')
    .select(['id', 'email', 'name', 'role', 'suspended', 'created_at'])
    .where('id', '=', id)
    .executeTakeFirst();
}

export async function getUserByEmail(email: string) {
  return getDb().selectFrom('users').selectAll().where('email', '=', email).executeTakeFirst();
}

export async function createUser(input: CreateUserInput) {
  return getDb()
    .insertInto('users')
    .values({
      email: input.email,
      name: input.name,
      password_hash: input.password ? hashPassword(input.password) : null,
      role: input.role,
      suspended: false,
      oauth_provider: null,
      oauth_id: null,
    })
    .returning(['id', 'email', 'name', 'role', 'suspended', 'created_at'])
    .executeTakeFirstOrThrow();
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const updates: Record<string, unknown> = {};
  if (input.email) updates.email = input.email;
  if (input.name) updates.name = input.name;
  if (input.role) updates.role = input.role;
  if (input.password) updates.password_hash = hashPassword(input.password);

  return getDb()
    .updateTable('users')
    .set(updates)
    .where('id', '=', id)
    .returning(['id', 'email', 'name', 'role', 'suspended', 'created_at'])
    .executeTakeFirst();
}

export async function deleteUser(id: string) {
  const result = await getDb().deleteFrom('users').where('id', '=', id).executeTakeFirst();
  return Number(result.numDeletedRows) > 0;
}

export async function setSuspended(id: string, suspended: boolean) {
  return getDb()
    .updateTable('users')
    .set({ suspended })
    .where('id', '=', id)
    .returning(['id', 'email', 'name', 'role', 'suspended', 'created_at'])
    .executeTakeFirst();
}

export async function findOrCreateOAuthUser(
  provider: string,
  oauthId: string,
  email: string,
  name: string,
  role: UserRole = 'student',
) {
  const existing = await getDb()
    .selectFrom('users')
    .selectAll()
    .where('oauth_provider', '=', provider)
    .where('oauth_id', '=', oauthId)
    .executeTakeFirst();

  if (existing) return existing;

  const byEmail = await getUserByEmail(email);
  if (byEmail) {
    return getDb()
      .updateTable('users')
      .set({ oauth_provider: provider, oauth_id: oauthId })
      .where('id', '=', byEmail.id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  return getDb()
    .insertInto('users')
    .values({
      email,
      name,
      password_hash: null,
      role,
      suspended: false,
      oauth_provider: provider,
      oauth_id: oauthId,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}
