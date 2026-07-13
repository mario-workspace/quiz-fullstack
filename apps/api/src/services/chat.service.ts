import type { JwtPayload } from './auth.service';
import * as statsService from './stats.service';
import * as classService from './class.service';
import * as assignmentService from './assignment.service';
import * as userService from './user.service';
import * as submissionService from './submission.service';
import * as teacherGroupService from './teacher-group.service';
import { buildChatContext } from './chat.context';
import { generateLlmReply, isLlmConfigured, type ChatTurn } from './chat.llm';
import {
  DATA_REPLY_INTROS,
  humanizeDataReply,
  matchConversationalIntent,
  pickRandom,
} from './chat.expressions';
import { fallbackReply, isDataQuery, matchStaticRule, matchesAny, normalizeForMatch } from './chat.knowledge';
import { matchSchoolLifeDialogue } from './chat.school-life';
import { getWhoAmIReply } from './chat.role-profile';
import {
  ASSIGNMENT_PHRASES,
  CLASS_COUNT_PHRASES,
  GRADE_PHRASES,
  HELP_MENU_PHRASES,
  LIST_CLASSES_PHRASES,
  STATS_PHRASES,
  SUBMIT_PHRASES,
  TEACHER_GRADE_PHRASES,
  WHO_AM_I_PHRASES,
} from './chat.phrases';

export type { ChatTurn } from './chat.llm';

export async function answerQuestion(
  message: string,
  user: JwtPayload,
  options: { history?: ChatTurn[] } = {},
): Promise<string> {
  const trimmed = message.trim();
  if (!trimmed) {
    return pickRandom([
      'Ask me anything about the School Portal — school life, classes, or your stats!',
      'Type a question about this platform — like "What is School Portal?" or "Tell me about school life".',
      'I\'m your School Portal AI assistant! Ask about teachers, students, classes, or homework.',
    ]);
  }

  if (isLlmConfigured()) {
    try {
      const context = await buildChatContext(user);
      return await generateLlmReply(trimmed, user, context, options.history ?? []);
    } catch {
      // Fall back to rule-based replies if the LLM is unavailable.
    }
  }

  return answerWithRules(trimmed, user);
}

