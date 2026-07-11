import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { AdminGroupsDashboard } from '@/components/admin/admin-groups-dashboard';

export default async function AdminGroupsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/dashboard');

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Teacher Groups</h1>
        <p className="text-muted-foreground">
          Organize teachers into groups.{' '}
          <Link href="/dashboard/admin" className="text-primary hover:underline">
            Back to users →
          </Link>
        </p>
      </div>
      <AdminGroupsDashboard />
    </div>
  );
}
