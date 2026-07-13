'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatMarksBadge, getMarksBadgeVariant } from '@/lib/marks';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import type { Assignment, Grade } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface AssignmentViewDialogProps {
  assignment: Assignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
}

function isPastDue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export { getMarksBadgeVariant as getGradeBadgeVariant } from '@/lib/marks';

export function AssignmentViewDialog({
  assignment,
  open,
  onOpenChange,
  onSubmitted,
}: AssignmentViewDialogProps) {
  const [content, setContent] = useState('');
  const [grade, setGrade] = useState<Pick<Grade, 'score' | 'feedback'> | null>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pastDue = assignment ? isPastDue(assignment.due_date) : false;
  const gradedScore = grade?.score ?? assignment?.score ?? null;
  const isGraded = gradedScore != null;
  const readOnly = pastDue || isGraded;

  useEffect(() => {
    if (!open || !assignment) {
      setContent('');
      setGrade(null);
      return;
    }

    setLoadingSubmission(true);
    api<{ submission: { content: string } | null; grade: Grade | null }>(
      `/student/assignments/${assignment.id}/submission`,
    )
      .then((data) => {
        setContent(data.submission?.content ?? '');
        setGrade(
          data.grade
            ? { score: Number(data.grade.score), feedback: data.grade.feedback }
            : null,
        );
      })
      .catch(() => {
        setContent('');
        setGrade(null);
      })
      .finally(() => setLoadingSubmission(false));
  }, [open, assignment]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assignment || !content.trim() || readOnly) return;

    setSubmitting(true);
    try {
      await api(`/student/assignments/${assignment.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ content: content.trim() }),
      });
      toast({ title: 'Submission sent', variant: 'success' });
      onSubmitted();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: 'Submission failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!assignment) return null;

  const readOnlyMessage = isGraded
    ? 'This assignment has been marked. You can view your work and feedback but cannot edit or resubmit.'
    : pastDue
      ? 'This assignment is past its due date. You can view your work but cannot edit or submit.'
      : null;

  const workPlaceholder = isGraded
    ? 'View only — marks recorded'
    : pastDue
      ? 'View only — past due date'
      : 'Enter your submission...';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <DialogTitle className="pr-2">Assignment Details</DialogTitle>
          {isGraded && (
            <Badge variant={getMarksBadgeVariant(gradedScore)} className="shrink-0 text-sm">
              {formatMarksBadge(gradedScore)}
            </Badge>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assignment-title">Assignment Name</Label>
            <Input id="assignment-title" value={assignment.title} disabled readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignment-desc">Description</Label>
            <textarea
              id="assignment-desc"
              className="flex min-h-[80px] w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-70"
              value={assignment.description?.trim() || 'No description'}
              disabled
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignment-due">Due Date</Label>
            <Input
              id="assignment-due"
              value={assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
              disabled
              readOnly
            />
          </div>
          {isGraded && (
            <div className="space-y-1 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
              {grade?.feedback?.trim() ? (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Teacher feedback:</span>{' '}
                  {grade.feedback}
                </p>
              ) : (
                <p className="text-muted-foreground">No teacher feedback provided.</p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="assignment-work">Your Work</Label>
            <textarea
              id="assignment-work"
              className="flex min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-70"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={workPlaceholder}
              disabled={readOnly || loadingSubmission}
              readOnly={readOnly}
              required={!readOnly}
            />
            {readOnlyMessage && (
              <p className="text-xs text-muted-foreground">{readOnlyMessage}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {!readOnly && (
              <Button type="submit" disabled={submitting || loadingSubmission || !content.trim()}>
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function getAssignmentStatus(assignment: Assignment): {
  label: string;
  variant: 'success' | 'secondary' | 'destructive';
} {
  const pastDue = isPastDue(assignment.due_date);
  if (assignment.score != null) return { label: 'Marked', variant: 'success' };
  if (assignment.submission_id) return { label: 'Submitted', variant: 'secondary' };
  if (pastDue) return { label: 'Overdue', variant: 'destructive' };
  return { label: 'Pending', variant: 'secondary' };
}