async function answerWithRules(message: string, user: JwtPayload): Promise<string> {
  const text = normalizeForMatch(message);
  if (!text) {
    return pickRandom([
      'Ask me anything about the School Portal — school life, classes, or your stats!',
      'Type a question about this platform — like "What is School Portal?" or "Tell me about school life".',
      'I\'m your School Portal AI assistant! Ask about teachers, students, classes, or homework.',
    ]);
  }
  const conversational = !isDataQuery(text) ? matchConversationalIntent(text, user.role) : null;
  if (conversational) return conversational;

  if (matchesAny(text, HELP_MENU_PHRASES)) {
    return [
      'I\'m the School Portal assistant. Here\'s what I can help with on this platform:',
      '• Platform: "What is School Portal?" / "Platform features"',
      '• School life: "Tell me about school life" / "About teachers"',
      '• Your data: "Who am I?" / "Give me my stats" / "List my classes"',
      '• Tasks: assignments, grades, submit homework, enroll students',
      user.role === 'admin' ? '• Admin: "How many teachers?" / manage users' : null,
      user.role === 'teacher' ? '• Teaching: "How do I grade submissions?"' : null,
      user.role === 'student' ? '• Student: "How do I submit homework?"' : null,
    ]
      .filter(Boolean)
      .join('\n');
  }

  if (matchesAny(text, WHO_AM_I_PHRASES)) {
    return getWhoAmIReply(user);
  }

  if (matchesAny(text, STATS_PHRASES)) {
    if (user.role === 'teacher') {
      const stats = await classService.getTeacherStats(user.sub);
      return humanizeDataReply(
        DATA_REPLY_INTROS.stats,
        `you have ${stats.totalClasses} class${stats.totalClasses === 1 ? '' : 'es'} and ${stats.totalAssignments} assignment${stats.totalAssignments === 1 ? '' : 's'}.`,
      );
    }
    if (user.role === 'student') {
      const stats = await classService.getStudentStats(user.sub);
      const grades = await submissionService.getStudentGradeStats(user.sub);
      const gradePart =
        grades.average != null
          ? ` Average marks: ${grades.average.toFixed(1)}.`
          : ' No marks yet — hang in there!';
      return humanizeDataReply(
        DATA_REPLY_INTROS.stats,
        `you're in ${stats.totalClasses} class${stats.totalClasses === 1 ? '' : 'es'} with ${stats.totalAssignments} assignment${stats.totalAssignments === 1 ? '' : 's'}.${gradePart}`,
      );
    }
    const adminStats = await userService.getAdminStats();
    return humanizeDataReply(
      DATA_REPLY_INTROS.stats,
      `the school has ${adminStats.teachers.active} active teachers and ${adminStats.students.active} active students (${adminStats.totalUsers} users total).`,
    );
  }

  if (
    matchesAny(text, ['my average', 'my grade average']) ||
    (text.includes('average grade') && text.includes('my'))
  ) {
    if (user.role === 'student') {
      const grades = await submissionService.getStudentGradeStats(user.sub);
      if (grades.average == null) {
        return pickRandom([
          'No marks yet — once your teacher marks your work, I can tell you your average.',
          'Looks like nothing\'s been marked yet. Check back after your teacher reviews your submissions!',
        ]);
      }
      return humanizeDataReply(
        DATA_REPLY_INTROS.lookup,
        `your average is ${grades.average.toFixed(1)} marks across ${grades.count} marked assignment${grades.count === 1 ? '' : 's'}.`,
      );
    }
  }

  if (text.includes('average') && text.includes('grade')) {
    const stats = await statsService.getAverageGrades();
    if (stats.averageGrade == null) {
      return pickRandom([
        'No school-wide marks recorded yet — check back later!',
        'Looks like nobody\'s been marked yet across the school.',
      ]);
    }
    return humanizeDataReply(
      DATA_REPLY_INTROS.lookup,
      `the school-wide average is ${stats.averageGrade.toFixed(1)} marks.`,
    );
  }

  if (matchesAny(text, LIST_CLASSES_PHRASES)) {
    if (user.role === 'teacher') {
      const classes = await classService.listClasses(user.sub);
      if (classes.length === 0) {
        return pickRandom([
          'You\'re not teaching any classes yet — create one from the Classes page!',
          'No classes on your account yet. Head to Classes to set one up.',
        ]);
      }
      return humanizeDataReply(
        DATA_REPLY_INTROS.lookup,
        `here are your classes:\n${classes.map((c) => `• ${c.name}`).join('\n')}`,
      );
    }
    if (user.role === 'student') {
      const classes = await classService.listStudentClasses(user.sub);
      if (classes.length === 0) {
        return pickRandom([
          'You\'re not enrolled in any classes yet.',
          'No classes yet — your teacher will add you when ready.',
        ]);
      }
      return humanizeDataReply(
        DATA_REPLY_INTROS.lookup,
        `here are your classes:\n${classes.map((c) => `• ${c.name} (teacher: ${c.teacher_name})`).join('\n')}`,
      );
    }
    const { classes } = await statsService.getAllClasses();
    if (classes.length === 0) return 'There are no classes in the school yet.';
    return humanizeDataReply(
      DATA_REPLY_INTROS.lookup,
      `all classes:\n${classes.map((c) => `• ${c.name}`).join('\n')}`,
    );
  }

  if (
    matchesAny(text, CLASS_COUNT_PHRASES) ||
    (text.includes('how many') && text.includes('class'))
  ) {
    if (user.role === 'teacher') {
      const classes = await classService.listClasses(user.sub);
      return humanizeDataReply(
        DATA_REPLY_INTROS.lookup,
        `you teach ${classes.length} class${classes.length === 1 ? '' : 'es'}.`,
      );
    }
    if (user.role === 'student') {
      const classes = await classService.listStudentClasses(user.sub);
      return humanizeDataReply(
        DATA_REPLY_INTROS.lookup,
        `you're enrolled in ${classes.length} class${classes.length === 1 ? '' : 'es'}.`,
      );
    }
    const { classes } = await statsService.getAllClasses();
    return humanizeDataReply(
      DATA_REPLY_INTROS.lookup,
      `there are ${classes.length} class${classes.length === 1 ? '' : 'es'} in the school.`,
    );
  }

  if (text.includes('how many') && text.includes('teacher')) {
    const { teachers } = await statsService.getTeacherNames();
    return humanizeDataReply(
      DATA_REPLY_INTROS.lookup,
      `there are ${teachers.length} active teacher${teachers.length === 1 ? '' : 's'}${teachers.length > 0 ? `: ${teachers.slice(0, 5).join(', ')}${teachers.length > 5 ? ', …' : ''}` : ''}.`,
    );
  }

  if (text.includes('how many') && text.includes('student')) {
    const { students } = await statsService.getStudentNames();
    return humanizeDataReply(
      DATA_REPLY_INTROS.lookup,
      `there are ${students.length} active student${students.length === 1 ? '' : 's'}.`,
    );
  }

  if (text.includes('how many') && matchesAny(text, ['group', 'groups'])) {
    const groups = await teacherGroupService.listTeacherGroups();
    return humanizeDataReply(
      DATA_REPLY_INTROS.lookup,
      `there are ${groups.length} teacher group${groups.length === 1 ? '' : 's'}.`,
    );
  }

  if (matchesAny(text, ASSIGNMENT_PHRASES)) {
    if (user.role === 'teacher') {
      const assignments = await assignmentService.listTeacherAssignments(user.sub);
      const published = assignments.filter((a) => a.published).length;
      const drafts = assignments.length - published;
      return humanizeDataReply(
        DATA_REPLY_INTROS.lookup,
        `you have ${assignments.length} assignment${assignments.length === 1 ? '' : 's'} — ${published} published and ${drafts} draft${drafts === 1 ? '' : 's'}.`,
      );
    }
    if (user.role === 'student') {
      const assignments = await assignmentService.listStudentAssignments(user.sub);
      const graded = assignments.filter((a) => a.score != null).length;
      return humanizeDataReply(
        DATA_REPLY_INTROS.lookup,
        `you have ${assignments.length} assignment${assignments.length === 1 ? '' : 's'} to work on (${graded} already marked).`,
      );
    }
    return 'Teachers create assignments and students submit work — pretty straightforward!';
  }

  if (user.role === 'admin' && matchesAny(text, ['user', 'suspend', 'admin'])) {
    const adminStats = await userService.getAdminStats();
    return humanizeDataReply(
      DATA_REPLY_INTROS.stats,
      `${adminStats.teachers.active} active teachers, ${adminStats.students.active} active students, and ${adminStats.teachers.suspended + adminStats.students.suspended} suspended accounts.`,
    );
  }

  if (user.role === 'teacher' && text.includes('student') && text.includes('class')) {
    return pickRandom([
      'Open a class, search for students, and use the multi-select to enroll or remove them.',
      'Go to a class detail page — you can bulk-enroll students from there.',
    ]);
  }

  if (user.role === 'teacher' && matchesAny(text, TEACHER_GRADE_PHRASES)) {
    return pickRandom([
      'Assignments → View → pick a submission → enter marks 0–100 plus optional feedback.',
      'Open an assignment, view submissions, and mark each one with marks and feedback.',
    ]);
  }

  if (user.role === 'student' && matchesAny(text, GRADE_PHRASES)) {
    const grades = await submissionService.getStudentGradeStats(user.sub);
    if (grades.average == null) {
      return pickRandom([
        'No marks yet — your teacher hasn\'t scored your work. Check Assignments later!',
        'Still waiting on marks. Once they\'re in, you\'ll see them on the Assignments page.',
      ]);
    }
    return humanizeDataReply(
      DATA_REPLY_INTROS.lookup,
      `your average is ${grades.average.toFixed(1)} marks on ${grades.count} marked item${grades.count === 1 ? '' : 's'}. Full details are on Assignments.`,
    );
  }

  if (user.role === 'student' && matchesAny(text, SUBMIT_PHRASES)) {
    return pickRandom([
      'Assignments → View → type your answer → Submit before the deadline!',
      'Find the assignment, open it, write your work, and hit Submit — easy!',
    ]);
  }

  const schoolLife = matchSchoolLifeDialogue(text, user.role);
  if (schoolLife) return schoolLife;

  const staticReply = matchStaticRule(text, user.role);
  if (staticReply) return staticReply;

  return fallbackReply(user.role, user.name);
}
