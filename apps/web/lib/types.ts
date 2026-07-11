export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  suspended: boolean;
  created_at?: string;
}

export interface TeacherGroup {
  id: string;
  name: string;
  description: string | null;
  created_at?: string;
  teacher_count?: number;
}

export interface GroupTeacher {
  id: string;
  name: string;
  email: string;
}

export interface ClassItem {
  id: string;
  name: string;
  description: string | null;
  teacher_id?: string;
  teacher_name?: string;
  created_at?: string;
  student_count?: number;
}

export interface ClassStudent {
  id: string;
  name: string;
  email: string;
}

export interface Assignment {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  published: boolean;
  created_at?: string;
  class_name?: string;
  submission_id?: string | null;
  score?: number | null;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  content: string;
  submitted_at: string;
  score?: number | null;
  feedback?: string | null;
  graded_at?: string | null;
}

export interface Grade {
  id: string;
  submission_id: string;
  score: number;
  feedback: string | null;
  graded_at: string;
  assignment_title?: string;
  class_name?: string;
}
