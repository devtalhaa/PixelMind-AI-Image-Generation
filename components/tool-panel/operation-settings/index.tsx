'use client';

import { useCallback } from 'react';
import { useEditorStore } from '@/store';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { STYLE_PRESETS } from '@/lib/constants';
import { debounce } from '@/lib/utils';
import type { StylePreset } from '@/types';

export function OperationSettings() {
  const { selectedOperation, operationParams, setOperationParam } = useEditorStore();

  const debouncedSetParam = useCallback(
    debounce(<K extends keyof typeof operationParams>(key: K, value: (typeof operationParams)[K]) => {
      setOperationParam(key, value);
    }, 300),
    [setOperationParam]
  );

  if (!selectedOperation) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-2xl">
          ⚙️
        </div>
        <p className="text-sm text-[var(--text-muted)]">Select an operation to see settings</p>
      </div>
    );
  }

  if (selectedOperation === 'style-transfer') {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Style Preset</h3>
        <div className="grid grid-cols-2 gap-2">
          {STYLE_PRESETS.map((preset) => {
            const isSelected = operationParams.style === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setOperationParam('style', preset.id as StylePreset)}
                className={[
                  'flex flex-col items-center gap-2 p-2 rounded-[var(--radius-md)] border transition-all duration-200',
                  isSelected
                    ? 'border-[var(--accent-blue)] shadow-[var(--shadow-glow)]'
                    : 'border-[var(--border)] hover:border-[var(--border-active)]',
                ].join(' ')}
              >
                <div
                  className="w-full h-14 rounded-[var(--radius-sm)]"
                  style={{ background: preset.gradient }}
                />
                <span className="text-xs text-[var(--text-secondary)] font-medium">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (selectedOperation === 'upscale') {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Scale Factor</h3>
        <div className="flex gap-3">
          {([2, 4] as const).map((factor) => {
            const isSelected = operationParams.upscaleFactor === factor;
            return (
              <button
                key={factor}
                type="button"
                onClick={() => setOperationParam('upscaleFactor', factor)}
                className={[
                  'flex-1 py-3 rounded-[var(--radius-md)] text-sm font-semibold border transition-all duration-200',
                  isSelected
                    ? 'border-[var(--accent-blue)] bg-[var(--accent-blue)] text-white shadow-[var(--shadow-glow)]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-active)]',
                ].join(' ')}
              >
                {factor}×
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          {operationParams.upscaleFactor === 4
            ? '4× upscale — best for small images, longer processing'
            : '2× upscale — faster, good for most images'}
        </p>
      </div>
    );
  }

  if (selectedOperation === 'color-enhance') {
    const sliders: { key: keyof typeof operationParams; label: string }[] = [
      { key: 'brightness', label: 'Brightness' },
      { key: 'contrast', label: 'Contrast' },
      { key: 'saturation', label: 'Saturation' },
      { key: 'temperature', label: 'Temperature' },
    ];
    return (
      <div className="flex flex-col gap-5">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Adjustments</h3>
        {sliders.map(({ key, label }) => (
          <Slider
            key={key}
            label={label}
            min={-100}
            max={100}
            step={1}
            value={(operationParams[key] as number) ?? 0}
            onChange={(val) => debouncedSetParam(key, val)}
          />
        ))}
      </div>
    );
  }

  if (selectedOperation === 'text-to-edit') {
    return (
      <div className="flex flex-col gap-5">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Instruction Controls</h3>
        <Slider
          label="Text Guidance"
          min={1}
          max={15}
          step={0.5}
          value={operationParams.guidanceScale ?? 7.5}
          onChange={(val) => debouncedSetParam('guidanceScale', val)}
        />
        <Slider
          label="Image Preservation"
          min={1}
          max={3}
          step={0.1}
          value={operationParams.imageGuidanceScale ?? 1.5}
          onChange={(val) => debouncedSetParam('imageGuidanceScale', val)}
        />
        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--bg-card)] border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            💡 Type a plain instruction in the field below, e.g. <span className="text-[var(--text-secondary)]">"make him have a beard"</span> or <span className="text-[var(--text-secondary)]">"change the sky to sunset"</span>.
          </p>
        </div>
      </div>
    );
  }

  const instructionMap: Record<string, { title: string; steps: string[] }> = {
    'generate-image': {
      title: 'Generate Image Tips',
      steps: [
        'Powered by Google Gemini (Imagen 3)',
        'Describe the subject, lighting, style, and camera angle',
        'Once generated, you can edit it with Colab tools',
      ],
    },
    'precision-edit': {
      title: 'How Precision Edit Works',
      steps: [
        'Type what you want changed (e.g. "modern leather couch")',
        'Paint a mask over the area — or leave blank for SAM auto-detect',
        'Unmasked areas stay pixel-perfect',
        'Click "Apply AI Edit" to run SDXL inpainting',
      ],
    },
    'face-restoration': {
      title: 'Face Restoration Tips',
      steps: [
        'Works best on portrait or close-up photos',
        'Ensure the face is clearly visible',
        'SDXL passes enhance skin, eyes and sharpness',
      ],
    },
    'remove-background': {
      title: 'Background Removal',
      steps: [
        'Works automatically — no mask needed',
        'Best results on clear subject vs background',
        'Result will have transparent background (PNG)',
      ],
    },
  };

  const info = instructionMap[selectedOperation];
  if (info) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{info.title}</h3>
        <ol className="flex flex-col gap-3">
          {info.steps.map((step, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--accent-blue)] text-white text-xs flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <p className="text-sm text-[var(--text-secondary)]">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return null;
}
