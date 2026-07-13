import { describe, it, expect } from 'vitest';
import { getWhoAmIReply } from './chat.role-profile';
import type { JwtPayload } from './auth.service';

describe('getWhoAmIReply', () => {
  it('lists all admin functions', () => {
    const user: JwtPayload = { sub: '1', email: 'a@test.com', name: 'Admin User', role: 'admin' };
    const reply = getWhoAmIReply(user);
    expect(reply).toContain('Admin User');
    expect(reply).toContain('admin');
    expect(reply).toContain('Users');
    expect(reply).toContain('Groups');
  });

  it('lists teacher functions', () => {
    const user: JwtPayload = { sub: '2', email: 't@test.com', name: 'Teacher User', role: 'teacher' };
    const reply = getWhoAmIReply(user);
    expect(reply).toContain('teacher');
    expect(reply).toContain('Classes');
    expect(reply).toContain('Assignments');
    expect(reply).toContain('Marking');
  });

  it('lists student functions', () => {
    const user: JwtPayload = { sub: '3', email: 's@test.com', name: 'Student User', role: 'student' };
    const reply = getWhoAmIReply(user);
    expect(reply).toContain('student');
    expect(reply).toContain('My Classes');
    expect(reply).toContain('Assignments');
    expect(reply).toContain('Marks');
  });
});
