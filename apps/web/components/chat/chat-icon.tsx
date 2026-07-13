import { cn } from '@/lib/utils';

interface ChatIconProps {
  className?: string;
}

export function ChatIcon({ className }: ChatIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-6 w-6', className)}
      aria-hidden="true"
    >
      <path
        d="M12 3C7.03 3 3 6.58 3 11c0 2.1.9 4.01 2.4 5.45L4 21l4.85-1.35C10.18 20.45 11.07 20.6 12 20.6c4.97 0 9-3.58 9-8s-4.03-8-9-8Z"
        className="fill-current opacity-20"
      />
      <path
        d="M12 3.75c4.42 0 8 3.13 8 7 0 3.87-3.58 7-8 7-.84 0-1.66-.14-2.42-.4L5.5 19.5l1.05-3.85C5.28 14.35 4.5 12.75 4.5 11c0-3.87 3.58-7 7.5-7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="11" r="1" className="fill-current" />
      <circle cx="12" cy="11" r="1" className="fill-current" />
      <circle cx="15" cy="11" r="1" className="fill-current" />
    </svg>
  );
}
