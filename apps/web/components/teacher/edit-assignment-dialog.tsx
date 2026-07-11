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
import type { Assignment } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface EditAssignmentDialogProps {
  assignment: Assignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function EditAssignmentDialog({
  assignment,
  open,
  onOpenChange,
  onUpdated,
}: EditAssignmentDialogProps) {
  const [form, setForm] = useState({ title: '', description: '', dueDate: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (assignment) {
      setForm({
        title: assignment.title,
        description: assignment.description ?? '',
        dueDate: assignment.due_date ? assignment.due_date.slice(0, 10) : '',
      });
    }
  }, [assignment]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assignment) return;

    setLoading(true);
    try {
      await api(`/teacher/assignments/${assignment.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          dueDate: form.dueDate || null,
        }),
      });
      toast({ title: 'Assignment updated', variant: 'success' });
      onUpdated();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: 'Failed to update assignment',
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
          <DialogTitle>Edit Assignment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-assign-title">Title</Label>
            <Input
              id="edit-assign-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-assign-desc">Description</Label>
            <Textarea
              id="edit-assign-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-assign-due">Due Date</Label>
            <Input
              id="edit-assign-due"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !form.title.trim()}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
