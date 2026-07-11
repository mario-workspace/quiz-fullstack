'use client';

import { useCallback, useEffect, useState } from 'react';
import { AssignmentForm } from '@/components/teacher/assignment-form';
import { SubmissionsPanel } from '@/components/teacher/grade-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { ClassItem } from '@/lib/types';

export function TeacherAssignmentsDashboard() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [assignmentId, setAssignmentId] = useState('');

  const loadClasses = useCallback(() => {
    api<ClassItem[]>('/teacher/classes').then(setClasses).catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  return (
    <div className="space-y-6">
      <AssignmentForm classes={classes} onCreated={loadClasses} />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Grade Submissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="assignment-id">Assignment ID</Label>
          <Input
            id="assignment-id"
            placeholder="Paste assignment UUID"
            value={assignmentId}
            onChange={(e) => setAssignmentId(e.target.value)}
          />
        </CardContent>
      </Card>
      <SubmissionsPanel assignmentId={assignmentId} />
    </div>
  );
}
