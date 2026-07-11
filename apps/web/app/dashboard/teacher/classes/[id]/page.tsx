import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { ClassDetailDashboard } from '@/components/teacher/class-detail-dashboard';

export default async function TeacherClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'teacher') redirect('/dashboard');

  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Class Details</h1>
        <p className="text-muted-foreground">
          <Link href="/dashboard/teacher" className="text-primary hover:underline">
            ← Back to classes
          </Link>
        </p>
      </div>
      <ClassDetailDashboard classId={id} />
    </div>
  );
}
