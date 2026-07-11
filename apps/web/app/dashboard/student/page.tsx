import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { StudentDashboard } from '@/components/student/student-dashboard';

export default async function StudentPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'student') redirect('/dashboard');

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">
          View classes, submit assignments, and check grades.{' '}
          <Link href="/dashboard/student/grades" className="text-primary hover:underline">
            My grades →
          </Link>
        </p>
      </div>
      <StudentDashboard />
    </div>
  );
}
