'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type { ClassItem, ClassStudent } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface StudentEnrollFormProps {
  classes: ClassItem[];
}

export function StudentEnrollForm({ classes }: StudentEnrollFormProps) {
  const [classId, setClassId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!classId) {
      setStudents([]);
      return;
    }
    api<ClassStudent[]>(`/teacher/classes/${classId}/students`)
      .then(setStudents)
      .catch(() => setStudents([]));
  }, [classId]);

  async function addStudent() {
    if (!classId || !studentEmail) return;
    setLoading(true);
    try {
      await api(`/teacher/classes/${classId}/students`, {
        method: 'POST',
        body: JSON.stringify({ email: studentEmail }),
      });
      setStudentEmail('');
      setStudents(await api<ClassStudent[]>(`/teacher/classes/${classId}/students`));
      toast({ title: 'Student enrolled', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Enrollment failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function removeStudent(sid: string) {
    if (!classId) return;
    try {
      await api(`/teacher/classes/${classId}/students/${sid}`, { method: 'DELETE' });
      setStudents(await api<ClassStudent[]>(`/teacher/classes/${classId}/students`));
      toast({ title: 'Student removed', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Remove failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Manage Students</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Class</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Student Email</Label>
            <Input
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="student@school.edu"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={addStudent} disabled={loading || !classId || !studentEmail} className="w-full">
              Add Student
            </Button>
          </div>
        </div>
        {classId && (
          <ul className="space-y-2">
            {students.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded border border-border p-3 text-sm"
              >
                <span>
                  {s.name} — {s.email}
                </span>
                <Button size="sm" variant="outline" onClick={() => removeStudent(s.id)}>
                  Remove
                </Button>
              </li>
            ))}
            {students.length === 0 && (
              <p className="text-sm text-muted-foreground">No students enrolled.</p>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
