import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminOverview } from '@/components/admin/admin-overview';
import { TeacherOverview } from '@/components/teacher/teacher-overview';
import { StudentOverview } from '@/components/student/student-overview';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  if (user.role === 'admin') {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
          <p className="mt-1 text-muted-foreground">
            School portal summary and user statistics.
          </p>
        </div>
        <AdminOverview />
      </div>
    );
  }

  if (user.role === 'teacher') {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}</h1>
          <p className="mt-1 text-muted-foreground">Teacher overview and quick stats.</p>
        </div>
        <TeacherOverview />
      </div>
    );
  }

  if (user.role === 'student') {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}</h1>
          <p className="mt-1 text-muted-foreground">Student overview and quick stats.</p>
        </div>
        <StudentOverview />
      </div>
    );
  }

  redirect('/login');
}
