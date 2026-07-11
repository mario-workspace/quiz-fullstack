'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { ClassItem, ClassStudent } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface ClassDetailDashboardProps {
  classId: string;
}

export function ClassDetailDashboard({ classId }: ClassDetailDashboardProps) {
  const [classInfo, setClassInfo] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [studentEmail, setStudentEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cls, enrolled] = await Promise.all([
        api<ClassItem>(`/teacher/classes/${classId}`),
        api<ClassStudent[]>(`/teacher/classes/${classId}/students`),
      ]);
      setClassInfo(cls);
      setStudents(enrolled);
    } catch (err) {
      setClassInfo(null);
      setStudents([]);
      toast({
        title: 'Failed to load class',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function addStudent() {
    if (!studentEmail.trim()) return;
    setAdding(true);
    try {
      await api(`/teacher/classes/${classId}/students`, {
        method: 'POST',
        body: JSON.stringify({ email: studentEmail.trim() }),
      });
      setStudentEmail('');
      toast({ title: 'Student enrolled', variant: 'success' });
      await loadData();
    } catch (err) {
      toast({
        title: 'Enrollment failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  }

  async function removeStudent(studentId: string) {
    setRemovingId(studentId);
    try {
      await api(`/teacher/classes/${classId}/students/${studentId}`, { method: 'DELETE' });
      toast({ title: 'Student removed', variant: 'success' });
      await loadData();
    } catch (err) {
      toast({
        title: 'Remove failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading class details...</p>;
  }

  if (!classInfo) {
    return <p className="text-sm text-muted-foreground">Class not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{classInfo.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>{classInfo.description?.trim() || 'No description'}</p>
          <p>{students.length} enrolled student{students.length === 1 ? '' : 's'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enrolled Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="student-email">Add Student by Email</Label>
              <Input
                id="student-email"
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@school.edu"
              />
            </div>
            <Button onClick={addStudent} disabled={adding || !studentEmail.trim()}>
              {adding ? 'Adding...' : 'Add Student'}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-medium">{s.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{s.email}</td>
                    <td className="py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={removingId === s.id}
                        onClick={() => removeStudent(s.id)}
                      >
                        {removingId === s.id ? 'Removing...' : 'Remove'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">No students enrolled yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
