import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body: { imageBase64?: string; colabUrl?: string } = await req.json();
    const { imageBase64, colabUrl } = body;

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }

    const removebgKey = process.env.REMOVEBG_API_KEY;

    if (removebgKey) {
      try {
        const base64Clean = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        const formData = new FormData();
        formData.append('image_file_b64', base64Clean);
        formData.append('size', 'auto');

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: { 'X-Api-Key': removebgKey },
          body: formData,
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const base64 =
            'data:image/png;base64,' +
            Buffer.from(arrayBuffer).toString('base64');
          return NextResponse.json({ success: true, resultBase64: base64, processingTime: 5000 });
        }
      } catch {
        // fall through to Colab
      }
    }

    if (!colabUrl) {
      return NextResponse.json(
        { success: false, error: 'No Colab backend URL and no remove.bg API key configured' },
        { status: 400 }
      );
    }

    const endpoint = colabUrl.endsWith('/') ? `${colabUrl}process` : `${colabUrl}/process`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    let colabRes: Response;
    try {
      colabRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: imageBase64, operation: 'remove-background', params: {} }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      return NextResponse.json(
        { success: false, error: isAbort ? 'Request timed out' : 'Colab backend unreachable' },
        { status: isAbort ? 408 : 503 }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!colabRes.ok) {
      return NextResponse.json({ success: false, error: `Colab error: ${colabRes.status}` }, { status: 502 });
    }

    const data: { success?: boolean; result_base64?: string; processing_time?: number; error?: string } =
      await colabRes.json();

    if (!data.success || !data.result_base64) {
      return NextResponse.json({ success: false, error: data.error ?? 'Processing failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, resultBase64: data.result_base64, processingTime: data.processing_time });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
