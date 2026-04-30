'use client';

import type { InputFieldProps } from '@/types';

export function InputField({
  label,
  placeholder,
  value,
  onChange,
  error,
  type = 'text',
  icon,
  disabled = false,
  className = '',
}: InputFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-[var(--text-muted)] pointer-events-none flex items-center">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={[
            'w-full bg-[var(--bg-secondary)] border rounded-[var(--radius-md)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm py-2.5 transition-all duration-200 outline-none',
            icon ? 'pl-9 pr-3' : 'px-3',
            error
              ? 'border-[var(--accent-red)] focus:border-[var(--accent-red)]'
              : 'border-[var(--border)] focus:border-[var(--border-active)]',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
        />
      </div>
      {error && (
        <p className="text-xs text-[var(--accent-red)]">{error}</p>
      )}
    </div>
  );
}
