'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MainPanelSpinner } from '@/components/ui/main-panel-spinner';

interface DashboardNavigationContextValue {
  startNavigation: () => void;
}

const DashboardNavigationContext = createContext<DashboardNavigationContextValue>({
  startNavigation: () => {},
});

export function useDashboardNavigation() {
  return useContext(DashboardNavigationContext);
}

export function DashboardNavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!isNavigating) return;
    const timer = window.setTimeout(() => setIsNavigating(false), 400);
    return () => window.clearTimeout(timer);
  }, [pathname, isNavigating]);

  return (
    <DashboardNavigationContext.Provider value={{ startNavigation: () => setIsNavigating(true) }}>
      {children}
      {isNavigating && (
        <div className="pointer-events-none fixed inset-0 z-30 md:left-64 md:top-14">
          <div className="flex h-full items-center justify-center bg-background/70 backdrop-blur-[1px]">
            <MainPanelSpinner />
          </div>
        </div>
      )}
    </DashboardNavigationContext.Provider>
  );
}
