import type { Generated } from 'kysely';
import type { UserRole } from '../types';

export type { UserRole };

export interface UsersTable {
  id: Generated<string>;
  email: string;
  name: string;
  password_hash: string | null;
  role: UserRole;
  suspended: boolean;
  oauth_provider: string | null;
  oauth_id: string | null;
  created_at: Generated<Date>;
}

export interface TeacherGroupsTable {
  id: Generated<string>;
  name: string;
  description: string | null;
  created_at: Generated<Date>;
}

export interface TeacherGroupMembersTable {
  teacher_group_id: string;
  teacher_id: string;
}

export interface ClassesTable {
  id: Generated<string>;
  name: string;
  description: string | null;
  teacher_id: string;
  created_at: Generated<Date>;
}

export interface ClassEnrollmentsTable {
  class_id: string;
  student_id: string;
  enrolled_at: Generated<Date>;
}

export interface AssignmentsTable {
  id: Generated<string>;
  class_id: string;
  title: string;
  description: string | null;
  due_date: Date | null;
  published: boolean;
  created_at: Generated<Date>;
}

export interface SubmissionsTable {
  id: Generated<string>;
  assignment_id: string;
  student_id: string;
  content: string;
  submitted_at: Generated<Date>;
}

export interface GradesTable {
  id: Generated<string>;
  submission_id: string;
  score: number;
  feedback: string | null;
  graded_at: Generated<Date>;
}

export interface Database {
  users: UsersTable;
  teacher_groups: TeacherGroupsTable;
  teacher_group_members: TeacherGroupMembersTable;
  classes: ClassesTable;
  class_enrollments: ClassEnrollmentsTable;
  assignments: AssignmentsTable;
  submissions: SubmissionsTable;
  grades: GradesTable;
}
