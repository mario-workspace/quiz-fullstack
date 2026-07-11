'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import type { TeacherGroup } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface EditTeacherGroupDialogProps {
  group: TeacherGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function EditTeacherGroupDialog({
  group,
  open,
  onOpenChange,
  onUpdated,
}: EditTeacherGroupDialogProps) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (group) {
      setForm({
        name: group.name,
        description: group.description ?? '',
      });
    }
  }, [group]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!group) return;

    setLoading(true);
    try {
      await api(`/admin/teacher-groups/${group.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
        }),
      });
      toast({ title: 'Group updated', variant: 'success' });
      onUpdated();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: 'Failed to update group',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Teacher Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-group-name">Name</Label>
            <Input
              id="edit-group-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-group-desc">Description</Label>
            <Textarea
              id="edit-group-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Optional description..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !form.name.trim()}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
