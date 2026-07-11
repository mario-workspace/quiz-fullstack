'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import type { GroupTeacher, TeacherGroup } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { Users } from 'lucide-react';

interface TeacherGroupListProps {
  groups: TeacherGroup[];
  onUpdate: () => void;
}

export function TeacherGroupList({ groups, onUpdate }: TeacherGroupListProps) {
  const [teacherId, setTeacherId] = useState('');
  const [_selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<GroupTeacher[]>([]);

  async function deleteGroup(id: string) {
    if (!confirm('Delete this teacher group?')) return;
    try {
      await api(`/admin/teacher-groups/${id}`, { method: 'DELETE' });
      toast({ title: 'Group deleted', variant: 'success' });
      onUpdate();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }

  async function loadTeachers(groupId: string) {
    setSelectedGroup(groupId);
    try {
      const data = await api<GroupTeacher[]>(`/admin/teacher-groups/${groupId}/teachers`);
      setTeachers(data);
    } catch {
      setTeachers([]);
    }
  }

  async function addTeacher(groupId: string) {
    if (!teacherId) return;
    try {
      await api(`/admin/teacher-groups/${groupId}/teachers`, {
        method: 'POST',
        body: JSON.stringify({ teacherId }),
      });
      setTeacherId('');
      toast({ title: 'Teacher added to group', variant: 'success' });
      await loadTeachers(groupId);
      onUpdate();
    } catch (err) {
      toast({
        title: 'Failed to add teacher',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Teacher Groups ({groups.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {groups.map((g) => (
          <div
            key={g.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{g.name}</p>
              {g.description && (
                <p className="text-sm text-muted-foreground">{g.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" onClick={() => loadTeachers(g.id)}>
                    <Users className="mr-1 h-4 w-4" />
                    Manage Teachers
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Teachers in {g.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <ul className="space-y-2">
                      {teachers.map((t) => (
                        <li key={t.id} className="rounded border p-2 text-sm">
                          {t.name} — {t.email}
                        </li>
                      ))}
                      {teachers.length === 0 && (
                        <p className="text-sm text-muted-foreground">No teachers in this group.</p>
                      )}
                    </ul>
                    <div className="space-y-2">
                      <Label>Add Teacher by ID</Label>
                      <div className="flex gap-2">
                        <Input
                          value={teacherId}
                          onChange={(e) => setTeacherId(e.target.value)}
                          placeholder="Teacher UUID"
                        />
                        <Button onClick={() => addTeacher(g.id)}>Add</Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button size="sm" variant="destructive" onClick={() => deleteGroup(g.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No teacher groups yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
