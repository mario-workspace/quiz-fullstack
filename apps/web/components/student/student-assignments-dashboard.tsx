'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AssignmentViewDialog,
  getAssignmentStatus,
} from '@/components/student/assignment-view-dialog';
import { api } from '@/lib/api';
import type { Assignment, ClassItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

export function StudentAssignmentsDashboard() {
  const searchParams = useSearchParams();
  const initialClassId = searchParams.get('classId') ?? 'all';

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [loading, setLoading] = useState(true);
  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null);

  const loadClasses = useCallback(() => {
    return api<ClassItem[]>('/student/classes')
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

  const loadAssignments = useCallback((classId: string) => {
    setLoading(true);
    const path =
      classId === 'all' ? '/student/assignments' : `/student/assignments?classId=${classId}`;
    return api<Assignment[]>(path)
      .then(setAssignments)
      .catch((err) => {
        setAssignments([]);
        toast({
          title: 'Failed to load assignments',
          description: err instanceof Error ? err.message : 'Unknown error',
          variant: 'destructive',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    setSelectedClassId(initialClassId);
  }, [initialClassId]);

  useEffect(() => {
    loadAssignments(selectedClassId);
  }, [selectedClassId, loadAssignments]);

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId),
    [classes, selectedClassId],
  );

  const tableTitle =
    selectedClassId === 'all'
      ? `All Assignments (${assignments.length})`
      : `${selectedClass?.name ?? 'Class'} Assignments (${assignments.length})`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <button
              type="button"
              onClick={() => setSelectedClassId('all')}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted',
                selectedClassId === 'all' ? 'border-primary bg-primary/5' : 'border-border',
              )}
            >
              <BookOpen className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">All Classes</p>
                <p className="mt-1 text-sm text-muted-foreground">Show every assignment</p>
              </div>
            </button>
            {classes.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedClassId(c.id)}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted',
                  selectedClassId === c.id ? 'border-primary bg-primary/5' : 'border-border',
                )}
              >
                <BookOpen className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.teacher_name}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{tableTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading assignments...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Assignment</th>
                    {selectedClassId === 'all' && <th className="pb-3 pr-4 font-medium">Class</th>}
                    <th className="pb-3 pr-4 font-medium">Due Date</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => {
                    const status = getAssignmentStatus(a);
                    return (
                      <tr key={a.id} className="border-b border-border last:border-0">
                        <td className="py-3 pr-4 font-medium">{a.title}</td>
                        {selectedClassId === 'all' && (
                          <td className="py-3 pr-4 text-muted-foreground">{a.class_name}</td>
                        )}
                        <td className="py-3 pr-4 text-muted-foreground">
                          {a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="py-3">
                          <Button size="sm" variant="outline" onClick={() => setViewAssignment(a)}>
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {assignments.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  No assignments for this class.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AssignmentViewDialog
        assignment={viewAssignment}
        open={viewAssignment !== null}
        onOpenChange={(open) => {
          if (!open) setViewAssignment(null);
        }}
        onSubmitted={() => loadAssignments(selectedClassId)}
      />
    </div>
  );
}
