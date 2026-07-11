'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditClassDialog } from '@/components/teacher/edit-class-dialog';
import { api } from '@/lib/api';
import type { ClassItem } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { Eye, Pencil } from 'lucide-react';

const PAGE_SIZE = 10;

interface ClassTableProps {
  classes: ClassItem[];
  onUpdate: () => void;
}

export function ClassTable({ classes, onUpdate }: ClassTableProps) {
  const [page, setPage] = useState(1);
  const [editClass, setEditClass] = useState<ClassItem | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(classes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return classes.slice(start, start + PAGE_SIZE);
  }, [classes, currentPage]);

  async function removeClass(id: string) {
    if (!confirm('Delete this class? All enrollments and assignments will be removed.')) return;
    setRemovingId(id);
    try {
      await api(`/teacher/classes/${id}`, { method: 'DELETE' });
      toast({ title: 'Class deleted', variant: 'success' });
      onUpdate();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Classes ({classes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Description</th>
                  <th className="pb-3 pr-4 font-medium">Students</th>
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
                    <td className="py-3 pr-4">{c.student_count ?? 0}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/teacher/classes/${c.id}`}>
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditClass(c)}>
                          <Pencil className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={removingId === c.id}
                          onClick={() => removeClass(c.id)}
                        >
                          {removingId === c.id ? 'Removing...' : 'Remove'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {classes.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">No classes yet.</p>
            )}
          </div>

          {classes.length > 0 && (
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

      <EditClassDialog
        classItem={editClass}
        open={editClass !== null}
        onOpenChange={(open) => {
          if (!open) setEditClass(null);
        }}
        onUpdated={onUpdate}
      />
    </>
  );
}
