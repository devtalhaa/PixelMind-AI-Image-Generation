'use client';

import type { BadgeProps, BadgeVariant } from '@/types';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)]',
  success: 'bg-emerald-900/40 text-emerald-400 border-emerald-800',
  warning: 'bg-amber-900/40 text-amber-400 border-amber-800',
  error: 'bg-red-900/40 text-red-400 border-red-800',
  info: 'bg-blue-900/40 text-blue-400 border-blue-800',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
