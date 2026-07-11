'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TeacherMultiSelect } from '@/components/admin/teacher-multi-select';
import { api } from '@/lib/api';
import type { GroupTeacher, TeacherGroup, User } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface ManageTeachersDialogProps {
  group: TeacherGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ManageTeachersDialog({
  group,
  open,
  onOpenChange,
  onUpdate,
}: ManageTeachersDialogProps) {
  const [groupTeachers, setGroupTeachers] = useState<GroupTeacher[]>([]);
  const [allTeachers, setAllTeachers] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadGroupTeachers = useCallback(async (groupId: string) => {
    setLoadingTeachers(true);
    try {
      const data = await api<GroupTeacher[]>(`/admin/teacher-groups/${groupId}/teachers`);
      setGroupTeachers(data);
    } catch (err) {
      setGroupTeachers([]);
      toast({
        title: 'Failed to load group teachers',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  const loadAllTeachers = useCallback(async () => {
    try {
      setAllTeachers(await api<User[]>('/admin/teachers'));
    } catch (err) {
      setAllTeachers([]);
      toast({
        title: 'Failed to load teachers',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }, []);

  useEffect(() => {
    if (open && group) {
      setSelectedIds([]);
      loadGroupTeachers(group.id);
      loadAllTeachers();
    }
  }, [open, group, loadGroupTeachers, loadAllTeachers]);

  async function addSelectedTeachers() {
    if (!group || selectedIds.length === 0) return;

    const emails = allTeachers
      .filter((t) => selectedIds.includes(t.id))
      .map((t) => t.email);

    setAdding(true);
    try {
      const result = await api<{ success: boolean; added: string[]; notFound: string[] }>(
        `/admin/teacher-groups/${group.id}/teachers`,
        {
          method: 'POST',
          body: JSON.stringify({ emails }),
        },
      );

      const count = result.added.length;
      toast({
        title: count === 1 ? 'Teacher added' : `${count} teachers added`,
        description:
          result.notFound.length > 0
            ? `Could not find: ${result.notFound.join(', ')}`
            : undefined,
        variant: 'success',
      });

      setSelectedIds([]);
      await loadGroupTeachers(group.id);
      onUpdate();
    } catch (err) {
      toast({
        title: 'Failed to add teachers',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  }

  async function removeTeacher(teacherId: string) {
    if (!group) return;
    setRemovingId(teacherId);
    try {
      await api(`/admin/teacher-groups/${group.id}/teachers/${teacherId}`, { method: 'DELETE' });
      toast({ title: 'Teacher removed from group', variant: 'success' });
      await loadGroupTeachers(group.id);
      onUpdate();
    } catch (err) {
      toast({
        title: 'Failed to remove teacher',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Teachers — {group?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Teachers in this group</Label>
            {loadingTeachers ? (
              <p className="text-sm text-muted-foreground">Loading teachers...</p>
            ) : (
              <ul className="space-y-2">
                {groupTeachers.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{t.email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={removingId === t.id}
                      onClick={() => removeTeacher(t.id)}
                    >
                      {removingId === t.id ? 'Removing...' : 'Remove'}
                    </Button>
                  </li>
                ))}
                {groupTeachers.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                    No teachers in this group yet.
                  </p>
                )}
              </ul>
            )}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <Label>Add Teachers</Label>
            <TeacherMultiSelect
              teachers={allTeachers}
              excludeIds={groupTeachers.map((t) => t.id)}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
            <Button
              onClick={addSelectedTeachers}
              disabled={adding || selectedIds.length === 0}
              className="w-full"
            >
              {adding
                ? 'Adding...'
                : selectedIds.length > 0
                  ? `Add ${selectedIds.length} Teacher${selectedIds.length === 1 ? '' : 's'}`
                  : 'Add Teachers'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
