import type { Metadata } from 'next';
import { EditorPage } from '@/components/editor-page';

export const metadata: Metadata = {
  title: 'Editor — PixelMind AI',
  description: 'AI image editing workspace — remove objects, transfer styles, upscale and more',
};

export default function Page() {
  return <EditorPage />;
}
