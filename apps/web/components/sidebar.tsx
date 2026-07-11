'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Users,
  UsersRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/lib/auth';
import { useDashboardNavigation } from '@/components/dashboard-navigation';

const navItems: Record<
  AuthUser['role'],
  { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[]
> = {
  admin: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/admin', label: 'Users', icon: Users },
    { href: '/dashboard/admin/groups', label: 'Teacher Groups', icon: UsersRound },
  ],
  teacher: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/teacher', label: 'Classes', icon: BookOpen },
    { href: '/dashboard/teacher/assignments', label: 'Assignments', icon: ClipboardList },
  ],
  student: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/student', label: 'My Classes', icon: BookOpen },
    { href: '/dashboard/student/assignments', label: 'Assignments', icon: ClipboardList },
    { href: '/dashboard/student/grades', label: 'Grades', icon: GraduationCap },
  ],
};

export function Sidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const { startNavigation } = useDashboardNavigation();
  const items = navItems[user.role];

  return (
    <aside className="relative hidden w-64 shrink-0 border-r border-border bg-card md:block">
      <nav className="space-y-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (item.href !== pathname) startNavigation();
              }}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                active && 'bg-primary/10 text-primary',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-border p-4">
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
      </div>
    </aside>
  );
}
