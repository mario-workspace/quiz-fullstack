import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { TeacherAssignmentsDashboard } from '@/components/teacher/teacher-assignments-dashboard';

export default async function TeacherAssignmentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'teacher') redirect('/dashboard');

  return (
    <DashboardShell user={user}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Assignments & Grading</h1>
          <p className="text-muted-foreground">
            Create assignments, publish them, and grade submissions.{' '}
            <Link href="/dashboard/teacher" className="text-primary hover:underline">
              Back to classes →
            </Link>
          </p>
        </div>
        <TeacherAssignmentsDashboard />
      </div>
    </DashboardShell>
  );
}
