import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminOverview } from '@/components/admin/admin-overview';
import { TeacherOverview } from '@/components/teacher/teacher-overview';
import { BookOpen, type LucideIcon } from 'lucide-react';

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

  const roleLinks: Record<string, { href: string; label: string; icon: LucideIcon }> = {
    student: { href: '/dashboard/student', label: 'View Classes', icon: BookOpen },
  };

  const link = roleLinks[user.role];
  const Icon = link.icon;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}</h1>
        <p className="mt-1 text-muted-foreground">
          Signed in as <span className="font-medium capitalize text-foreground">{user.role}</span>
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <Icon className="mb-2 h-8 w-8 text-primary" />
            <CardTitle className="text-lg">{link.label}</CardTitle>
            <CardDescription>Go to your primary workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={link.href} className="text-sm font-medium text-primary hover:underline">
              Open dashboard →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
