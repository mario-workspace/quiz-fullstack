'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import type { ClassItem } from '@/lib/types';
import { getMinDueDateInputValue, isDueDateInPast } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface AssignmentFormProps {
  classes: ClassItem[];
  onCreated: () => void;
}

export function AssignmentForm({ classes, onCreated }: AssignmentFormProps) {
  const [form, setForm] = useState({ classId: '', title: '', description: '', dueDate: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.dueDate && isDueDateInPast(form.dueDate)) {
      toast({
        title: 'Invalid due date',
        description: 'Due date must be today or a future date.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      await api('/teacher/assignments', {
        method: 'POST',
        body: JSON.stringify({
          classId: form.classId,
          title: form.title,
          description: form.description || undefined,
          dueDate: form.dueDate || undefined,
        }),
      });
      setForm({ classId: '', title: '', description: '', dueDate: '' });
      toast({ title: 'Assignment created', variant: 'success' });
      onCreated();
    } catch (err) {
      toast({
        title: 'Failed to create assignment',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Class</Label>
            <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assign-title">Title</Label>
            <Input
              id="assign-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="assign-desc">Description</Label>
            <Textarea
              id="assign-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Assignment instructions..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assign-due">Due Date</Label>
            <Input
              id="assign-due"
              type="date"
              min={getMinDueDateInputValue()}
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={loading || !form.classId} className="md:col-span-2">
            {loading ? 'Creating...' : 'Create Assignment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
