'use client';

import { useCallback, useEffect, useState } from 'react';
import { ClassForm } from '@/components/teacher/class-form';
import { ClassList } from '@/components/teacher/class-list';
import { StudentEnrollForm } from '@/components/teacher/student-enroll-form';
import { api } from '@/lib/api';
import type { ClassItem } from '@/lib/types';

export function TeacherDashboard() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>();

  const loadClasses = useCallback(() => {
    api<ClassItem[]>('/teacher/classes').then(setClasses).catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  return (
    <div className="space-y-6">
      <ClassForm onCreated={loadClasses} />
      <ClassList
        classes={classes}
        title="My Classes"
        onSelect={setSelectedId}
        selectedId={selectedId}
      />
      <StudentEnrollForm classes={classes} />
    </div>
  );
}
