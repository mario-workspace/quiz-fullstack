'use client';

import { useEffect, useState } from 'react';
import { GradeView } from '@/components/student/grade-view';
import { api } from '@/lib/api';
import type { Grade } from '@/lib/types';

export function StudentGradesDashboard() {
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    api<Grade[]>('/student/grades').then(setGrades).catch(() => setGrades([]));
  }, []);

  return <GradeView grades={grades} />;
}
