export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  suspended: boolean;
}

export interface TeacherGroup {
  id: string;
  name: string;
  description: string | null;
  teacher_count?: number;
}

export interface Class {
  id: string;
  name: string;
  description: string | null;
  teacherId: string;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  published: boolean;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  submittedAt: string;
}

export interface Grade {
  id: string;
  submissionId: string;
  score: number;
  feedback: string | null;
  gradedAt: string;
}
