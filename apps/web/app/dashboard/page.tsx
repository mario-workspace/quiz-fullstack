import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, ClipboardList, Users, type LucideIcon } from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const roleLinks: Record<string, { href: string; label: string; icon: LucideIcon }> = {
    admin: { href: '/dashboard/admin', label: 'Manage Users', icon: Users },
    teacher: { href: '/dashboard/teacher', label: 'My Classes', icon: BookOpen },
    student: { href: '/dashboard/student', label: 'View Classes', icon: BookOpen },
  };

  const link = roleLinks[user.role];
  const Icon = link.icon;

  return (
    <DashboardShell user={user}>
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
          {user.role === 'teacher' && (
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <ClipboardList className="mb-2 h-8 w-8 text-primary" />
                <CardTitle className="text-lg">Assignments</CardTitle>
                <CardDescription>Create and grade assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/teacher/assignments" className="text-sm font-medium text-primary hover:underline">
                  Manage assignments →
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
