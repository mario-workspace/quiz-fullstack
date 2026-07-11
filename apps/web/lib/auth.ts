import { api } from './api';

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
}

export interface LoginUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const data = await api<{ user: AuthUser }>('/auth/me');
    return data.user;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string) {
  return api<{ user: LoginUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  return api('/auth/logout', { method: 'POST' });
}
