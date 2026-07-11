'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import type { Assignment } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface SubmissionFormProps {
  assignments: Assignment[];
  selectedAssignmentId?: string;
}

export function SubmissionForm({ assignments, selectedAssignmentId }: SubmissionFormProps) {
  const [assignmentId, setAssignmentId] = useState(selectedAssignmentId ?? '');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedAssignmentId) {
      setAssignmentId(selectedAssignmentId);
    }
  }, [selectedAssignmentId]);

  const published = assignments.filter((a) => a.published);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assignmentId || !content) return;
    setLoading(true);
    try {
      await api(`/student/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      setContent('');
      toast({ title: 'Submission sent', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Submission failed',
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
        <CardTitle className="text-lg">Submit Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Assignment</Label>
            <Select
              value={assignmentId}
              onValueChange={setAssignmentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignment" />
              </SelectTrigger>
              <SelectContent>
                {published.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="submission-content">Your Work</Label>
            <textarea
              id="submission-content"
              className="flex min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your submission..."
              required
            />
          </div>
          <Button type="submit" disabled={loading || !assignmentId}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
