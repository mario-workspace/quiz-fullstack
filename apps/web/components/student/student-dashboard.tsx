'use client';

import { useCallback, useEffect, useState } from 'react';
import { StudentClassList } from '@/components/student/class-list';
import { AssignmentList } from '@/components/student/assignment-list';
import { SubmissionForm } from '@/components/student/submission-form';
import { api } from '@/lib/api';
import type { Assignment, ClassItem } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

export function StudentDashboard() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>();

  const loadClasses = useCallback(() => {
    api<ClassItem[]>('/student/classes')
      .then((data) => {
        setClasses(data);
        setSelectedClassId((prev) => prev ?? data[0]?.id);
      })
      .catch((err) => {
        setClasses([]);
        toast({
          title: 'Failed to load classes',
          description: err instanceof Error ? err.message : 'Unknown error',
          variant: 'destructive',
        });
      });
  }, []);

  const loadAssignments = useCallback((classId: string) => {
    api<Assignment[]>(`/student/classes/${classId}/assignments`)
      .then((data) => {
        setAssignments(data);
        setSelectedAssignment(undefined);
      })
      .catch((err) => {
        setAssignments([]);
        toast({
          title: 'Failed to load assignments',
          description: err instanceof Error ? err.message : 'Unknown error',
          variant: 'destructive',
        });
      });
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (selectedClassId) {
      loadAssignments(selectedClassId);
    } else {
      setAssignments([]);
    }
  }, [selectedClassId, loadAssignments]);

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      <StudentClassList
        classes={classes}
        selectedId={selectedClassId}
        onSelect={setSelectedClassId}
      />
      <AssignmentList
        assignments={assignments}
        onSelect={setSelectedAssignment}
        selectedId={selectedAssignment}
        title={selectedClass ? `Assignments — ${selectedClass.name}` : 'Assignments'}
      />
      <SubmissionForm
        assignments={assignments}
        selectedAssignmentId={selectedAssignment}
      />
    </div>
  );
}
