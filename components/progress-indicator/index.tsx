'use client';

import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  progress: number;
  message: string;
}

const steps = ['Connecting...', 'Processing...', 'Finishing...'];

export function ProgressIndicator({ progress, message }: ProgressIndicatorProps) {
  const stepIndex =
    progress < 30 ? 0
    : progress < 80 ? 1
    : 2;

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="6" />
          <motion.circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke="url(#prog-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={213.6}
            animate={{ strokeDashoffset: 213.6 - (213.6 * progress) / 100 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="prog-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-[var(--text-primary)]">{progress}%</span>
        </div>
      </div>

      <div>
        <p className="text-base font-semibold text-[var(--text-primary)] text-center">{message || 'Processing...'}</p>
        <p className="text-sm text-[var(--text-muted)] text-center mt-1">This may take up to 90 seconds</p>
      </div>

      <div className="flex items-center gap-3">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={[
                'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                i < stepIndex
                  ? 'bg-[var(--accent-green)] text-white'
                  : i === stepIndex
                  ? 'bg-[var(--accent-blue)] text-white'
                  : 'bg-[var(--border)] text-[var(--text-muted)]',
              ].join(' ')}
            >
              {i < stepIndex ? '✓' : i + 1}
            </div>
            <span
              className={`text-xs ${
                i <= stepIndex ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'
              }`}
            >
              {step}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-6 h-px ${i < stepIndex ? 'bg-[var(--accent-green)]' : 'bg-[var(--border)]'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
