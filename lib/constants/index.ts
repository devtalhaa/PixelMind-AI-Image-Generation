import type { OperationInfo, StylePresetInfo } from '@/types';

export const OPERATIONS: OperationInfo[] = [
  {
    id: 'generate-image',
    label: '✨ Generate New Image',
    icon: '✨',
    description: 'Create an entirely new image from text using Google Gemini',
    estimatedTime: '~5s',
    requiresMask: false,
  },
  {
    id: 'precision-edit',
    label: 'Precision Edit',
    icon: '🎯',
    description: 'SAM + SDXL: paint a mask or let AI detect — edit only that area',
    estimatedTime: '~45-60s',
    requiresMask: false,
  },
  {
    id: 'style-transfer',
    label: 'Style Transfer',
    icon: '🖼️',
    description: 'Transform image style using Juggernaut XL SDXL',
    estimatedTime: '~40-50s',
    requiresMask: false,
  },
  {
    id: 'face-restoration',
    label: 'Face Restore',
    icon: '👤',
    description: 'Enhance and restore face details with AI',
    estimatedTime: '~15s',
    requiresMask: false,
  },
  {
    id: 'upscale',
    label: 'Upscale Image',
    icon: '🔍',
    description: 'Increase resolution 2× or 4× with Real-ESRGAN',
    estimatedTime: '~10-15s',
    requiresMask: false,
  },
  {
    id: 'remove-background',
    label: 'Remove Background',
    icon: '✂️',
    description: 'Cleanly remove the image background',
    estimatedTime: '~5s',
    requiresMask: false,
  },
  {
    id: 'color-enhance',
    label: 'Color Enhance',
    icon: '🎨',
    description: 'Adjust brightness, contrast, saturation and temperature',
    estimatedTime: '~2s',
    requiresMask: false,
  },
  {
    id: 'text-to-edit',
    label: 'Text-to-Edit',
    icon: '🖌️',
    description: 'Describe your edit in plain text, AI applies it',
    estimatedTime: '~30-40s',
    requiresMask: false,
  },
];

export const STYLE_PRESETS: StylePresetInfo[] = [
  {
    id: 'anime',
    label: 'Anime',
    gradient: 'linear-gradient(135deg, #f472b6, #a855f7)',
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
  },
  {
    id: 'oil-painting',
    label: 'Oil Paint',
    gradient: 'linear-gradient(135deg, #d97706, #92400e)',
  },
  {
    id: 'watercolor',
    label: 'Watercolor',
    gradient: 'linear-gradient(135deg, #38bdf8, #2dd4bf)',
  },
  {
    id: 'sketch',
    label: 'Sketch',
    gradient: 'linear-gradient(135deg, #9ca3af, #f9fafb)',
  },
  {
    id: 'neon',
    label: 'Neon',
    gradient: 'linear-gradient(135deg, #4ade80, #f472b6)',
  },
];

export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const REQUEST_TIMEOUT_MS = 90000;
export const COMPRESS_MAX_DIMENSION = 1024;
export const COMPRESS_QUALITY = 0.85;
export const COLAB_URL_STORAGE_KEY = 'pixelmind_colab_url';
export const GALLERY_STORAGE_KEY = 'pixelmind_gallery';
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const DEFAULT_BRUSH_SIZE = 24;
export const MIN_BRUSH_SIZE = 4;
export const MAX_BRUSH_SIZE = 80;
export const DEBOUNCE_DELAY_MS = 300;

export const COLOR_SLIDER_DEFAULTS = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
};
