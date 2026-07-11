import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { AssignmentDetailDashboard } from '@/components/teacher/assignment-detail-dashboard';

export default async function TeacherAssignmentDetailPage({
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
        <h1 className="text-2xl font-bold">Assignment Details</h1>
        <p className="text-muted-foreground">
          <Link href="/dashboard/teacher/assignments" className="text-primary hover:underline">
            ← Back to assignments
          </Link>
        </p>
      </div>
      <AssignmentDetailDashboard assignmentId={id} />
    </div>
  );
}
