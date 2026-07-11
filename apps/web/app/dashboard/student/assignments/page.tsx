import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { StudentAssignmentsDashboard } from '@/components/student/student-assignments-dashboard';

export default async function StudentAssignmentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'student') redirect('/dashboard');

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assignments</h1>
        <p className="text-muted-foreground">
          View and submit your assignments.{' '}
          <Link href="/dashboard/student" className="text-primary hover:underline">
            ← Back to classes
          </Link>
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading assignments...</p>}>
        <StudentAssignmentsDashboard />
      </Suspense>
    </div>
  );
}
