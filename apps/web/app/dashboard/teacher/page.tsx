import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { TeacherDashboard } from '@/components/teacher/teacher-dashboard';

export default async function TeacherPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'teacher') redirect('/dashboard');

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Classes</h1>
        <p className="text-muted-foreground">
          Manage classes and enroll students.{' '}
          <Link href="/dashboard/teacher/assignments" className="text-primary hover:underline">
            Assignments →
          </Link>
        </p>
      </div>
      <TeacherDashboard />
    </div>
  );
}
