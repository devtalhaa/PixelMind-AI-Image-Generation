'use client';

import { useCallback } from 'react';
import { useEditorStore } from '@/store';
import { OperationCard } from '@/components/operation-card';
import { OPERATIONS } from '@/lib/constants';
import type { OperationType } from '@/types';

interface ToolPanelProps {
  onOperationSelect: (op: OperationType) => void;
}

export function ToolPanel({ onOperationSelect }: ToolPanelProps) {
  const { selectedOperation, setOperation } = useEditorStore();

  const handleOperationSelect = useCallback(
    (op: OperationType) => {
      setOperation(op);
      onOperationSelect(op);
    },
    [setOperation, onOperationSelect]
  );

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] border-r border-[var(--border)] overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
          AI Operations
        </h2>
        <div className="flex flex-col gap-1.5">
          {OPERATIONS.map((op) => (
            <OperationCard
              key={op.id}
              operation={op}
              isSelected={selectedOperation === op.id}
              onClick={() => handleOperationSelect(op.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
