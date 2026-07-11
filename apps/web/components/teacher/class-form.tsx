'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface ClassFormProps {
  onCreated: () => void;
}

export function ClassForm({ onCreated }: ClassFormProps) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/teacher/classes', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', description: '' });
      toast({ title: 'Class created', variant: 'success' });
      onCreated();
    } catch (err) {
      toast({
        title: 'Failed to create class',
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
        <CardTitle className="text-lg">Create Class</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="class-name">Name</Label>
            <Input
              id="class-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class-desc">Description</Label>
            <Input
              id="class-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={loading} className="md:col-span-2">
            {loading ? 'Creating...' : 'Create Class'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
