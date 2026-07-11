'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { ClassItem } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { Eye } from 'lucide-react';

const PAGE_SIZE = 10;

export function StudentClassesDashboard() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');

  const loadClasses = useCallback(() => {
    setLoading(true);
    api<ClassItem[]>('/student/classes')
      .then(setClasses)
      .catch((err) => {
        setClasses([]);
        toast({
          title: 'Failed to load classes',
          description: err instanceof Error ? err.message : 'Unknown error',
          variant: 'destructive',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const filtered = useMemo(() => {
    const name = nameFilter.trim().toLowerCase();
    const teacher = teacherFilter.trim().toLowerCase();
    return classes.filter((c) => {
      if (name && !c.name.toLowerCase().includes(name)) return false;
      if (teacher && !(c.teacher_name ?? '').toLowerCase().includes(teacher)) return false;
      return true;
    });
  }, [classes, nameFilter, teacherFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  function resetFilters() {
    setNameFilter('');
    setTeacherFilter('');
    setPage(1);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          My Classes ({filtered.length}
          {filtered.length !== classes.length ? ` of ${classes.length}` : ''})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="filter-class-name">Filter by name</Label>
            <Input
              id="filter-class-name"
              value={nameFilter}
              onChange={(e) => {
                setNameFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Search class name..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-teacher">Filter by teacher</Label>
            <Input
              id="filter-teacher"
              value={teacherFilter}
              onChange={(e) => {
                setTeacherFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Search teacher name..."
            />
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="w-full" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading classes...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Name</th>
                    <th className="pb-3 pr-4 font-medium">Description</th>
                    <th className="pb-3 pr-4 font-medium">Teacher</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 font-medium">{c.name}</td>
                      <td className="max-w-xs py-3 pr-4 text-muted-foreground">
                        {c.description?.trim() || 'No description'}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {c.teacher_name ?? 'Unknown teacher'}
                      </td>
                      <td className="py-3">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/student/assignments?classId=${c.id}`}>
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  {classes.length === 0
                    ? 'You are not enrolled in any classes.'
                    : 'No classes match your filters.'}
                </p>
              )}
            </div>

            {filtered.length > 0 && (
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
