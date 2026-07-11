'use client';

import { useCallback, useEffect, useState } from 'react';
import { TeacherGroupForm } from '@/components/admin/teacher-group-form';
import { TeacherGroupList } from '@/components/admin/teacher-group-list';
import { api } from '@/lib/api';
import type { TeacherGroup } from '@/lib/types';

export function AdminGroupsDashboard() {
  const [groups, setGroups] = useState<TeacherGroup[]>([]);

  const loadGroups = useCallback(() => {
    api<TeacherGroup[]>('/admin/teacher-groups').then(setGroups).catch(() => setGroups([]));
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
