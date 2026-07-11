'use client';

import { useEffect, useState } from 'react';
import { StudentClassList } from '@/components/student/class-list';
import { AssignmentList } from '@/components/student/assignment-list';
import { SubmissionForm } from '@/components/student/submission-form';
import { api } from '@/lib/api';
import type { Assignment, ClassItem } from '@/lib/types';

export function StudentDashboard() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>();

  useEffect(() => {
    api<ClassItem[]>('/student/classes').then(setClasses).catch(() => setClasses([]));
    api<Assignment[]>('/student/assignments').then(setAssignments).catch(() => setAssignments([]));
  }, []);

  return (
    <div className="space-y-6">
      <StudentClassList classes={classes} />
      <AssignmentList
        assignments={assignments}
        onSelect={setSelectedAssignment}
        selectedId={selectedAssignment}
      />
      <SubmissionForm assignments={assignments} selectedAssignmentId={selectedAssignment} />
    </div>
  );
}
