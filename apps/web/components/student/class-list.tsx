'use client';

import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ClassItem } from '@/lib/types';

interface StudentClassListProps {
  classes: ClassItem[];
}

export function StudentClassList({ classes }: StudentClassListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">My Classes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {classes.map((c) => (
            <div key={c.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
              <BookOpen className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{c.name}</p>
                {c.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        {classes.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">You are not enrolled in any classes.</p>
        )}
      </CardContent>
    </Card>
  );
}
