'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTimestamp, downloadBase64Image } from '@/lib/utils';
import { OPERATIONS } from '@/lib/constants';
import type { OperationType } from '@/types';
import { useRouter } from 'next/navigation';

const ALL_FILTER = 'all';

export function GalleryPage() {
  const { history, clearHistory } = useEditorStore();
  const [filter, setFilter] = useState<OperationType | typeof ALL_FILTER>(ALL_FILTER);
  const router = useRouter();

  const filtered =
    filter === ALL_FILTER ? history : history.filter((item) => item.operation === filter);

  const usedOperations = [...new Set(history.map((h) => h.operation))];

  const handleReEdit = (originalImage: string) => {
    useEditorStore.setState({ originalImage, editedImage: null, maskData: null });
    router.push('/editor');
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Edit Gallery
          </h1>
          <p className="text-[var(--text-muted)] mt-1 text-sm">
            {history.length} image{history.length !== 1 ? 's' : ''} edited this session
          </p>
        </div>
        {history.length > 0 && (
          <Button variant="danger" size="sm" onClick={clearHistory}>
            Clear All
          </Button>
        )}
      </div>

      {history.length > 0 && (
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setFilter(ALL_FILTER)}
            className={[
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              filter === ALL_FILTER
                ? 'bg-[var(--accent-blue)] text-white border-transparent'
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--border-active)]',
            ].join(' ')}
          >
            All ({history.length})
          </button>
          {usedOperations.map((op) => {
            const info = OPERATIONS.find((o) => o.id === op);
            const count = history.filter((h) => h.operation === op).length;
            return (
              <button
                key={op}
                onClick={() => setFilter(op)}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  filter === op
                    ? 'bg-[var(--accent-blue)] text-white border-transparent'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--border-active)]',
                ].join(' ')}
              >
                {info?.icon} {info?.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            className="flex flex-col items-center justify-center gap-5 py-32 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-20 h-20 rounded-[var(--radius-xl)] bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-3xl">
              🖼️
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">No edits yet</h2>
              <p className="text-[var(--text-muted)] text-sm">
                Start editing images — they will automatically appear here
              </p>
            </div>
            <Button variant="gradient" size="md" onClick={() => router.push('/editor')} >
              Open Editor
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filtered.map((item, i) => {
              const opInfo = OPERATIONS.find((o) => o.id === item.operation);
              return (
                <motion.div
                  key={item.id}
                  className="card overflow-hidden"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  layout
                >
                  <div className="relative grid grid-cols-2 gap-0.5 bg-[var(--border)]">
                    <img
                      src={item.originalImage}
                      alt="Original"
                      className="w-full aspect-square object-cover"
                    />
                    <img
                      src={item.editedImage}
                      alt="Edited"
                      className="w-full aspect-square object-cover"
                    />
                    <span className="absolute top-2 left-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                      Before
                    </span>
                    <span className="absolute top-2 right-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                      After
                    </span>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="info">
                        {opInfo?.icon} {opInfo?.label}
                      </Badge>
                      <span className="text-xs text-[var(--text-muted)]">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        onClick={() => downloadBase64Image(item.editedImage, `pixelmind-${item.id}.png`)}
                      >
                        Download
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={() => handleReEdit(item.originalImage)}
                      >
                        Re-edit
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
