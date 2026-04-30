'use client';

import { useState } from 'react';
import type { SliderProps } from '@/types';
import { clamp } from '@/lib/utils';

export function Slider({ min, max, value, onChange, label, step = 1, className = '' }: SliderProps) {
  const [hovered, setHovered] = useState(false);
  const percentage = ((clamp(value, min, max) - min) / (max - min)) * 100;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
            {label}
          </label>
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded-[var(--radius-sm)] transition-all duration-200 ${
              hovered
                ? 'bg-[var(--accent-blue)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
            }`}
          >
            {value > 0 ? `+${value}` : value}
          </span>
        </div>
      )}
      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative h-1 w-full rounded-full bg-[var(--border)]">
          <div
            className="absolute h-full rounded-full transition-all duration-100"
            style={{
              width: `${percentage}%`,
              background: 'var(--gradient-accent)',
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 opacity-0 w-full cursor-pointer"
          style={{ marginTop: '-6px', height: '20px' }}
        />
      </div>
    </div>
  );
}
