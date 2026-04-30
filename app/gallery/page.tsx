import type { Metadata } from 'next';
import { GalleryPage } from '@/components/gallery-page';

export const metadata: Metadata = {
  title: 'Gallery — PixelMind AI',
  description: 'Browse your AI-edited image history',
};

export default function Page() {
  return <GalleryPage />;
}
