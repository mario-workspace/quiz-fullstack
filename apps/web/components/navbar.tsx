'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-provider';
import { logout, type AuthUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useDashboardNavigation } from '@/components/dashboard-navigation';

const links: Record<AuthUser['role'], { href: string; label: string }[]> = {
  admin: [
    { href: '/dashboard/admin', label: 'Users' },
    { href: '/dashboard/admin/groups', label: 'Groups' },
  ],
  teacher: [
    { href: '/dashboard/teacher', label: 'Classes' },
    { href: '/dashboard/teacher/assignments', label: 'Assignments' },
  ],
  student: [
    { href: '/dashboard/student', label: 'Classes' },
    { href: '/dashboard/student/assignments', label: 'Assignments' },
    { href: '/dashboard/student/grades', label: 'Grades' },
  ],
};

export function Navbar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const { startNavigation } = useDashboardNavigation();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <Link
          href="/dashboard"
          onClick={() => {
            if (pathname !== '/dashboard') startNavigation();
          }}
          className="flex items-center gap-2 font-semibold"
        >
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">School Portal</span>
        </Link>
        <nav className="flex items-center gap-2 md:hidden">
          {links[user.role].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => {
                if (link.href !== pathname) startNavigation();
              }}
              className={cn(
                'rounded-md px-2 py-1 text-xs hover:text-primary',
                pathname === link.href && 'font-semibold text-primary',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await logout();
              window.location.href = '/login';
            }}
          >
            <LogOut className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
