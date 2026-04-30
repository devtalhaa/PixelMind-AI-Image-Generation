'use client';

import { useEffect, useRef, useState } from 'react';
import { useCanvas } from '@/hooks/use-canvas';
import { useEditorStore } from '@/store';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { DEFAULT_BRUSH_SIZE, MAX_BRUSH_SIZE, MIN_BRUSH_SIZE } from '@/lib/constants';

interface ImageCanvasProps {
  requiresMask: boolean;
  onMaskReady: (getMask: () => string | null) => void;
}

export function ImageCanvas({ requiresMask, onMaskReady }: ImageCanvasProps) {
  const { originalImage } = useEditorStore();
  const { canvasRef, initCanvas, startDrawing, draw, stopDrawing, getMaskBase64, clearMask, brushSize } = useCanvas();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [localBrushSize, setLocalBrushSize] = useState(DEFAULT_BRUSH_SIZE);
  const [zoom, setZoom] = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    onMaskReady(getMaskBase64);
  }, [getMaskBase64, onMaskReady]);

  useEffect(() => {
    if (!originalImage) { setImgLoaded(false); return; }
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      initCanvas(img, img.naturalWidth, img.naturalHeight);
      setImgLoaded(true);
    };
    img.src = originalImage;
  }, [originalImage, initCanvas]);

  const handleBrushChange = (val: number) => {
    setLocalBrushSize(val);
    brushSize.current = val;
  };

  if (!originalImage) return null;

  return (
    <div className="flex flex-col gap-3 h-full">
      {requiresMask && (
        <div className="flex items-center gap-4 px-2 py-2 bg-[var(--bg-card)] rounded-[var(--radius-md)] border border-[var(--border)]">
          <div className="flex-1">
            <Slider
              label="Brush Size"
              min={MIN_BRUSH_SIZE}
              max={MAX_BRUSH_SIZE}
              value={localBrushSize}
              onChange={handleBrushChange}
              step={2}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}>
              +
            </Button>
            <span className="text-xs text-[var(--text-muted)] w-10 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}>
              −
            </Button>
            <Button variant="secondary" size="sm" onClick={clearMask}>
              Clear Mask
            </Button>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto rounded-[var(--radius-md)] bg-[var(--bg-secondary)] border border-[var(--border)]"
        style={{ minHeight: 300 }}
      >
        <div
          className="relative inline-block"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform 0.2s' }}
        >
          {imgLoaded && imageRef.current && (
            <img
              src={originalImage}
              alt="Editing canvas"
              style={{ display: 'block', maxWidth: 'none', userSelect: 'none' }}
              draggable={false}
            />
          )}
          {requiresMask && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0"
              style={{
                cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${localBrushSize}' height='${localBrushSize}' viewBox='0 0 ${localBrushSize} ${localBrushSize}'%3E%3Ccircle cx='${localBrushSize / 2}' cy='${localBrushSize / 2}' r='${localBrushSize / 2 - 1}' fill='rgba(239,68,68,0.5)' stroke='%23ef4444' stroke-width='1'/%3E%3C/svg%3E") ${localBrushSize / 2} ${localBrushSize / 2}, crosshair`,
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          )}
        </div>
      </div>

      {requiresMask && (
        <p className="text-xs text-[var(--text-muted)] text-center">
          🖌️ Paint red over the area you want edited — the AI will process that region
        </p>
      )}
    </div>
  );
}
