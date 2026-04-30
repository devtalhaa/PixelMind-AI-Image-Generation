'use client';

import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { downloadBase64Image } from '@/lib/utils';

interface ResultPreviewProps {
  originalImage: string;
  editedImage: string;
  onEditAgain: () => void;
}

export function ResultPreview({ originalImage, editedImage, onEditAgain }: ResultPreviewProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSlider = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(pos, 2), 98));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSlider(e.clientX);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      updateSlider(e.clientX);
    },
    [isDragging, updateSlider]
  );

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateSlider(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    updateSlider(e.touches[0].clientX);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  };

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Before / After Comparison</h3>
        <p className="text-xs text-[var(--text-muted)]">← Drag to compare →</p>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] cursor-col-resize select-none"
        style={{ aspectRatio: '16/9', maxHeight: 320 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        <img
          src={editedImage}
          alt="Edited result"
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
        />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
          <img
            src={originalImage}
            alt="Original"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ width: `${10000 / sliderPos}%`, maxWidth: 'none' }}
            draggable={false}
          />
        </div>
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
          style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xl">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5">
              <path d="M8 3L4 7l4 4M16 3l4 4-4 4" />
            </svg>
          </div>
        </div>
        <div className="absolute top-3 left-3 text-xs font-medium text-white bg-black/50 px-2 py-1 rounded-full">
          Before
        </div>
        <div className="absolute top-3 right-3 text-xs font-medium text-white bg-black/50 px-2 py-1 rounded-full">
          After
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="gradient"
          size="md"
          onClick={() => downloadBase64Image(editedImage, 'pixelmind-result.png')}
          icon={<span>⬇️</span>}
        >
          Download
        </Button>
        <Button variant="secondary" size="md" onClick={onEditAgain} icon={<span>✏️</span>}>
          Edit Again
        </Button>
        <Button variant="ghost" size="md" onClick={handleShare} icon={<span>🔗</span>}>
          Copy Link
        </Button>
      </div>
    </motion.div>
  );
}
