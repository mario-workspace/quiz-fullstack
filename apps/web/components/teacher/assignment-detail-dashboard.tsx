'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmissionsPanel } from '@/components/teacher/grade-form';
import { api } from '@/lib/api';
import type { Assignment } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface AssignmentDetailDashboardProps {
  assignmentId: string;
}

export function AssignmentDetailDashboard({ assignmentId }: AssignmentDetailDashboardProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAssignment = useCallback(async () => {
    setLoading(true);
    try {
      setAssignment(await api<Assignment>(`/teacher/assignments/${assignmentId}`));
    } catch (err) {
      setAssignment(null);
      toast({
        title: 'Failed to load assignment',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading assignment details...</p>;
  }

  if (!assignment) {
    return <p className="text-sm text-muted-foreground">Assignment not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-lg">{assignment.title}</CardTitle>
            <Badge variant={assignment.published ? 'success' : 'secondary'}>
              {assignment.published ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Class:</span> {assignment.class_name}
          </p>
          <p>
            <span className="font-medium text-foreground">Due:</span>{' '}
            {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : '—'}
          </p>
          <p>{assignment.description?.trim() || 'No description'}</p>
        </CardContent>
      </Card>

      <SubmissionsPanel
        assignmentId={assignmentId}
        showPublish={!assignment.published}
        onPublish={loadAssignment}
      />
    </div>
  );
}
