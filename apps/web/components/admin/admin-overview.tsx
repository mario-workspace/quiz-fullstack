'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, UserCheck, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface AdminStats {
  totalUsers: number;
  teachers: { total: number; active: number; suspended: number };
  students: { total: number; active: number; suspended: number };
}

export function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AdminStats>('/admin/stats')
      .then(setStats)
      .catch((err) => {
        toast({
          title: 'Failed to load overview',
          description: err instanceof Error ? err.message : 'Unknown error',
          variant: 'destructive',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Users
            <span className="mt-0.5 block text-xs font-normal">Teachers and students only</span>
          </CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Teachers</CardTitle>
          <UserCheck className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-3xl font-bold">{stats.teachers.total}</p>
          <p className="text-sm text-muted-foreground">
            {stats.teachers.active} active · {stats.teachers.suspended} suspended
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          <GraduationCap className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-3xl font-bold">{stats.students.total}</p>
          <p className="text-sm text-muted-foreground">
            {stats.students.active} active · {stats.students.suspended} suspended
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
