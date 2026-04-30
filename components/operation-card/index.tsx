'use client';

import type { OperationInfo } from '@/types';

interface OperationCardProps {
  operation: OperationInfo;
  isSelected: boolean;
  onClick: () => void;
}

export function OperationCard({ operation, isSelected, onClick }: OperationCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] border transition-all duration-200 text-left',
        isSelected
          ? 'border-[var(--border-active)] bg-blue-950/40 shadow-[var(--shadow-glow)]'
          : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-active)] hover:bg-[var(--bg-card-hover)]',
      ].join(' ')}
    >
      <span className="text-xl flex-shrink-0">{operation.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-medium truncate ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
            {operation.label}
          </span>
          <span className="text-xs text-[var(--text-muted)] flex-shrink-0 bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded-full border border-[var(--border)]">
            {operation.estimatedTime}
          </span>
        </div>
        <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{operation.description}</p>
      </div>
    </button>
  );
}
