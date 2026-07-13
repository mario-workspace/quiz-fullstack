'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import {
  AssignmentViewDialog,
  getAssignmentStatus,
} from '@/components/student/assignment-view-dialog';
import { formatMarks } from '@/lib/marks';
import { api } from '@/lib/api';
import type { Assignment, ClassItem } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

const PAGE_SIZE = 10;

export function StudentAssignmentsDashboard() {
  const searchParams = useSearchParams();
  const initialClassId = searchParams.get('classId') ?? 'all';

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classFilter, setClassFilter] = useState(initialClassId);
  const [nameFilter, setNameFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [classData, assignmentData] = await Promise.all([
        api<ClassItem[]>('/student/classes'),
        api<Assignment[]>('/student/assignments'),
      ]);
      setClasses(classData);
      setAssignments(assignmentData);
    } catch (err) {
      setClasses([]);
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
    loadData();
  }, [loadData]);

  useEffect(() => {
    setClassFilter(initialClassId);
    setPage(1);
  }, [initialClassId]);

  const filtered = useMemo(() => {
    const name = nameFilter.trim().toLowerCase();
    return assignments.filter((a) => {
      if (classFilter !== 'all' && a.class_id !== classFilter) return false;
      if (name && !a.title.toLowerCase().includes(name)) return false;
      return true;
    });
  }, [assignments, classFilter, nameFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  function resetFilters() {
    setClassFilter('all');
    setNameFilter('');
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            My Assignments ({filtered.length}
            {filtered.length !== assignments.length ? ` of ${assignments.length}` : ''})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-name">Filter by assignment name</Label>
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
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={resetFilters}>
                Clear filters
              </Button>
            </div>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading assignments...</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Assignment</th>
                      <th className="pb-3 pr-4 font-medium">Class</th>
                      <th className="pb-3 pr-4 font-medium">Due Date</th>
                      <th className="pb-3 pr-4 font-medium">Marks</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((a) => {
                      const status = getAssignmentStatus(a);
                      return (
                        <tr key={a.id} className="border-b border-border last:border-0">
                          <td className="py-3 pr-4 font-medium">{a.title}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{a.class_name}</td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {a.score != null ? formatMarks(a.score) : '—'}
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
                {filtered.length === 0 && (
                  <p className="py-8 text-center text-muted-foreground">
                    {assignments.length === 0
                      ? 'No assignments yet.'
                      : 'No assignments match your filters.'}
                  </p>
                )}
              </div>

              {filtered.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
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
            </>
          )}
        </CardContent>
      </Card>

      <AssignmentViewDialog
        assignment={viewAssignment}
        open={viewAssignment !== null}
        onOpenChange={(open) => {
          if (!open) setViewAssignment(null);
        }}
        onSubmitted={loadData}
      />
    </div>
  );
}
