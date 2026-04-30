import { NextRequest, NextResponse } from 'next/server';

const TIMEOUT_MS = 90000;

export async function POST(req: NextRequest) {
  try {
    const body: {
      imageBase64?: string;
      operation?: string;
      params?: Record<string, unknown>;
      maskBase64?: string;
      colabUrl?: string;
    } = await req.json();

    const { imageBase64, operation, params = {}, maskBase64, colabUrl } = body;

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }
    if (!operation) {
      return NextResponse.json({ success: false, error: 'No operation specified' }, { status: 400 });
    }
    if (!colabUrl) {
      return NextResponse.json({ success: false, error: 'No Colab backend URL provided' }, { status: 400 });
    }

    const endpoint = colabUrl.endsWith('/') ? `${colabUrl}process` : `${colabUrl}/process`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let colabResponse: Response;
    try {
      colabResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          image_base64: imageBase64,
          operation,
          params,
          mask_base64: maskBase64 ?? null,
        }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      if (isAbort) {
        return NextResponse.json(
          { success: false, error: 'Request timed out after 90 seconds' },
          { status: 408 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Colab backend is offline or unreachable' },
        { status: 503 }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!colabResponse.ok) {
      const errorText = await colabResponse.text().catch(() => 'Unknown error');
      return NextResponse.json(
        { success: false, error: `Colab error ${colabResponse.status}: ${errorText}` },
        { status: 502 }
      );
    }

    const data: { success?: boolean; result_base64?: string; processing_time?: number; error?: string } =
      await colabResponse.json();

    if (!data.success || !data.result_base64) {
      return NextResponse.json(
        { success: false, error: data.error ?? 'Processing failed on backend' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      resultBase64: data.result_base64,
      processingTime: data.processing_time ?? 0,
      operation,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
