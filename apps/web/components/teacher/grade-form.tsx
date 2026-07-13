'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatMarks, formatMarksBadge } from '@/lib/marks';
import type { Submission } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface GradeFormProps {
  submission: Submission;
  onGraded: () => void;
}

export function GradeForm({ submission, onGraded }: GradeFormProps) {
  const [score, setScore] = useState(submission.score ?? 0);
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setScore(submission.score ?? 0);
    setFeedback(submission.feedback ?? '');
  }, [submission]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api(`/teacher/submissions/${submission.id}/grade`, {
        method: 'POST',
        body: JSON.stringify({ score, feedback: feedback || undefined }),
      });
      toast({ title: 'Marks submitted', variant: 'success' });
      onGraded();
    } catch (err) {
      toast({
        title: 'Marking failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const isUpdate = submission.score != null;

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 grid gap-3 rounded-md border border-border bg-muted/30 p-3 md:grid-cols-3"
    >
      <div className="space-y-1">
        <Label>Marks (0–100)</Label>
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
          {loading ? 'Saving...' : isUpdate ? 'Update Marks' : 'Submit Marks'}
        </Button>
      </div>
    </form>
  );
}

interface SubmissionsPanelProps {
  assignmentId: string;
  onPublish?: () => void;
  showPublish?: boolean;
}

export function SubmissionsPanel({
  assignmentId,
  onPublish,
  showPublish = true,
}: SubmissionsPanelProps) {
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
        <CardTitle className="text-lg">Submissions & Marking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={loadSubmissions} disabled={loading || !assignmentId}>
            {loading ? 'Loading...' : 'Load Submissions'}
          </Button>
          {showPublish && (
            <Button variant="outline" onClick={publish} disabled={!assignmentId}>
              Publish Assignment
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {submissions.map((s) => {
            const marked = s.score != null;
            return (
              <div key={s.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{s.student_name}</p>
                      {marked && (
                        <Badge variant="success">{formatMarksBadge(s.score!)}</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted {new Date(s.submitted_at).toLocaleString()}
                    </p>
                    {marked && (
                      <div className="mt-2 rounded-md bg-muted/40 px-3 py-2 text-sm">
                        <p className="font-medium text-foreground">Marks: {formatMarks(s.score!)}</p>
                        {s.feedback?.trim() && (
                          <p className="mt-1 text-muted-foreground">Feedback: {s.feedback}</p>
                        )}
                        {s.graded_at && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Marked {new Date(s.graded_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={gradingId === s.id ? 'default' : 'outline'}
                    onClick={() => setGradingId(gradingId === s.id ? null : s.id)}
                  >
                    {marked ? 'Remark' : 'Mark'}
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
            );
          })}
          {submissions.length === 0 && !loading && assignmentId && (
            <p className="text-sm text-muted-foreground">No submissions yet for this assignment.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
