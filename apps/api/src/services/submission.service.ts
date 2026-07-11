import { getDb } from '../db';

export interface SubmitAssignmentInput {
  assignmentId: string;
  studentId: string;
  content: string;
}

export interface GradeSubmissionInput {
  submissionId: string;
  score: number;
  feedback?: string;
}

export async function submitAssignment(input: SubmitAssignmentInput) {
  return getDb()
    .insertInto('submissions')
    .values({
      assignment_id: input.assignmentId,
      student_id: input.studentId,
      content: input.content,
    })
    .onConflict((oc) =>
      oc.columns(['assignment_id', 'student_id']).doUpdateSet({
        content: input.content,
        submitted_at: new Date(),
      }),
    )
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function getSubmission(id: string) {
  return getDb().selectFrom('submissions').selectAll().where('id', '=', id).executeTakeFirst();
}

export async function listSubmissionsForAssignment(assignmentId: string) {
  return getDb()
    .selectFrom('submissions')
    .innerJoin('users', 'users.id', 'submissions.student_id')
    .select([
      'submissions.id',
      'submissions.assignment_id',
      'submissions.student_id',
      'submissions.content',
      'submissions.submitted_at',
      'users.name as student_name',
      'users.email as student_email',
    ])
    .where('submissions.assignment_id', '=', assignmentId)
    .execute();
}

export async function gradeSubmission(input: GradeSubmissionInput) {
  const existing = await getDb()
    .selectFrom('grades')
    .select('id')
    .where('submission_id', '=', input.submissionId)
    .executeTakeFirst();

  if (existing) {
    return getDb()
      .updateTable('grades')
      .set({
        score: input.score,
        feedback: input.feedback ?? null,
        graded_at: new Date(),
      })
      .where('submission_id', '=', input.submissionId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  return getDb()
    .insertInto('grades')
    .values({
      submission_id: input.submissionId,
      score: input.score,
      feedback: input.feedback ?? null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function getStudentGrade(submissionId: string) {
  return getDb().selectFrom('grades').selectAll().where('submission_id', '=', submissionId).executeTakeFirst();
}

export async function listStudentGrades(studentId: string) {
  return getDb()
    .selectFrom('grades')
    .innerJoin('submissions', 'submissions.id', 'grades.submission_id')
    .innerJoin('assignments', 'assignments.id', 'submissions.assignment_id')
    .innerJoin('classes', 'classes.id', 'assignments.class_id')
    .select([
      'grades.id',
      'grades.score',
      'grades.feedback',
      'grades.graded_at',
      'assignments.title as assignment_title',
      'classes.name as class_name',
      'submissions.id as submission_id',
    ])
    .where('submissions.student_id', '=', studentId)
    .orderBy('grades.graded_at', 'desc')
    .execute();
}

export async function getStudentSubmission(assignmentId: string, studentId: string) {
  return getDb()
    .selectFrom('submissions')
    .selectAll()
    .where('assignment_id', '=', assignmentId)
    .where('student_id', '=', studentId)
    .executeTakeFirst();
}
