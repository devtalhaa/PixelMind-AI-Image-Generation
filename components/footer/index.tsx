'use client';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-[4px] flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--gradient-accent)' }}
          >
            P
          </div>
          <span className="text-sm text-[var(--text-muted)]">
            PixelMind AI — Open-source AI image editing
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
          {['Stable Diffusion', 'Real-ESRGAN', 'GFPGAN', 'LaMa', 'FastAPI'].map((tech) => (
            <span
              key={tech}
              className="px-2 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border)]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
