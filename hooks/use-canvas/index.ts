import { useRef, useCallback, useEffect } from 'react';
import { DEFAULT_BRUSH_SIZE } from '@/lib/constants';

interface UseCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  initCanvas: (imageElement: HTMLImageElement, width: number, height: number) => void;
  startDrawing: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  getMaskBase64: () => string | null;
  clearMask: () => void;
  brushSize: React.MutableRefObject<number>;
}

export function useCanvas(): UseCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const brushSize = useRef(DEFAULT_BRUSH_SIZE);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const initCanvas = useCallback(
    (imageElement: HTMLImageElement, width: number, height: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
    },
    []
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      isDrawing.current = true;
      const pos = getPos(e, canvas);
      lastPos.current = pos;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize.current / 2, 0, Math.PI * 2);
      ctx.fill();
    },
    []
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const pos = getPos(e, canvas);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = brushSize.current;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (lastPos.current) {
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
      lastPos.current = pos;
    },
    []
  );

  const stopDrawing = useCallback(() => {
    isDrawing.current = false;
    lastPos.current = null;
  }, []);

  const getMaskBase64 = useCallback((): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasContent = imageData.data.some((v, i) => i % 4 === 3 && v > 0);
    if (!hasContent) return null;
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return null;
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] > 0) {
        const x = ((i - 3) / 4) % canvas.width;
        const y = Math.floor((i - 3) / 4 / canvas.width);
        maskCtx.fillStyle = 'white';
        maskCtx.fillRect(x, y, 1, 1);
      }
    }
    return maskCanvas.toDataURL('image/png');
  }, []);

  const clearMask = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    return () => {
      isDrawing.current = false;
    };
  }, []);

  return { canvasRef, initCanvas, startDrawing, draw, stopDrawing, getMaskBase64, clearMask, brushSize };
}
