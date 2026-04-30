'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useUpload } from '@/hooks/use-upload';
import { useEditorStore } from '@/store';

export function UploadZone() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setImage } = useEditorStore();

  const { isDragging, error, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, handleFileInput } =
    useUpload((file, base64) => setImage(file, base64));

  return (
    <motion.div
      className={`relative flex flex-col items-center justify-center gap-5 p-10 rounded-[var(--radius-lg)] cursor-pointer dashed-border ${isDragging ? 'active' : ''}`}
      onClick={() => fileInputRef.current?.click()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{ minHeight: 320, background: isDragging ? 'rgba(59,130,246,0.06)' : 'var(--bg-secondary)' }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileInput}
      />

      <motion.div
        className="w-20 h-20 rounded-[var(--radius-lg)] flex items-center justify-center text-4xl"
        style={{ background: 'var(--gradient-card)', border: '1px solid var(--border)' }}
        animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
      >
        🖼️
      </motion.div>

      <div className="text-center">
        <p className="text-base font-semibold text-[var(--text-primary)] mb-1">
          {isDragging ? 'Drop your image here' : 'Drag & drop your image'}
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          or click to browse — JPEG, PNG, WebP up to 10 MB
        </p>
      </div>

      {error && (
        <p className="text-sm text-[var(--accent-red)] bg-red-900/20 px-4 py-2 rounded-[var(--radius-sm)] border border-red-900">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
        {['JPEG', 'PNG', 'WebP'].map((fmt) => (
          <span key={fmt} className="px-2 py-1 bg-[var(--bg-card)] rounded-full border border-[var(--border)]">
            {fmt}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
