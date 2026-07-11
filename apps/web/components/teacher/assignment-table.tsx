'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditAssignmentDialog } from '@/components/teacher/edit-assignment-dialog';
import { api } from '@/lib/api';
import type { Assignment } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { Pencil } from 'lucide-react';

const PAGE_SIZE = 10;

interface AssignmentTableProps {
  onGrade: (assignmentId: string) => void;
  gradingId?: string;
  refreshKey?: number;
}

export function AssignmentTable({ onGrade, gradingId, refreshKey = 0 }: AssignmentTableProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editAssignment, setEditAssignment] = useState<Assignment | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

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

  const totalPages = Math.max(1, Math.ceil(assignments.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return assignments.slice(start, start + PAGE_SIZE);
  }, [assignments, currentPage]);

  async function unpublishAssignment(id: string) {
    setActionId(id);
    try {
      await api(`/teacher/assignments/${id}/unpublish`, { method: 'POST' });
      toast({ title: 'Assignment unpublished', variant: 'success' });
      await loadAssignments();
    } catch (err) {
      toast({
        title: 'Unpublish failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setActionId(null);
    }
  }

  async function publishAssignment(id: string) {
    setActionId(id);
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
    } finally {
      setActionId(null);
    }
  }

  async function removeAssignment(id: string) {
    if (!confirm('Delete this assignment?')) return;
    setActionId(id);
    try {
      await api(`/teacher/assignments/${id}`, { method: 'DELETE' });
      toast({ title: 'Assignment deleted', variant: 'success' });
      await loadAssignments();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setActionId(null);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">My Assignments ({assignments.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={loadAssignments} disabled={loading}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading assignments...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Title</th>
                    <th className="pb-3 pr-4 font-medium">Class</th>
                    <th className="pb-3 pr-4 font-medium">Due</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((a) => (
                    <tr key={a.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 font-medium">{a.title}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{a.class_name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={a.published ? 'success' : 'secondary'}>
                          {a.published ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditAssignment(a)}>
                            <Pencil className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          {a.published ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionId === a.id}
                              onClick={() => unpublishAssignment(a.id)}
                            >
                              Unpublish
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionId === a.id}
                              onClick={() => publishAssignment(a.id)}
                            >
                              Publish
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant={gradingId === a.id ? 'default' : 'outline'}
                            onClick={() => onGrade(a.id)}
                          >
                            Grade
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={actionId === a.id}
                            onClick={() => removeAssignment(a.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {assignments.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">No assignments yet.</p>
              )}
            </div>
          )}

          {!loading && assignments.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EditAssignmentDialog
        assignment={editAssignment}
        open={editAssignment !== null}
        onOpenChange={(open) => {
          if (!open) setEditAssignment(null);
        }}
        onUpdated={loadAssignments}
      />
    </>
  );
}
