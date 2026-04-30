import type { ApiResponse, ProcessImageParams } from '@/types';
import { REQUEST_TIMEOUT_MS } from '@/lib/constants';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out after 90 seconds')), ms)
    ),
  ]);
}

async function safeFetch(url: string, options: RequestInit): Promise<Response> {
  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
    try {
      const response = await withTimeout(fetch(url, options), REQUEST_TIMEOUT_MS);
      if (response.status === 408) throw new Error('Request timed out after 90 seconds');
      return response;
    } catch (err) {
      attempts++;
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('timed out') || attempts >= maxAttempts) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 800));
    }
  }
  throw new Error('Failed after retries');
}

export async function checkColabHealth(colabUrl: string): Promise<boolean> {
  try {
    const response = await withTimeout(
      fetch(`/api/health?colabUrl=${encodeURIComponent(colabUrl)}`),
      12000
    );
    if (!response.ok) return false;
    const data: { colabConnected?: boolean } = await response.json();
    return data.colabConnected === true;
  } catch {
    return false;
  }
}

export async function processImage(params: ProcessImageParams): Promise<ApiResponse> {
  try {
    const response = await safeFetch('/api/process-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data: ApiResponse = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error ?? `Server error: ${response.status}` };
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return { success: false, error: message };
  }
}

export async function removeBackground(imageBase64: string): Promise<ApiResponse> {
  try {
    const response = await safeFetch('/api/remove-background', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
    });
    const data: ApiResponse = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error ?? `Server error: ${response.status}` };
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return { success: false, error: message };
  }
}

export async function checkHealth(colabUrl: string): Promise<{ colabConnected: boolean; timestamp: string }> {
  try {
    const response = await withTimeout(
      fetch(`/api/health?colabUrl=${encodeURIComponent(colabUrl)}`),
      15000
    );
    const data: { colabConnected?: boolean; timestamp?: string } = await response.json();
    return {
      colabConnected: data.colabConnected ?? false,
      timestamp: data.timestamp ?? new Date().toISOString(),
    };
  } catch {
    return { colabConnected: false, timestamp: new Date().toISOString() };
  }
}

export async function generateImage(prompt: string): Promise<ApiResponse> {
  try {
    const response = await safeFetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data: ApiResponse = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error ?? `Server error: ${response.status}` };
    }
    return data;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error occurred';
    return { success: false, error: msg };
  }
}
