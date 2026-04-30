import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const colabUrl = searchParams.get('colabUrl');

  let colabConnected = false;

  if (colabUrl) {
    try {
      const endpoint = colabUrl.endsWith('/') ? `${colabUrl}health` : `${colabUrl}/health`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(endpoint, {
        signal: controller.signal,
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data: { status?: string } = await res.json();
        colabConnected = data.status === 'online';
      }
    } catch {
      colabConnected = false;
    }
  }

  return NextResponse.json({
    status: 'online',
    colabConnected,
    timestamp: new Date().toISOString(),
  });
}
