'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { ClassItem } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

export function StudentClassesDashboard() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClasses = useCallback(() => {
    setLoading(true);
    api<ClassItem[]>('/student/classes')
      .then(setClasses)
      .catch((err) => {
        setClasses([]);
        toast({
          title: 'Failed to load classes',
          description: err instanceof Error ? err.message : 'Unknown error',
          variant: 'destructive',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading classes...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">My Classes ({classes.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <div
              key={c.id}
              className="flex flex-col rounded-lg border border-border p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{c.name}</p>
                  {c.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                  )}
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    {c.teacher_name ?? 'Unknown teacher'}
                  </p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                <Link href={`/dashboard/student/assignments?classId=${c.id}`}>Detail</Link>
              </Button>
            </div>
          ))}
        </div>
        {classes.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">You are not enrolled in any classes.</p>
        )}
      </CardContent>
    </Card>
  );
}
