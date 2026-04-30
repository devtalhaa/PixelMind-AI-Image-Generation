import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OperationType, OperationParams, HistoryItem } from '@/types';
import { checkColabHealth, processImage } from '@/lib/api';
import { compressImage, generateId } from '@/lib/utils';
import {
  COLAB_URL_STORAGE_KEY,
  GALLERY_STORAGE_KEY,
  COLOR_SLIDER_DEFAULTS,
} from '@/lib/constants';

interface EditorStore {
  originalImage: string | null;
  editedImage: string | null;
  imageFile: File | null;
  selectedOperation: OperationType | null;
  maskData: string | null;
  operationParams: OperationParams;
  colabUrl: string;
  isColabConnected: boolean;
  isProcessing: boolean;
  processingProgress: number;
  processingMessage: string;
  history: HistoryItem[];
  showColabDialog: boolean;

  setImage: (file: File, base64: string) => void;
  setOperation: (op: OperationType) => void;
  setMask: (mask: string | null) => void;
  setColabUrl: (url: string) => void;
  setOperationParam: <K extends keyof OperationParams>(key: K, value: OperationParams[K]) => void;
  resetOperationParams: () => void;
  checkColabConnection: () => Promise<void>;
  processImage: () => Promise<void>;
  generateNewImage: () => Promise<void>;
  resetEditor: () => void;
  addToHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
  setShowColabDialog: (show: boolean) => void;
}

const defaultParams: OperationParams = {
  ...COLOR_SLIDER_DEFAULTS,
  upscaleFactor: 2,
  style: 'anime',
  prompt: '',
  negativePrompt: '',
  guidanceScale: 7.5,
  imageGuidanceScale: 1.5,
};

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      originalImage: null,
      editedImage: null,
      imageFile: null,
      selectedOperation: null,
      maskData: null,
      operationParams: { ...defaultParams },
      colabUrl: '',
      isColabConnected: false,
      isProcessing: false,
      processingProgress: 0,
      processingMessage: '',
      history: [],
      showColabDialog: false,

      setImage: (file, base64) => {
        set({
          imageFile: file,
          originalImage: base64,
          editedImage: null,
          maskData: null,
        });
      },

      setOperation: (op) => {
        set({ selectedOperation: op, editedImage: null, maskData: null });
      },

      setMask: (mask) => set({ maskData: mask }),

      setColabUrl: (url) => {
        localStorage.setItem(COLAB_URL_STORAGE_KEY, url);
        set({ colabUrl: url, isColabConnected: false });
      },

      setOperationParam: (key, value) => {
        set((state) => ({
          operationParams: { ...state.operationParams, [key]: value },
        }));
      },

      resetOperationParams: () => set({ operationParams: { ...defaultParams } }),

      checkColabConnection: async () => {
        const { colabUrl } = get();
        if (!colabUrl) { set({ isColabConnected: false }); return; }
        const connected = await checkColabHealth(colabUrl);
        set({ isColabConnected: connected });
      },

      processImage: async () => {
        const state = get();
        if (!state.originalImage) return;
        if (!state.selectedOperation) return;
        if (!state.colabUrl) {
          set({ showColabDialog: true });
          return;
        }

        set({
          isProcessing: true,
          processingProgress: 10,
          processingMessage: 'Compressing image...',
          editedImage: null,
        });

        const startTime = Date.now();
        try {
          const compressed = await compressImage(state.originalImage);

          set({ processingProgress: 25, processingMessage: 'Connecting to backend...' });

          const result = await processImage({
            imageBase64: compressed,
            operation: state.selectedOperation,
            params: state.operationParams,
            maskBase64: state.maskData ?? undefined,
            colabUrl: state.colabUrl,
          });

          if (!result.success || !result.resultBase64) {
            throw new Error(result.error ?? 'Processing failed');
          }

          set({ processingProgress: 90, processingMessage: 'Finishing up...' });

          const processingTime = Date.now() - startTime;
          const historyItem: HistoryItem = {
            id: generateId(),
            originalImage: state.originalImage,
            editedImage: result.resultBase64,
            operation: state.selectedOperation,
            timestamp: Date.now(),
            processingTime,
          };

          set({
            editedImage: result.resultBase64,
            processingProgress: 100,
            processingMessage: 'Done!',
            history: [historyItem, ...state.history].slice(0, 50),
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          throw new Error(message);
        } finally {
          set({ isProcessing: false, processingProgress: 0, processingMessage: '' });
        }
      },

      generateNewImage: async () => {
        const state = get();
        if (!state.operationParams.prompt) {
          throw new Error('Please enter a prompt to generate an image');
        }

        set({
          isProcessing: true,
          processingProgress: 20,
          processingMessage: 'Generating image with Gemini AI...',
          editedImage: null,
        });

        const startTime = Date.now();
        try {
          const { generateImage } = await import('@/lib/api');
          const result = await generateImage(state.operationParams.prompt);

          if (!result.success || !result.resultBase64) {
            throw new Error(result.error ?? 'Generation failed');
          }

          set({ processingProgress: 90, processingMessage: 'Finishing up...' });

          const processingTime = Date.now() - startTime;
          const historyItem: HistoryItem = {
            id: generateId(),
            originalImage: '',
            editedImage: result.resultBase64,
            operation: 'generate-image',
            timestamp: Date.now(),
            processingTime,
          };

          set({
            originalImage: result.resultBase64,
            editedImage: null,
            maskData: null,
            selectedOperation: null,
            processingProgress: 100,
            processingMessage: 'Image Generated!',
            history: [historyItem, ...state.history].slice(0, 50),
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          throw new Error(message);
        } finally {
          set({ isProcessing: false, processingProgress: 0, processingMessage: '' });
        }
      },

      resetEditor: () => {
        set({
          originalImage: null,
          editedImage: null,
          imageFile: null,
          selectedOperation: null,
          maskData: null,
          operationParams: { ...defaultParams },
          isProcessing: false,
          processingProgress: 0,
          processingMessage: '',
        });
      },

      addToHistory: (item) => {
        set((state) => ({
          history: [item, ...state.history].slice(0, 50),
        }));
      },

      clearHistory: () => set({ history: [] }),

      setShowColabDialog: (show) => set({ showColabDialog: show }),
    }),
    {
      name: GALLERY_STORAGE_KEY,
      partialize: (state) => ({
        colabUrl: state.colabUrl,
        history: state.history,
      }),
    }
  )
);
