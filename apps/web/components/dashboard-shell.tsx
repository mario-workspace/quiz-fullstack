'use client';

import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { ChatProvider } from '@/components/chatbot';
import { DashboardNavigationProvider } from '@/components/dashboard-navigation';
import type { AuthUser } from '@/lib/auth';

export function DashboardShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  return (
    <DashboardNavigationProvider>
      <ChatProvider>
        <div className="min-h-screen bg-muted/30">
          <Navbar user={user} />
          <div className="flex">
            <Sidebar user={user} />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </ChatProvider>
    </DashboardNavigationProvider>
  );
}
