'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store';
import { useImageEditor } from '@/hooks/use-image-editor';
import { ToolPanel } from '@/components/tool-panel';
import { UploadZone } from '@/components/upload-zone';
import { ImageCanvas } from '@/components/image-canvas';
import { ResultPreview } from '@/components/result-preview';
import { ProgressIndicator } from '@/components/progress-indicator';
import { Textarea } from '@/components/ui/textarea';
import { InputField } from '@/components/ui/input-field';
import { Button } from '@/components/ui/button';
import { OperationSettings } from '@/components/tool-panel/operation-settings';
import { Dialog } from '@/components/ui/dialog';
import { OPERATIONS } from '@/lib/constants';
import type { OperationType } from '@/types';

export function EditorPage() {
  const {
    originalImage,
    editedImage,
    selectedOperation,
    isProcessing,
    processingProgress,
    processingMessage,
    colabUrl,
    selectOperation,
    applyEdit,
    resetAll,
  } = useImageEditor();

  const { 
    operationParams, 
    setOperationParam, 
    showColabDialog, 
    setShowColabDialog, 
    setColabUrl, 
    checkColabConnection, 
    isColabConnected 
  } = useEditorStore();

  const getMaskRef = useRef<(() => string | null) | null>(null);
  const [colabInput, setColabInput] = useState(colabUrl);
  const [checkingColab, setCheckingColab] = useState(false);

  const handleMaskReady = useCallback((fn: () => string | null) => {
    getMaskRef.current = fn;
  }, []);

  const handleApply = () => {
    applyEdit(() => getMaskRef.current?.() ?? null);
  };

  const handleSaveColab = async () => {
    setColabUrl(colabInput);
    setCheckingColab(true);
    await checkColabConnection();
    setCheckingColab(false);
    setShowColabDialog(false);
  };

  const opInfo = OPERATIONS.find((o) => o.id === selectedOperation);

  return (
    <div className="flex h-screen pt-16 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-64 flex-shrink-0 overflow-y-auto">
        <ToolPanel onOperationSelect={(op: OperationType) => selectOperation(op)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden border-l border-r border-[var(--border)]">
        <div className="flex-1 overflow-y-auto p-5">
          {isProcessing ? (
            <div className="flex items-center justify-center h-full">
              <ProgressIndicator progress={processingProgress} message={processingMessage} />
            </div>
          ) : editedImage && originalImage ? (
            <div className="flex flex-col gap-5 h-full">
              <ResultPreview
                originalImage={originalImage}
                editedImage={editedImage}
                onEditAgain={resetAll}
              />
            </div>
          ) : originalImage ? (
            <div className="flex gap-5 h-full">
              <div className="flex flex-col flex-1 min-w-0 gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
                    {opInfo ? `${opInfo.icon} ${opInfo.label}` : 'Select an operation to start'}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={resetAll}>
                    ✕ Remove Image
                  </Button>
                </div>
                <div className="flex-1">
                  <ImageCanvas
                    requiresMask={opInfo?.requiresMask ?? false}
                    onMaskReady={handleMaskReady}
                  />
                </div>

                {['text-to-edit', 'generate-image'].includes(selectedOperation || '') && (
                  <div className="flex-shrink-0">
                    <Textarea
                      label={selectedOperation === 'generate-image' ? 'Image prompt' : 'Describe your edit'}
                      placeholder={selectedOperation === 'generate-image' ? 'e.g. A futuristic city at sunset, cyberpunk...' : 'e.g. Make the sky look like sunset...'}
                      value={operationParams.prompt ?? ''}
                      onChange={(val) => setOperationParam('prompt', val)}
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div className="w-64 flex-shrink-0 flex flex-col gap-4 border-l border-[var(--border)] pl-5 overflow-y-auto">
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex-shrink-0">
                  Settings
                </h3>
                <OperationSettings />

                {['text-to-edit', 'style-transfer', 'precision-edit'].includes(selectedOperation || '') && (
                  <div className="flex-shrink-0">
                    <Textarea
                      label="Negative Prompt (What to avoid)"
                      placeholder="e.g. blurry, cartoon, extra fingers, dark lighting"
                      value={operationParams.negativePrompt ?? ''}
                      onChange={(val) => setOperationParam('negativePrompt', val)}
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : selectedOperation === 'generate-image' ? (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto w-full gap-5">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">✨ Generate New Image</h2>
                <p className="text-[var(--text-muted)]">Describe what you want to see, and Google Gemini will create it.</p>
              </div>
              <div className="w-full bg-[var(--bg-card)] p-5 rounded-[var(--radius-lg)] border border-[var(--border)] shadow-lg">
                <Textarea
                  label="Prompt"
                  placeholder="e.g. A cinematic shot of a futuristic cyberpunk city at neon glowing sunset"
                  value={operationParams.prompt ?? ''}
                  onChange={(val) => setOperationParam('prompt', val)}
                  rows={5}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-full max-w-lg">
                <UploadZone />
              </div>
            </div>
          )}
        </div>

        {(originalImage || selectedOperation === 'generate-image') && !editedImage && !isProcessing && (
          <div className="flex-shrink-0 border-t border-[var(--border)] px-5 py-4 flex items-center justify-between gap-4 bg-[var(--bg-secondary)]">
            <div>
              {opInfo && (
                <p className="text-xs text-[var(--text-muted)]">
                  Estimated time: <span className="text-[var(--text-secondary)] font-medium">{opInfo.estimatedTime}</span>
                </p>
              )}
              {!colabUrl && selectedOperation !== 'generate-image' && (
                <p className="text-xs text-[var(--accent-orange)]">⚠️ No backend connected</p>
              )}
            </div>
            <Button
              variant="gradient"
              size="lg"
              loading={isProcessing}
              disabled={!selectedOperation}
              onClick={handleApply}
              icon={<span>✨</span>}
            >
              {selectedOperation === 'generate-image' ? 'Generate Image' : 'Apply AI Edit'}
            </Button>
          </div>
        )}
      </div>

      <div className="w-px bg-[var(--border)]" />

      <Dialog
        isOpen={showColabDialog}
        onClose={() => setShowColabDialog(false)}
        title="Connect Colab Backend"
        size="md"
      >
        <div className="flex flex-col gap-5">
          <div className="p-4 rounded-[var(--radius-md)] bg-blue-950/40 border border-blue-900/60">
            <p className="text-sm text-blue-300 font-medium mb-2">📋 Quick Setup</p>
            <ol className="flex flex-col gap-1.5 text-sm text-[var(--text-secondary)]">
              <li>1. Open <a href="https://colab.research.google.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-blue)] underline">colab.research.google.com</a></li>
              <li>2. Upload <code className="text-xs bg-[var(--bg-secondary)] px-1 rounded">colab_backend.ipynb</code></li>
              <li>3. Set Runtime → GPU (T4)</li>
              <li>4. Run all cells — copy the ngrok URL printed at the end</li>
              <li>5. Paste URL below and click Save</li>
            </ol>
          </div>

          <InputField
            label="Ngrok URL from Colab"
            placeholder="https://xxxx.ngrok-free.app"
            value={colabInput}
            onChange={setColabInput}
          />

          {isColabConnected && (
            <p className="text-sm text-[var(--accent-green)]">✓ Backend connected successfully!</p>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" size="md" onClick={() => setShowColabDialog(false)} fullWidth>
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="md"
              loading={checkingColab}
              onClick={handleSaveColab}
              disabled={!colabInput}
              fullWidth
            >
              Save & Connect
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
