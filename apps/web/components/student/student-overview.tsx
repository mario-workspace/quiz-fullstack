'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface StudentStats {
  totalClasses: number;
  totalAssignments: number;
}

export function StudentOverview() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<StudentStats>('/student/stats')
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
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
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
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">My Classes</CardTitle>
          <BookOpen className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalClasses}</p>
          <Link
            href="/dashboard/student"
            className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
          >
            View classes →
          </Link>
        </CardContent>
      </Card>

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Assignments</CardTitle>
          <ClipboardList className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalAssignments}</p>
          <Link
            href="/dashboard/student/assignments"
            className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
          >
            View assignments →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
