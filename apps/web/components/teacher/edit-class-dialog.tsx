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
import type { ClassItem } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface EditClassDialogProps {
  classItem: ClassItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function EditClassDialog({
  classItem,
  open,
  onOpenChange,
  onUpdated,
}: EditClassDialogProps) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classItem) {
      setForm({ name: classItem.name, description: classItem.description ?? '' });
    }
  }, [classItem]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!classItem) return;

    setLoading(true);
    try {
      await api(`/teacher/classes/${classItem.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
        }),
      });
      toast({ title: 'Class updated', variant: 'success' });
      onUpdated();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: 'Failed to update class',
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
          <DialogTitle>Edit Class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-class-name">Name</Label>
            <Input
              id="edit-class-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-class-desc">Description</Label>
            <Textarea
              id="edit-class-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
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
