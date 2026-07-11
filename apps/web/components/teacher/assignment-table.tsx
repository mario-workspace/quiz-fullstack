'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EditAssignmentDialog } from '@/components/teacher/edit-assignment-dialog';
import { api } from '@/lib/api';
import type { Assignment } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { Eye, Pencil } from 'lucide-react';

const PAGE_SIZE = 10;

interface AssignmentTableProps {
  refreshKey?: number;
}

export function AssignmentTable({ refreshKey = 0 }: AssignmentTableProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState('');
  const [classFilter, setClassFilter] = useState('all');
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

  const classOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const a of assignments) {
      if (a.class_id && a.class_name) {
        seen.set(a.class_id, a.class_name);
      }
    }
    return Array.from(seen.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [assignments]);

  const filtered = useMemo(() => {
    const name = nameFilter.trim().toLowerCase();
    return assignments.filter((a) => {
      if (name && !a.title.toLowerCase().includes(name)) return false;
      if (classFilter !== 'all' && a.class_id !== classFilter) return false;
      return true;
    });
  }, [assignments, nameFilter, classFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  function resetFilters() {
    setNameFilter('');
    setClassFilter('all');
    setPage(1);
  }

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
          <CardTitle className="text-lg">
            My Assignments ({filtered.length}
            {filtered.length !== assignments.length ? ` of ${assignments.length}` : ''})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadAssignments} disabled={loading}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Filter by name</Label>
              <Input
                id="filter-name"
                value={nameFilter}
                onChange={(e) => {
                  setNameFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="Search title..."
              />
            </div>
            <div className="space-y-2">
              <Label>Filter by class</Label>
              <Select
                value={classFilter}
                onValueChange={(value) => {
                  setClassFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All classes</SelectItem>
                  {classOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={resetFilters}>
                Clear filters
              </Button>
            </div>
          </div>

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
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/teacher/assignments/${a.id}`}>
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Link>
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
              {filtered.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  {assignments.length === 0
                    ? 'No assignments yet.'
                    : 'No assignments match your filters.'}
                </p>
              )}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} · Page{' '}
                {currentPage} of {totalPages}
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
