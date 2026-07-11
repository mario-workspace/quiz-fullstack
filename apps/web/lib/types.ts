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
  created_at?: string;
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
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  content: string;
  submitted_at: string;
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
