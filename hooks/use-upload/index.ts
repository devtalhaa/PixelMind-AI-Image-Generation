import { useState, useCallback } from 'react';
import { fileToBase64, isValidImageFile, formatFileSize } from '@/lib/utils';
import { MAX_IMAGE_SIZE_BYTES } from '@/lib/constants';

interface UseUploadReturn {
  isDragging: boolean;
  error: string | null;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validateAndProcess: (file: File) => Promise<{ base64: string; file: File } | null>;
}

export function useUpload(onFile: (file: File, base64: string) => void): UseUploadReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndProcess = useCallback(
    async (file: File): Promise<{ base64: string; file: File } | null> => {
      setError(null);
      if (!isValidImageFile(file)) {
        setError('Unsupported file type. Please use JPEG, PNG, or WebP.');
        return null;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setError(`File too large (${formatFileSize(file.size)}). Maximum is 10 MB.`);
        return null;
      }
      try {
        const base64 = await fileToBase64(file);
        return { base64, file };
      } catch {
        setError('Failed to read file. Please try again.');
        return null;
      }
    },
    []
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const result = await validateAndProcess(file);
      if (result) onFile(result.file, result.base64);
    },
    [validateAndProcess, onFile]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const result = await validateAndProcess(file);
      if (result) onFile(result.file, result.base64);
      e.target.value = '';
    },
    [validateAndProcess, onFile]
  );

  return {
    isDragging,
    error,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileInput,
    validateAndProcess,
  };
}
