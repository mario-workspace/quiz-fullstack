import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/dashboard');

  return (
    <DashboardShell user={user}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and account status.{' '}
            <Link href="/dashboard/admin/groups" className="text-primary hover:underline">
              Teacher groups →
            </Link>
          </p>
        </div>
        <AdminDashboard />
      </div>
    </DashboardShell>
  );
}
