'use client';

import { useState } from 'react';
import type { SelectProps } from '@/types';

export function Select({ options, value, onChange, label, disabled = false, className = '' }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className={`relative flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className={[
          'flex items-center justify-between w-full bg-[var(--bg-secondary)] border rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-left transition-all duration-200',
          open ? 'border-[var(--border-active)]' : 'border-[var(--border)]',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <span className={selected ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
          {selected?.label ?? 'Select...'}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`transition-transform duration-200 text-[var(--text-muted)] ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full mt-1 w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] shadow-[var(--shadow-card)] z-20 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={[
                'w-full text-left px-3 py-2.5 text-sm transition-colors',
                opt.value === value
                  ? 'bg-[var(--accent-blue)] text-white'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
