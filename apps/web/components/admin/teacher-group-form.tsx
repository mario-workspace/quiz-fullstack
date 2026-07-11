'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface TeacherGroupFormProps {
  onCreated: () => void;
}

export function TeacherGroupForm({ onCreated }: TeacherGroupFormProps) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/admin/teacher-groups', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', description: '' });
      toast({ title: 'Teacher group created', variant: 'success' });
      onCreated();
    } catch (err) {
      toast({
        title: 'Failed to create group',
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
        <CardTitle className="text-lg">Create Teacher Group</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="group-name">Name</Label>
            <Input
              id="group-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-desc">Description</Label>
            <Input
              id="group-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={loading} className="md:col-span-2">
            {loading ? 'Creating...' : 'Create Group'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
