import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashPassword, verifyPassword, listUsers, getUserByEmail } from './user.service';

vi.mock('../db', () => ({
  getDb: vi.fn(),
}));

import { getDb } from '../db';

describe('user.service password', () => {
  it('hashes and verifies passwords', () => {
    const hash = hashPassword('secret123');
    expect(hash).toContain(':');
    expect(verifyPassword('secret123', hash)).toBe(true);
    expect(verifyPassword('wrong', hash)).toBe(false);
  });

  it('returns false for malformed hash', () => {
    expect(verifyPassword('secret', 'badhash')).toBe(false);
    expect(verifyPassword('secret', 'only:salt:no:hash')).toBe(false);
  });

  it('produces different hashes for the same password', () => {
    const first = hashPassword('secret123');
    const second = hashPassword('secret123');
    expect(first).not.toBe(second);
    expect(verifyPassword('secret123', first)).toBe(true);
    expect(verifyPassword('secret123', second)).toBe(true);
  });
});

describe('user.service database functions', () => {
  const execute = vi.fn();
  const executeTakeFirst = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDb).mockReturnValue({
      selectFrom: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({ execute }),
        }),
        selectAll: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({ executeTakeFirst }),
        }),
      }),
    } as never);
  });

  it('listUsers queries users table', async () => {
    execute.mockResolvedValue([{ id: '1', email: 'a@b.com', name: 'A', role: 'admin' }]);
    const users = await listUsers();
    expect(users).toHaveLength(1);
    expect(getDb).toHaveBeenCalled();
  });

  it('getUserByEmail queries by email', async () => {
    executeTakeFirst.mockResolvedValue({ id: '1', email: 'a@b.com' });
    const user = await getUserByEmail('a@b.com');
    expect(user).toEqual({ id: '1', email: 'a@b.com' });
  });
});
