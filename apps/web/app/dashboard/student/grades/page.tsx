import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { StudentGradesDashboard } from '@/components/student/student-grades-dashboard';

export default async function StudentGradesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'student') redirect('/dashboard');

  return (
    <DashboardShell user={user}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Grades</h1>
          <p className="text-muted-foreground">
            View all graded assignments.{' '}
            <Link href="/dashboard/student" className="text-primary hover:underline">
              Back to classes →
            </Link>
          </p>
        </div>
        <StudentGradesDashboard />
      </div>
    </DashboardShell>
  );
}
