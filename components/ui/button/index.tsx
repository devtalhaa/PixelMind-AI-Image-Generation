'use client';

import { motion } from 'framer-motion';
import type { ButtonProps } from '@/types';

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  icon,
  type = 'button',
  className = '',
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  const variantStyles: Record<string, string> = {
    primary: 'bg-[var(--accent-blue)] text-white hover:bg-blue-500',
    secondary: 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-active)]',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]',
    danger: 'bg-[var(--accent-red)] text-white hover:bg-red-500',
    gradient: 'text-white',
  };

  const base = [
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-all duration-200 select-none outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]',
    sizeStyles[size],
    variantStyles[variant],
    fullWidth ? 'w-full' : '',
    isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    className,
  ].join(' ');

  const gradientStyle =
    variant === 'gradient'
      ? { background: 'var(--gradient-accent)' }
      : {};

  return (
    <motion.button
      type={type}
      className={base}
      style={gradientStyle}
      onClick={isDisabled ? undefined : onClick}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}
