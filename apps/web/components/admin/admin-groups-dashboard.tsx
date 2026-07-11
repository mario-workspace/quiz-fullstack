'use client';

import { useCallback, useEffect, useState } from 'react';
import { TeacherGroupForm } from '@/components/admin/teacher-group-form';
import { TeacherGroupList } from '@/components/admin/teacher-group-list';
import { api } from '@/lib/api';
import type { TeacherGroup } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

export function AdminGroupsDashboard() {
  const [groups, setGroups] = useState<TeacherGroup[]>([]);

  const loadGroups = useCallback(() => {
    api<TeacherGroup[]>('/admin/teacher-groups')
      .then(setGroups)
      .catch((err) => {
        setGroups([]);
        toast({
          title: 'Failed to load groups',
          description: err instanceof Error ? err.message : 'Unknown error',
          variant: 'destructive',
        });
      });
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return (
    <div className="space-y-6">
      <TeacherGroupForm onCreated={loadGroups} />
      <TeacherGroupList groups={groups} onUpdate={loadGroups} />
    </div>
  );
}
