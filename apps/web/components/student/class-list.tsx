'use client';

import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ClassItem } from '@/lib/types';

interface StudentClassListProps {
  classes: ClassItem[];
  selectedId?: string;
  onSelect?: (classId: string) => void;
}

export function StudentClassList({ classes, selectedId, onSelect }: StudentClassListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">My Classes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {classes.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect?.(c.id)}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted',
                selectedId === c.id ? 'border-primary bg-primary/5' : 'border-border',
              )}
            >
              <BookOpen className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{c.name}</p>
                {c.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
        {classes.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">You are not enrolled in any classes.</p>
        )}
      </CardContent>
    </Card>
  );
}
