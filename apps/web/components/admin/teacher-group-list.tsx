'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ManageTeachersDialog } from '@/components/admin/manage-teachers-dialog';
import { EditTeacherGroupDialog } from '@/components/admin/edit-teacher-group-dialog';
import { api } from '@/lib/api';
import type { TeacherGroup } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { Pencil, Users } from 'lucide-react';

interface TeacherGroupListProps {
  groups: TeacherGroup[];
  onUpdate: () => void;
}

export function TeacherGroupList({ groups, onUpdate }: TeacherGroupListProps) {
  const [manageGroup, setManageGroup] = useState<TeacherGroup | null>(null);
  const [editGroup, setEditGroup] = useState<TeacherGroup | null>(null);

  async function deleteGroup(id: string) {
    if (!confirm('Delete this teacher group?')) return;
    try {
      await api(`/admin/teacher-groups/${id}`, { method: 'DELETE' });
      toast({ title: 'Group deleted', variant: 'success' });
      onUpdate();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Teacher Groups ({groups.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {groups.map((g) => (
            <div
              key={g.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-medium">{g.name}</p>
                <p className="text-sm text-muted-foreground">
                  {g.description?.trim() || 'No description'}
                </p>
                <Badge variant="secondary" className="mt-1">
                  {g.teacher_count ?? 0} teacher{(g.teacher_count ?? 0) === 1 ? '' : 's'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditGroup(g)}>
                  <Pencil className="mr-1 h-4 w-4" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => setManageGroup(g)}>
                  <Users className="mr-1 h-4 w-4" />
                  Manage Teachers
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteGroup(g.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {groups.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">No teacher groups yet.</p>
          )}
        </CardContent>
      </Card>

      <EditTeacherGroupDialog
        group={editGroup}
        open={editGroup !== null}
        onOpenChange={(open) => {
          if (!open) setEditGroup(null);
        }}
        onUpdated={onUpdate}
      />

      <ManageTeachersDialog
        group={manageGroup}
        open={manageGroup !== null}
        onOpenChange={(open) => {
          if (!open) setManageGroup(null);
        }}
        onUpdate={onUpdate}
      />
    </>
  );
}
