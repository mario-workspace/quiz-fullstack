'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { Submission } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface GradeFormProps {
  submission: Submission;
  onGraded: () => void;
}

export function GradeForm({ submission, onGraded }: GradeFormProps) {
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api(`/teacher/submissions/${submission.id}/grade`, {
        method: 'POST',
        body: JSON.stringify({ score, feedback: feedback || undefined }),
      });
      toast({ title: 'Grade submitted', variant: 'success' });
      onGraded();
    } catch (err) {
      toast({
        title: 'Grading failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 grid gap-3 rounded-md border border-border bg-muted/30 p-3 md:grid-cols-3"
    >
      <div className="space-y-1">
        <Label>Score (0–100)</Label>
        <Input
          type="number"
          min={0}
          max={100}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          required
        />
      </div>
      <div className="space-y-1">
        <Label>Feedback</Label>
        <Input value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Optional" />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Saving...' : 'Submit Grade'}
        </Button>
      </div>
    </form>
  );
}

interface SubmissionsPanelProps {
  assignmentId: string;
  onPublish?: () => void;
}

export function SubmissionsPanel({ assignmentId, onPublish }: SubmissionsPanelProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSubmissions = useCallback(async () => {
    if (!assignmentId) {
      setSubmissions([]);
      return;
    }
    setLoading(true);
    try {
      setSubmissions(await api<Submission[]>(`/teacher/assignments/${assignmentId}/submissions`));
    } catch (err) {
      setSubmissions([]);
      toast({
        title: 'Failed to load submissions',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  async function publish() {
    if (!assignmentId) return;
    try {
      await api(`/teacher/assignments/${assignmentId}/publish`, { method: 'POST' });
      toast({ title: 'Assignment published', variant: 'success' });
      onPublish?.();
    } catch (err) {
      toast({
        title: 'Publish failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Submissions & Grading</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={loadSubmissions} disabled={loading || !assignmentId}>
            {loading ? 'Loading...' : 'Load Submissions'}
          </Button>
          <Button variant="outline" onClick={publish} disabled={!assignmentId}>
            Publish Assignment
          </Button>
        </div>
        <div className="space-y-3">
          {submissions.map((s) => (
            <div key={s.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{s.student_name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted {new Date(s.submitted_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={gradingId === s.id ? 'default' : 'outline'}
                  onClick={() => setGradingId(gradingId === s.id ? null : s.id)}
                >
                  Grade
                </Button>
              </div>
              {gradingId === s.id && (
                <GradeForm
                  submission={s}
                  onGraded={() => {
                    setGradingId(null);
                    loadSubmissions();
                  }}
                />
              )}
            </div>
          ))}
          {submissions.length === 0 && !loading && assignmentId && (
            <p className="text-sm text-muted-foreground">No submissions yet for this assignment.</p>
          )}
          {!assignmentId && (
            <p className="text-sm text-muted-foreground">
              Select an assignment above to view and grade submissions.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
