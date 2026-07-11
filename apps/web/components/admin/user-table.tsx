'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface UserTableProps {
  users: User[];
  onUpdate: () => void;
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800',
    teacher: 'bg-blue-100 text-blue-800',
    student: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[role] ?? ''}`}>
      {role}
    </span>
  );
}

export function UserTable({ users, onUpdate }: UserTableProps) {
  async function toggleSuspend(id: string, suspended: boolean) {
    try {
      await api(`/admin/users/${id}/${suspended ? 'unsuspend' : 'suspend'}`, { method: 'POST' });
      toast({
        title: suspended ? 'User unsuspended' : 'User suspended',
        variant: 'success',
      });
      onUpdate();
    } catch (err) {
      toast({
        title: 'Action failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }

  async function deleteUser(id: string) {
    if (!confirm('Delete this user?')) return;
    try {
      await api(`/admin/users/${id}`, { method: 'DELETE' });
      toast({ title: 'User deleted', variant: 'success' });
      onUpdate();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Name</th>
                <th className="pb-3 pr-4 font-medium">Email</th>
                <th className="pb-3 pr-4 font-medium">Role</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-medium">{u.name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{u.email}</td>
                  <td className="py-3 pr-4">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="py-3 pr-4">
                    {u.suspended ? (
                      <Badge variant="destructive">Suspended</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleSuspend(u.id, u.suspended)}
                      >
                        {u.suspended ? 'Unsuspend' : 'Suspend'}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteUser(u.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">No users found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
