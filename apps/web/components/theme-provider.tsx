'use client';

import * as React from 'react';
import { Check, Laptop, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  applyResolvedTheme,
  readStoredTheme,
  resolveTheme,
  storeTheme,
  type ResolvedTheme,
  type ThemeSetting,
} from '@/lib/theme';

interface ThemeContextValue {
  theme: ThemeSetting;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeSetting) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

function useSystemThemeListener(onChange: () => void) {
  React.useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => onChange();
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [onChange]);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeSetting>('system');
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>('light');

  const syncTheme = React.useCallback((setting: ThemeSetting) => {
    const resolved = resolveTheme(setting);
    setResolvedTheme(resolved);
    applyResolvedTheme(resolved);
  }, []);

  React.useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    syncTheme(stored);
  }, [syncTheme]);

  useSystemThemeListener(() => {
    setThemeState((current) => {
      if (current === 'system') syncTheme('system');
      return current;
    });
  });

  const setTheme = React.useCallback(
    (next: ThemeSetting) => {
      setThemeState(next);
      storeTheme(next);
      syncTheme(next);
    },
    [syncTheme],
  );

  const toggleTheme = React.useCallback(() => {
    setThemeState((current) => {
      const resolved = resolveTheme(current);
      const next: ThemeSetting = resolved === 'dark' ? 'light' : 'dark';
      storeTheme(next);
      syncTheme(next);
      return next;
    });
  }, [syncTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

const OPTIONS: { value: ThemeSetting; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  { value: 'system', label: 'System', icon: <Laptop className="h-4 w-4" /> },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={toggleTheme}
        onContextMenu={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-sm transition-colors hover:bg-muted"
        aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={`Theme: ${theme} (right-click for options)`}
      >
        {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-md border border-border bg-card p-1 shadow-lg">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted"
              onClick={() => {
                setTheme(opt.value);
                setOpen(false);
              }}
            >
              {opt.icon}
              <span className="flex-1 text-left">{opt.label}</span>
              {theme === opt.value && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
