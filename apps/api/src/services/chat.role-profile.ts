import type { JwtPayload } from './auth.service';

export function getWhoAmIReply(user: JwtPayload): string {
  const header = `You are ${user.name}, signed in as ${user.role} on School Portal.\n`;

  if (user.role === 'admin') {
    return (
      header +
      [
        'As an admin, you can use all platform features:',
        '• Users — create accounts, assign roles, suspend or delete users',
        '• Groups — organize teachers into groups',
        '• School stats — ask me "How many teachers?" or "How many students?"',
        '• Overview — monitor teachers, students, and classes school-wide',
        '',
        'You also have full visibility into how teachers and students use the portal.',
      ].join('\n')
    );
  }

  if (user.role === 'teacher') {
    return (
      header +
      [
        'As a teacher, your platform functions are:',
        '• Classes — create classes and manage student enrollment',
        '• Assignments — create homework with due dates (today or future only), publish or unpublish',
        '• Marking — review submissions and assign marks from 0–100 with feedback',
        '• Dashboard — see your class and assignment counts',
        '',
        'Try: "How many classes do I teach?" or "How do I mark submissions?"',
      ].join('\n')
    );
  }

  return (
    header +
    [
      'As a student, your platform functions are:',
      '• My Classes — view enrolled classes and teacher names',
      '• Assignments — see published homework, submit work before the due date',
      '• Marks — check scores on the Assignments page and dashboard overview',
      '• Dashboard — track your progress and average marks',
      '',
      'Try: "List my classes" or "How do I submit homework?"',
    ].join('\n')
  );
}
