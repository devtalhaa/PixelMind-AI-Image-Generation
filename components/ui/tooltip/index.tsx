'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TooltipProps } from '@/types';

export function Tooltip({ content, children, className = '' }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 text-xs text-white bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-sm)] whitespace-nowrap shadow-[var(--shadow-card)] pointer-events-none z-50"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
              style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid var(--border)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
