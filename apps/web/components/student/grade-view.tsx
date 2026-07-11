'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Grade } from '@/lib/types';
import { Award } from 'lucide-react';

interface GradeViewProps {
  grades: Grade[];
}

function scoreColor(score: number) {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

export function GradeView({ grades }: GradeViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">My Grades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {grades.map((g, i) => (
            <div
              key={g.id ?? i}
              className="flex items-start justify-between rounded-lg border border-border p-4"
            >
              <div className="flex items-start gap-3">
                <Award className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{g.assignment_title}</p>
                  <p className="text-sm text-muted-foreground">{g.class_name}</p>
                  {g.feedback && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Feedback: {g.feedback}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Graded {new Date(g.graded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge className={`text-base font-bold ${scoreColor(g.score)}`}>
                {g.score}%
              </Badge>
            </div>
          ))}
        </div>
        {grades.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No grades yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
