import { describe, it, expect } from 'vitest';
import { signToken, verifyToken, getCookieOptions } from './auth.service';

describe('auth.service', () => {
  it('signs and verifies tokens', () => {
    const payload = { sub: '1', email: 'a@b.com', role: 'admin' as const, name: 'Admin' };
    const token = signToken(payload);
    const verified = verifyToken(token);
    expect(verified).toMatchObject(payload);
  });

  it('returns null for invalid token', () => {
    expect(verifyToken('invalid')).toBeNull();
    expect(verifyToken('')).toBeNull();
  });

  it('returns cookie options', () => {
    const opts = getCookieOptions();
    expect(opts.httpOnly).toBe(true);
    expect(opts.sameSite).toBe('lax');
    expect(opts.path).toBe('/');
    expect(opts.maxAge).toBe(7 * 24 * 60 * 60);
    expect(typeof opts.secure).toBe('boolean');
  });
});
