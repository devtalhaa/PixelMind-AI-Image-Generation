'use client';

import type { TextareaProps } from '@/types';

export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  error,
  rows = 4,
  disabled = false,
  className = '',
}: TextareaProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={[
          'w-full bg-[var(--bg-secondary)] border rounded-[var(--radius-md)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm px-3 py-2.5 transition-all duration-200 outline-none resize-none',
          error
            ? 'border-[var(--accent-red)] focus:border-[var(--accent-red)]'
            : 'border-[var(--border)] focus:border-[var(--border-active)]',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      />
      {error && (
        <p className="text-xs text-[var(--accent-red)]">{error}</p>
      )}
    </div>
  );
}
