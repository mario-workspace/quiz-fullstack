'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Assignment } from '@/lib/types';
import { Calendar, ClipboardList } from 'lucide-react';

interface AssignmentListProps {
  assignments: Assignment[];
  onSelect?: (assignmentId: string) => void;
  selectedId?: string;
}

export function AssignmentList({ assignments, onSelect, selectedId }: AssignmentListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {assignments.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onSelect?.(a.id)}
              className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted ${
                selectedId === a.id ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <ClipboardList className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{a.title}</p>
                    {a.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                    )}
                    {a.due_date && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Due {new Date(a.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={a.published ? 'success' : 'secondary'}>
                  {a.published ? 'Open' : 'Draft'}
                </Badge>
              </div>
            </button>
          ))}
        </div>
        {assignments.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No assignments available.</p>
        )}
      </CardContent>
    </Card>
  );
}
