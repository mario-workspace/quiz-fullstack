'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface StudentOption {
  id: string;
  name: string;
  email: string;
}

interface StudentMultiSelectProps {
  students: StudentOption[];
  excludeIds?: string[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  placeholder?: string;
}

export function StudentMultiSelect({
  students,
  excludeIds = [],
  selectedIds,
  onSelectionChange,
  placeholder = 'Search students by email...',
}: StudentMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const available = useMemo(
    () => students.filter((s) => !excludeIds.includes(s.id)),
    [students, excludeIds],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return available;
    return available.filter(
      (s) => s.email.toLowerCase().includes(query) || s.name.toLowerCase().includes(query),
    );
  }, [available, search]);

  const selectedStudents = useMemo(
    () => available.filter((s) => selectedIds.includes(s.id)),
    [available, selectedIds],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleStudent(id: string) {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  }

  return (
    <div ref={containerRef} className="relative space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between font-normal"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="truncate text-muted-foreground">
          {selectedIds.length > 0
            ? `${selectedIds.length} student${selectedIds.length === 1 ? '' : 's'} selected`
            : placeholder}
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 opacity-50 transition-transform', open && 'rotate-180')} />
      </Button>

      {selectedStudents.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedStudents.map((s) => (
            <Badge key={s.id} variant="secondary" className="gap-1 pr-1">
              {s.email}
              <button
                type="button"
                className="ml-1 rounded-sm hover:bg-muted"
                onClick={() => toggleStudent(s.id)}
                aria-label={`Remove ${s.email}`}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name..."
              className="h-8 border-0 px-0 shadow-none focus-visible:ring-0"
              autoFocus
            />
          </div>
          <ul className="max-h-52 overflow-y-auto p-1">
            {filtered.map((s) => {
              const checked = selectedIds.includes(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-muted',
                      checked && 'bg-muted/60',
                    )}
                    onClick={() => toggleStudent(s.id)}
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border',
                        checked && 'border-primary bg-primary text-primary-foreground',
                      )}
                    >
                      {checked && <Check className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{s.email}</span>
                      <span className="block truncate text-xs text-muted-foreground">{s.name}</span>
                    </span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                {available.length === 0
                  ? 'All students are already enrolled in this class.'
                  : 'No students match your search.'}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
