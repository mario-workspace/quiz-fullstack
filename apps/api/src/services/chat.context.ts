import type { JwtPayload } from './auth.service';
import * as statsService from './stats.service';
import * as classService from './class.service';
import * as assignmentService from './assignment.service';
import * as userService from './user.service';
import * as submissionService from './submission.service';
import * as teacherGroupService from './teacher-group.service';

export interface ChatAppContext {
  platform: {
    name: string;
    description: string;
    roles: string[];
    grading: string;
    ui: { theme: string; chat: string };
    navigation: Record<string, string[]>;
  };
  user: {
    name: string;
    email: string;
    role: JwtPayload['role'];
  };
  liveData: Record<string, unknown>;
}

const PLATFORM_INFO = {
  name: 'School Portal',
  description:
    'A Canvas-style educational platform for admins, teachers, and students — classes, assignments, submissions, and marks.',
  roles: ['admin', 'teacher', 'student'],
  grading:
    'Teachers mark submissions with numeric marks from 0–100 (displayed as marks, not percentages). Feedback is optional.',
  ui: {
    theme: 'Light, dark, and system theme via the sun/moon toggle in the navbar (right-click for Light/Dark/System).',
    chat: 'AI assistant available from the chat icon in the navbar.',
  },
  navigation: {
    admin: ['Users', 'Teacher Groups', 'Dashboard overview'],
    teacher: ['Classes', 'Assignments', 'Submissions & marking'],
    student: ['My Classes', 'Assignments', 'Marks overview on dashboard'],
  },
};

export async function buildChatContext(user: JwtPayload): Promise<ChatAppContext> {
  const liveData: Record<string, unknown> = {};

  if (user.role === 'admin') {
    const [adminStats, { classes }, { teachers }, { students }, groups] = await Promise.all([
      userService.getAdminStats(),
      statsService.getAllClasses(),
      statsService.getTeacherNames(),
      statsService.getStudentNames(),
      teacherGroupService.listTeacherGroups(),
    ]);
    liveData.adminStats = adminStats;
    liveData.totalClasses = classes.length;
    liveData.activeTeachers = teachers.length;
    liveData.activeStudents = students.length;
    liveData.teacherGroups = groups.length;
  }

  if (user.role === 'teacher') {
    const [stats, classes, assignments] = await Promise.all([
      classService.getTeacherStats(user.sub),
      classService.listTeacherClasses(user.sub),
      assignmentService.listTeacherAssignments(user.sub),
    ]);
    liveData.teacherStats = stats;
    liveData.classes = classes.map((c) => ({
      name: c.name,
      studentCount: c.student_count ?? 0,
    }));
    liveData.assignments = {
      total: assignments.length,
      published: assignments.filter((a) => a.published).length,
      drafts: assignments.filter((a) => !a.published).length,
    };
  }

  if (user.role === 'student') {
    const [stats, classes, assignments, grades] = await Promise.all([
      classService.getStudentStats(user.sub),
      classService.listStudentClasses(user.sub),
      assignmentService.listStudentAssignments(user.sub),
      submissionService.getStudentGradeStats(user.sub),
    ]);
    liveData.studentStats = stats;
    liveData.classes = classes.map((c) => ({
      name: c.name,
      teacher: c.teacher_name,
    }));
    liveData.assignments = {
      total: assignments.length,
      marked: assignments.filter((a) => a.score != null).length,
    };
    liveData.marks = grades;
  }

  return {
    platform: PLATFORM_INFO,
    user: { name: user.name, email: user.email, role: user.role },
    liveData,
  };
}

/** Compact live snapshot for free-tier LLM calls (fewer tokens). */
export function compactLiveContext(context: ChatAppContext): Record<string, unknown> {
  const { user, liveData } = context;
  const compact: Record<string, unknown> = {
    user: `${user.name} (${user.role})`,
  };

  if (user.role === 'admin') {
    compact.school = {
      classes: liveData.totalClasses,
      teachers: liveData.activeTeachers,
      students: liveData.activeStudents,
      teacherGroups: liveData.teacherGroups,
    };
  }

  if (user.role === 'teacher') {
    compact.classes = liveData.classes;
    compact.assignments = liveData.assignments;
    compact.stats = liveData.teacherStats;
  }

  if (user.role === 'student') {
    compact.classes = liveData.classes;
    compact.assignments = liveData.assignments;
    compact.marks = liveData.marks;
    compact.stats = liveData.studentStats;
  }

  return compact;
}
