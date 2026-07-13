'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { Assignment } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { Calendar, ClipboardList } from 'lucide-react';

interface TeacherAssignmentListProps {
  onSelect: (assignmentId: string) => void;
  selectedId?: string;
  refreshKey?: number;
}

export function TeacherAssignmentList({
  onSelect,
  selectedId,
  refreshKey = 0,
}: TeacherAssignmentListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    try {
      setAssignments(await api<Assignment[]>('/teacher/assignments'));
    } catch (err) {
      setAssignments([]);
      toast({
        title: 'Failed to load assignments',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments, refreshKey]);

  async function publishAssignment(id: string) {
    try {
      await api(`/teacher/assignments/${id}/publish`, { method: 'POST' });
      toast({ title: 'Assignment published', variant: 'success' });
      await loadAssignments();
    } catch (err) {
      toast({
        title: 'Publish failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">My Assignments</CardTitle>
        <Button variant="outline" size="sm" onClick={loadAssignments} disabled={loading}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading assignments...</p>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <div
                key={a.id}
                className={`rounded-lg border p-4 transition-colors ${
                  selectedId === a.id ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <ClipboardList className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{a.title}</p>
                      <p className="text-sm text-muted-foreground">{a.class_name}</p>
                      {a.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                      )}
                      {a.due_date && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Due {new Date(a.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={a.published ? 'success' : 'secondary'}>
                      {a.published ? 'Published' : 'Draft'}
                    </Badge>
                    {!a.published && (
                      <Button size="sm" variant="outline" onClick={() => publishAssignment(a.id)}>
                        Publish
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={selectedId === a.id ? 'default' : 'outline'}
                      onClick={() => onSelect(a.id)}
                    >
                      Mark
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && assignments.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            No assignments yet. Create one above.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
