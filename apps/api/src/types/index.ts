export type UserRole = 'admin' | 'teacher' | 'student';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
