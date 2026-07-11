import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { StudentClassesDashboard } from '@/components/student/student-classes-dashboard';

export default async function StudentClassesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'student') redirect('/dashboard');

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Classes</h1>
        <p className="text-muted-foreground">
          View your enrolled classes and open class assignments.{' '}
          <Link href="/dashboard/student/assignments" className="text-primary hover:underline">
            All assignments →
          </Link>
        </p>
      </div>
      <StudentClassesDashboard />
    </div>
  );
}
