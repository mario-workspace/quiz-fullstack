'use client';

import { useCallback, useEffect, useState } from 'react';
import { AssignmentForm } from '@/components/teacher/assignment-form';
import { AssignmentTable } from '@/components/teacher/assignment-table';
import { api } from '@/lib/api';
import type { ClassItem } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

export function TeacherAssignmentsDashboard() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

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
      <AssignmentForm
        classes={classes}
        onCreated={() => {
          loadClasses();
          setRefreshKey((k) => k + 1);
        }}
      />
      <AssignmentTable refreshKey={refreshKey} />
    </div>
  );
}
