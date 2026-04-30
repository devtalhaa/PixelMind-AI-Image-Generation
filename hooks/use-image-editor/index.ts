import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useEditorStore } from '@/store';
import type { OperationType } from '@/types';
import { OPERATIONS } from '@/lib/constants';

interface UseImageEditorReturn {
  originalImage: string | null;
  editedImage: string | null;
  selectedOperation: OperationType | null;
  isProcessing: boolean;
  processingProgress: number;
  processingMessage: string;
  isColabConnected: boolean;
  colabUrl: string;
  maskData: string | null;
  selectOperation: (op: OperationType) => void;
  applyEdit: (getMask: () => string | null) => Promise<void>;
  resetAll: () => void;
}

export function useImageEditor(): UseImageEditorReturn {
  const {
    originalImage,
    editedImage,
    selectedOperation,
    isProcessing,
    processingProgress,
    processingMessage,
    isColabConnected,
    colabUrl,
    maskData,
    setOperation,
    setMask,
    processImage,
    generateNewImage,
    resetEditor,
  } = useEditorStore();

  const selectOperation = useCallback(
    (op: OperationType) => {
      setOperation(op);
    },
    [setOperation]
  );

  const applyEdit = useCallback(
    async (getMask: () => string | null) => {
      if (!selectedOperation) {
        toast.error('Please select an operation');
        return;
      }
      
      if (selectedOperation === 'generate-image') {
        try {
          await generateNewImage();
          toast.success('Image generated successfully!');
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Generation failed');
        }
        return;
      }
      
      if (!originalImage) {
        toast.error('Please upload an image first');
        return;
      }

      if (!colabUrl) {
        toast.error('Connect your Colab backend first');
        useEditorStore.getState().setShowColabDialog(true);
        return;
      }

      const opInfo = OPERATIONS.find((o) => o.id === selectedOperation);
      if (opInfo?.requiresMask) {
        const mask = getMask();
        if (!mask) {
          toast.error('Please draw a mask on the area to edit');
          return;
        }
        setMask(mask);
      }

      try {
        await processImage();
        toast.success('Edit applied successfully!');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Processing failed';
        if (message.includes('timed out') || message.includes('90 seconds')) {
          toast.error('Timeout — try a smaller image or simpler operation');
        } else if (message.includes('offline') || message.includes('fetch')) {
          toast.error('Colab backend is offline — check your connection');
        } else {
          toast.error(message);
        }
      }
    },
    [originalImage, selectedOperation, colabUrl, setMask, processImage, generateNewImage]
  );

  const resetAll = useCallback(() => {
    resetEditor();
  }, [resetEditor]);

  return {
    originalImage,
    editedImage,
    selectedOperation,
    isProcessing,
    processingProgress,
    processingMessage,
    isColabConnected,
    colabUrl,
    maskData,
    selectOperation,
    applyEdit,
    resetAll,
  };
}
