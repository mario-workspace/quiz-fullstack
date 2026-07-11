'use client';

import { useCallback, useEffect, useState } from 'react';
import { ClassForm } from '@/components/teacher/class-form';
import { ClassTable } from '@/components/teacher/class-table';
import { api } from '@/lib/api';
import type { ClassItem } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

export function TeacherDashboard() {
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const loadClasses = useCallback(() => {
    api<ClassItem[]>('/teacher/classes')
      .then(setClasses)
      .catch((err) => {
        setClasses([]);
        toast({
          title: 'Failed to load classes',
          description: err instanceof Error ? err.message : 'Unknown error',
          variant: 'destructive',
        });
      });
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  return (
    <div className="space-y-6">
      <ClassForm onCreated={loadClasses} />
      <ClassTable classes={classes} onUpdate={loadClasses} />
    </div>
  );
}
