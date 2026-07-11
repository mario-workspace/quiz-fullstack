import type { JwtPayload } from './auth.service';
import * as statsService from './stats.service';
import * as classService from './class.service';
import * as assignmentService from './assignment.service';

export async function answerQuestion(message: string, user: JwtPayload): Promise<string> {
  const text = message.trim().toLowerCase();
  if (!text) return 'Please ask a question about the School Portal.';

  if (text.includes('help') || text.includes('what can you')) {
    return [
      'I can help with:',
      '- Your role and available features',
      '- Class and assignment counts',
      '- School-wide grade averages',
      'Try: "How many classes do I have?" or "What is the average grade?"',
    ].join('\n');
  }

  if (text.includes('average') && text.includes('grade')) {
    const stats = await statsService.getAverageGrades();
    if (stats.averageGrade == null) return 'No grades have been recorded yet.';
    return `The school-wide average grade is ${stats.averageGrade.toFixed(1)}%.`;
  }

  if (text.includes('how many') && text.includes('class')) {
    if (user.role === 'teacher') {
      const classes = await classService.listClasses(user.sub);
      return `You teach ${classes.length} class${classes.length === 1 ? '' : 'es'}.`;
    }
    if (user.role === 'student') {
      const classes = await classService.listStudentClasses(user.sub);
      return `You are enrolled in ${classes.length} class${classes.length === 1 ? '' : 'es'}.`;
    }
    const classes = await statsService.getAllClasses();
    return `There are ${classes.classes.length} classes in the school.`;
  }

  if (text.includes('assignment')) {
    if (user.role === 'teacher') {
      const assignments = await assignmentService.listTeacherAssignments(user.sub);
      const published = assignments.filter((a) => a.published).length;
      return `You have ${assignments.length} assignment${assignments.length === 1 ? '' : 's'} (${published} published).`;
    }
    if (user.role === 'student') {
      const assignments = await assignmentService.listStudentAssignments(user.sub);
      return `You have ${assignments.length} published assignment${assignments.length === 1 ? '' : 's'} to complete.`;
    }
    return 'Teachers create and publish assignments; students submit work and view grades.';
  }

  if (text.includes('role') || text.includes('who am i')) {
    return `You are signed in as ${user.name} (${user.role}).`;
  }

  if (user.role === 'admin' && (text.includes('user') || text.includes('suspend'))) {
    return 'As an admin you can manage users, suspend accounts, and organize teacher groups.';
  }

  if (user.role === 'teacher' && text.includes('grade')) {
    return 'Open Assignments to load submissions for an assignment, then grade each student with a score from 0–100%.';
  }

  if (user.role === 'student' && text.includes('grade')) {
    return 'View your grades on the Grades page. Scores are shown as percentages.';
  }

  return 'I can answer questions about classes, assignments, grades, and your role. Try asking "How many classes do I have?"';
}
