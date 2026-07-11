'use client';

import { useCallback, useEffect, useState } from 'react';
import { UserForm } from '@/components/admin/user-form';
import { UserTable } from '@/components/admin/user-table';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = useCallback(() => {
    api<User[]>('/admin/users')
      .then(setUsers)
      .catch((err) => {
        setUsers([]);
        toast({
          title: 'Failed to load users',
          description: err instanceof Error ? err.message : 'Unknown error',
          variant: 'destructive',
        });
      });
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <div className="space-y-6">
      <UserForm onCreated={loadUsers} />
      <UserTable users={users} onUpdate={loadUsers} />
    </div>
  );
}
