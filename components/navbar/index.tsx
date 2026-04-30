'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '@/store';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/editor', label: 'Editor' },
  { href: '/gallery', label: 'Gallery' },
];

export function Navbar() {
  const pathname = usePathname();
  const { isColabConnected, colabUrl, setShowColabDialog, checkColabConnection } = useEditorStore();

  useEffect(() => {
    if (!colabUrl) return;
    checkColabConnection();
    const interval = setInterval(() => {
      checkColabConnection();
    }, 30000);
    return () => clearInterval(interval);
  }, [colabUrl, checkColabConnection]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-40 h-16"
      style={{ borderBottom: '1px solid var(--border)' }}
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div
        className="h-full flex items-center justify-between px-6 max-w-7xl mx-auto"
        style={{
          background: 'rgba(8, 11, 20, 0.85)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--gradient-accent)' }}
          >
            P
          </div>
          <span className="font-bold text-base text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
            PixelMind <span className="gradient-text">AI</span>
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  'px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]',
                ].join(' ')}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {colabUrl && (
            <button
              onClick={() => checkColabConnection()}
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] bg-[var(--bg-card)] px-3 py-1.5 rounded-full border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors cursor-pointer"
              title="Click to re-check connection"
            >
              <span
                className={`w-2 h-2 rounded-full ${isColabConnected ? 'bg-[var(--accent-green)]' : 'bg-[var(--accent-red)]'}`}
                style={{ boxShadow: isColabConnected ? '0 0 6px var(--accent-green)' : 'none' }}
              />
              {isColabConnected ? 'Backend Online' : 'Backend Offline'}
            </button>
          )}
          
          <button 
            onClick={() => setShowColabDialog(true)}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-[var(--radius-sm)] transition-colors"
            title="Backend Settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </div>
    </motion.header>
  );
}
